"use server"

import { prisma } from "@/lib/prisma"
import { lessonSchema } from "@/schemas/pronunciation"
import { z } from "zod"
import { revalidatePath } from "next/cache"

// Define return type for consistent server action responses
type ActionResponse = {
  success: boolean
  message?: string
  error?: string
  data?: any
}

/**
 * Server action to create a new pronunciation lesson
 * @param userId - The ID of the user creating the lesson
 * @param formData - The lesson data from the form
 * @returns ActionResponse indicating success or failure
 */
export async function createPronunciationLesson(
  userId: string,
  formData: z.infer<typeof lessonSchema>
): Promise<ActionResponse> {
  try {
    // Validate the form data
    const validatedData = lessonSchema.parse(formData)

    // Create the lesson in the database
    const lesson = await prisma.pronunciationLesson.create({
      data: {
        title: validatedData.title,
        userId,
        words: {
          create: validatedData.words.map(wordItem => ({
            word: wordItem.word,
          })),
        },
      },
    })

    // Revalidate the lessons page to show the new lesson
    revalidatePath("/pronunciation")

    return {
      success: true,
      message: "Lesson created successfully",
      data: lesson,
    }
  } catch (error) {
    console.error("Error creating pronunciation lesson:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid form data. Please check your input and try again.",
      }
    }

    return {
      success: false,
      error: "Failed to create lesson. Please try again later.",
    }
  }
}

/**
 * Get all pronunciation lessons for a specific user
 * @param params - Object containing userId
 * @returns Object containing lessons array and/or error message
 */
export async function getPronunciationLessonsByUserId({
  userId,
}: {
  userId: string
}) {
  try {
    const lessons = await prisma.pronunciationLesson.findMany({
      where: {
        userId,
      },
      include: {
        words: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      data: lessons
    }
  } catch (error) {
    console.error("Error fetching pronunciation lessons:", error)
    return {
      success: false,
      error: "Failed to fetch pronunciation lessons. Please try again later.",
      data: []
    }
  }
}

/**
 * Get a specific pronunciation lesson by ID
 * @param lessonId - The ID of the lesson to fetch
 * @returns Object containing the lesson data and/or error message
 */
export async function getPronunciationLessonById(lessonId: string) {
  try {
    const lesson = await prisma.pronunciationLesson.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        words: true,
      },
    });

    if (!lesson) {
      return {
        success: false,
        error: "Pronunciation lesson not found",
      };
    }

    return {
      success: true,
      data: lesson,
    };
  } catch (error) {
    console.error("Error fetching pronunciation lesson:", error);
    return {
      success: false,
      error: "Failed to fetch pronunciation lesson. Please try again later.",
    };
  }
}

/**
 * Server action to update an existing pronunciation lesson
 * @param lessonId - The ID of the lesson to update
 * @param formData - The updated lesson data from the form
 * @returns ActionResponse indicating success or failure
 */
export async function updatePronunciationLesson(
  lessonId: string,
  formData: z.infer<typeof lessonSchema>
): Promise<ActionResponse> {
  try {
    // Validate the form data
    const validatedData = lessonSchema.parse(formData)

    // First, delete existing words for the lesson
    await prisma.pronunciationWord.deleteMany({
      where: {
        lessonId,
      },
    })

    // Update the lesson and create new words
    const updatedLesson = await prisma.pronunciationLesson.update({
      where: {
        id: lessonId,
      },
      data: {
        title: validatedData.title,
        words: {
          create: validatedData.words.map(wordItem => ({
            word: wordItem.word,
          })),
        },
      },
    })

    // Revalidate the lessons page to show the updated lesson
    revalidatePath("/pronunciation")
    revalidatePath(`/pronunciation/${lessonId}`)

    return {
      success: true,
      message: "Lesson updated successfully",
      data: updatedLesson,
    }
  } catch (error) {
    console.error("Error updating pronunciation lesson:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid form data. Please check your input and try again.",
      }
    }

    return {
      success: false,
      error: "Failed to update lesson. Please try again later.",
    }
  }
}

/**
 * Server action to delete a pronunciation lesson
 * @param lessonId - The ID of the lesson to delete
 * @returns ActionResponse indicating success or failure
 */
export async function deletePronunciationLesson(
  lessonId: string
): Promise<ActionResponse> {
  try {
    // Delete all words associated with the lesson first
    await prisma.pronunciationWord.deleteMany({
      where: {
        lessonId,
      },
    })

    // Now delete the lesson itself
    await prisma.pronunciationLesson.delete({
      where: {
        id: lessonId,
      },
    })

    // Revalidate the lessons page
    revalidatePath("/pronunciation")

    return {
      success: true,
      message: "Lesson deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting pronunciation lesson:", error)
    return {
      success: false,
      error: "Failed to delete lesson. Please try again later.",
    }
  }
}