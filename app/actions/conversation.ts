"use server"

import { prisma } from "@/lib/prisma"
import { conversationTopicSchema } from "@/schemas/conversation"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"


// Define return type for consistent server action responses
type ActionResponse = {
  success: boolean
  message?: string
  error?: string
  data?: any
}

/**
 * Server action to create a new conversation topic
 * @param userId - The ID of the user creating the topic
 * @param formData - The topic data from the form
 * @returns ActionResponse indicating success or failure
 */
export async function createConversationTopic(
  userId: string,
  formData: z.infer<typeof conversationTopicSchema>
): Promise<ActionResponse> {
  try {
    // Validate the form data
    const validatedData = conversationTopicSchema.parse(formData)

    // Create the topic in the database
    const topic = await prisma.conversationTopic.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        userId,
      },
    })

    // Revalidate the entire conversation layout and all nested routes
    revalidatePath("/conversation", "layout")

    return {
      success: true,
      message: "Topic created successfully",
      data: topic,
    }
  } catch (error) {
    console.error("Error creating conversation topic:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid form data. Please check your input and try again.",
      }
    }

    return {
      success: false,
      error: "Failed to create topic. Please try again later.",
    }
  }
}

/**
 * Get all conversation topics for a specific user
 * @param params - Object containing userId
 * @returns Object containing topics array and/or error message
 */
export async function getConversationTopicsByUserId() {
  try {
      const session = await auth()
      
      if (!session?.user?.id) {
        throw new Error("Unauthorized")
      }
    const topics = await prisma.conversationTopic.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      data: topics
    }
  } catch (error) {
    console.error("Error fetching conversation topics:", error)
    return {
      success: false,
      error: "Failed to fetch conversation topics. Please try again later.",
      data: []
    }
  }
}

/**
 * Get a specific conversation topic by ID
 * @param topicId - The ID of the topic to fetch
 * @returns Object containing the topic data and/or error message
 */
export async function getConversationTopicById(topicId: string) {
  try {
    const topic = await prisma.conversationTopic.findUnique({
      where: {
        id: topicId,
      },
    });

    if (!topic) {
      return {
        success: false,
        error: "Conversation topic not found",
      };
    }

    return {
      success: true,
      data: topic,
    };
  } catch (error) {
    console.error("Error fetching conversation topic:", error);
    return {
      success: false,
      error: "Failed to fetch conversation topic. Please try again later.",
    };
  }
}

/**
 * Server action to update an existing conversation topic
 * @param topicId - The ID of the topic to update
 * @param formData - The updated topic data from the form
 * @param userId - The ID of the user requesting the update
 * @returns ActionResponse indicating success or failure
 */
export async function updateConversationTopic(
  topicId: string,
  formData: z.infer<typeof conversationTopicSchema>,
  userId: string
): Promise<ActionResponse> {
  try {
    // Validate the form data
    const validatedData = conversationTopicSchema.parse(formData)

    // First fetch the topic to verify ownership
    const topic = await prisma.conversationTopic.findUnique({
      where: {
        id: topicId,
      },
    });

    // Check if topic exists
    if (!topic) {
      return {
        success: false,
        error: "Conversation topic not found",
      };
    }

    // Check if the user is authorized to update this topic
    if (topic.userId !== userId) {
      return {
        success: false,
        error: "You are not authorized to update this topic",
      };
    }

    // Update the topic once ownership is verified
    const updatedTopic = await prisma.conversationTopic.update({
      where: {
        id: topicId,
      },
      data: {
        title: validatedData.title,
        description: validatedData.description,
      },
    })

    // Revalidate the entire conversation layout and all nested routes
    revalidatePath("/conversation", "layout")

    return {
      success: true,
      message: "Topic updated successfully",
      data: updatedTopic,
    }
  } catch (error) {
    console.error("Error updating conversation topic:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid form data. Please check your input and try again.",
      }
    }

    return {
      success: false,
      error: "Failed to update topic. Please try again later.",
    }
  }
}

/**
 * Server action to delete a conversation topic
 * @param topicId - The ID of the topic to delete
 * @param userId - The ID of the user requesting deletion
 * @returns ActionResponse indicating success or failure
 */
export async function deleteConversationTopic(
  topicId: string,
  userId: string
): Promise<ActionResponse> {
  try {
    // First fetch the topic to verify ownership
    const topic = await prisma.conversationTopic.findUnique({
      where: {
        id: topicId,
      },
    });

    // Check if topic exists
    if (!topic) {
      return {
        success: false,
        error: "Conversation topic not found",
      };
    }

    // Check if the user is authorized to delete this topic
    if (topic.userId !== userId) {
      return {
        success: false,
        error: "You are not authorized to delete this topic",
      };
    }

    // Delete the topic once ownership is verified
    await prisma.conversationTopic.delete({
      where: {
        id: topicId,
      },
    });

    // Revalidate the entire conversation layout and all nested routes
    revalidatePath("/conversation", "layout")

    return {
      success: true,
      message: "Topic deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting conversation topic:", error)
    return {
      success: false,
      error: "Failed to delete topic. Please try again later.",
    }
  }
}