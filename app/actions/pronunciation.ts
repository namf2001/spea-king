'use server';

import { prisma } from '@/lib/prisma';
import { lessonSchema } from '@/schemas/pronunciation';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import {
  ApiResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@/types/response';

/**
 * Server action to create a new pronunciation lesson
 * @param formData - The lesson data from the form
 * @returns ApiResponse indicating success or failure
 */
export async function createPronunciationLesson(
  formData: z.infer<typeof lessonSchema>,
): Promise<ApiResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse(
        'AUTH_ERROR',
        'Unauthorized. Please log in to create a lesson.',
      );
    }

    // Validate the form data
    const validatedData = lessonSchema.parse(formData);

    // Create the lesson in the database
    const lesson = await prisma.pronunciationLesson.create({
      data: {
        title: validatedData.title,
        userId: session.user.id,
        words: {
          create: validatedData.words.map((wordItem) => ({
            word: wordItem.word,
          })),
        },
      },
    });

    // Revalidate the lessons page to show the new lesson
    revalidatePath('/pronunciation');

    return createSuccessResponse(lesson, {
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error creating pronunciation lesson:', error);

    if (error instanceof z.ZodError) {
      return createErrorResponse(
        'FORM_VALIDATION_ERROR',
        'Invalid form data. Please check your input and try again.',
      );
    }

    return createErrorResponse(
      'CREATE_LESSON_ERROR',
      'Failed to create lesson. Please try again later.',
    );
  }
}

/**
 * Get all pronunciation lessons for the current user
 * @returns ApiResponse containing lessons array
 */
export async function getPronunciationLessonsByUserId(): Promise<ApiResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse(
        'AUTH_ERROR',
        'Unauthorized. Please log in to view lessons.',
        { data: [] },
      );
    }

    const lessons = await prisma.pronunciationLesson.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        words: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return createSuccessResponse(lessons);
  } catch (error) {
    console.error('Error fetching pronunciation lessons:', error);
    return createErrorResponse(
      'FETCH_LESSONS_ERROR',
      'Failed to fetch pronunciation lessons. Please try again later.',
      { data: [] },
    );
  }
}

/**
 * Get a specific pronunciation lesson by ID
 * @param lessonId - The ID of the lesson to fetch
 * @returns ApiResponse containing the lesson data
 */
export async function getPronunciationLessonById(
  lessonId: string,
): Promise<ApiResponse> {
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
      return createErrorResponse('NOT_FOUND', 'Pronunciation lesson not found');
    }

    return createSuccessResponse(lesson);
  } catch (error) {
    console.error('Error fetching pronunciation lesson:', error);
    return createErrorResponse(
      'FETCH_LESSON_ERROR',
      'Failed to fetch pronunciation lesson. Please try again later.',
    );
  }
}

/**
 * Server action to update an existing pronunciation lesson
 * @param lessonId - The ID of the lesson to update
 * @param formData - The updated lesson data from the form
 * @returns ApiResponse indicating success or failure
 */
export async function updatePronunciationLesson(
  lessonId: string,
  formData: z.infer<typeof lessonSchema>,
): Promise<ApiResponse> {
  try {
    // Validate the form data
    const validatedData = lessonSchema.parse(formData);

    // First, delete existing words for the lesson
    await prisma.pronunciationWord.deleteMany({
      where: {
        lessonId,
      },
    });

    // Update the lesson and create new words
    const updatedLesson = await prisma.pronunciationLesson.update({
      where: {
        id: lessonId,
      },
      data: {
        title: validatedData.title,
        words: {
          create: validatedData.words.map((wordItem) => ({
            word: wordItem.word,
          })),
        },
      },
    });

    // Revalidate the lessons page to show the updated lesson
    revalidatePath('/pronunciation');
    revalidatePath(`/pronunciation/${lessonId}`);

    return createSuccessResponse(updatedLesson, {
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error updating pronunciation lesson:', error);

    if (error instanceof z.ZodError) {
      return createErrorResponse(
        'FORM_VALIDATION_ERROR',
        'Invalid form data. Please check your input and try again.',
      );
    }

    return createErrorResponse(
      'UPDATE_LESSON_ERROR',
      'Failed to update lesson. Please try again later.',
    );
  }
}

/**
 * Server action to delete a pronunciation lesson
 * @param lessonId - The ID of the lesson to delete
 * @returns ApiResponse indicating success or failure
 */
export async function deletePronunciationLesson(
  lessonId: string,
): Promise<ApiResponse> {
  try {
    // Delete all words associated with the lesson first
    await prisma.pronunciationWord.deleteMany({
      where: {
        lessonId,
      },
    });

    // Now delete the lesson itself
    await prisma.pronunciationLesson.delete({
      where: {
        id: lessonId,
      },
    });

    // Revalidate the lessons page
    revalidatePath('/pronunciation');

    return createSuccessResponse(null, {
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error deleting pronunciation lesson:', error);
    return createErrorResponse(
      'DELETE_LESSON_ERROR',
      'Failed to delete lesson. Please try again later.',
    );
  }
}
