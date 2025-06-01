'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { conversationTopicSchema } from '@/schemas/conversation';
import {
  ApiResponse,
  createErrorResponse,
  createSuccessResponse,
} from '@/types/response';

/**
 * Server action to create a new conversation topic
 * @param formData - The topic data from the form
 * @returns ApiResponse indicating success or failure
 */
export async function createConversationTopic(
  formData: z.infer<typeof conversationTopicSchema>,
): Promise<ApiResponse> {
  try {
    // Validate the form data
    const validatedData = conversationTopicSchema.parse(formData);

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Create the topic in the database
    const topic = await prisma.conversationTopic.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        userId,
      },
    });

    // Revalidate the entire conversation layout and all nested routes
    revalidatePath('/conversation', 'layout');

    return createSuccessResponse(topic, {
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error creating conversation topic:', error);

    if (error instanceof z.ZodError) {
      return createErrorResponse(
        'FORM_VALIDATION_ERROR',
        'Invalid form data. Please check your input and try again.',
      );
    }

    return createErrorResponse(
      'CREATE_TOPIC_ERROR',
      'Failed to create topic. Please try again later.',
    );
  }
}

/**
 * Get all conversation topics for a specific user
 * @returns ApiResponse containing topics array
 */
export async function getConversationTopicsByUserId(): Promise<ApiResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return createErrorResponse('AUTH_ERROR', 'Unauthorized');
    }

    const topics = await prisma.conversationTopic.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return createSuccessResponse(topics);
  } catch (error) {
    console.error('Error fetching conversation topics:', error);
    return createErrorResponse(
      'FETCH_TOPICS_ERROR',
      'Failed to fetch conversation topics. Please try again later.',
    );
  }
}

/**
 * Get a specific conversation topic by ID
 * @param topicId - The ID of the topic to fetch
 * @returns ApiResponse containing the topic data
 */
export async function getConversationTopicById(
  topicId: string,
): Promise<ApiResponse> {
  try {
    const topic = await prisma.conversationTopic.findUnique({
      where: {
        id: topicId,
      },
    });

    if (!topic) {
      return createErrorResponse('NOT_FOUND', 'Conversation topic not found');
    }

    return createSuccessResponse(topic);
  } catch (error) {
    console.error('Error fetching conversation topic:', error);
    return createErrorResponse(
      'FETCH_TOPIC_ERROR',
      'Failed to fetch conversation topic. Please try again later.',
    );
  }
}

/**
 * Server action to update an existing conversation topic
 * @param topicId - The ID of the topic to update
 * @param formData - The updated topic data from the form
 * @returns ApiResponse indicating success or failure
 */
export async function updateConversationTopic(
  topicId: string,
  formData: z.infer<typeof conversationTopicSchema>,
): Promise<ApiResponse> {
  try {
    // Validate the form data
    const validatedData = conversationTopicSchema.parse(formData);

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return createErrorResponse('AUTH_ERROR', 'Unauthorized');
    }
    // First fetch the topic to verify ownership
    const topic = await prisma.conversationTopic.findUnique({
      where: {
        id: topicId,
      },
    });

    // Check if topic exists
    if (!topic) {
      return createErrorResponse('NOT_FOUND', 'Conversation topic not found');
    }

    // Check if the user is authorized to update this topic
    if (topic.userId !== userId) {
      return createErrorResponse(
        'AUTH_ERROR',
        'You are not authorized to update this topic',
      );
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
    });

    // Revalidate the entire conversation layout and all nested routes
    revalidatePath('/conversation', 'layout');

    return createSuccessResponse(updatedTopic, {
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error updating conversation topic:', error);

    if (error instanceof z.ZodError) {
      return createErrorResponse(
        'FORM_VALIDATION_ERROR',
        'Invalid form data. Please check your input and try again.',
      );
    }

    return createErrorResponse(
      'UPDATE_TOPIC_ERROR',
      'Failed to update topic. Please try again later.',
    );
  }
}

/**
 * Server action to delete a conversation topic
 * @param topicId - The ID of the topic to delete
 * @param userId - The ID of the user requesting deletion
 * @returns ApiResponse indicating success or failure
 */
export async function deleteConversationTopic(
  topicId: string,
  userId: string,
): Promise<ApiResponse> {
  try {
    // First fetch the topic to verify ownership
    const topic = await prisma.conversationTopic.findUnique({
      where: {
        id: topicId,
      },
    });

    // Check if topic exists
    if (!topic) {
      return createErrorResponse('NOT_FOUND', 'Conversation topic not found');
    }

    // Check if the user is authorized to delete this topic
    if (topic.userId !== userId) {
      return createErrorResponse(
        'AUTH_ERROR',
        'You are not authorized to delete this topic',
      );
    }

    // Delete the topic once ownership is verified
    await prisma.conversationTopic.delete({
      where: {
        id: topicId,
      },
    });

    // Revalidate the entire conversation layout and all nested routes
    revalidatePath('/conversation', 'layout');

    return createSuccessResponse(null, {
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error deleting conversation topic:', error);
    return createErrorResponse(
      'DELETE_TOPIC_ERROR',
      'Failed to delete topic. Please try again later.',
    );
  }
}
