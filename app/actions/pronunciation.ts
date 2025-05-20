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