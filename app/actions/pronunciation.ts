'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { lessonSchema } from '@/schemas/pronunciation';
import {
  ApiResponse,
  createErrorResponse,
  createSuccessResponse,
} from '@/types/response';

// Cache for search results with TTL
const searchCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Clean up expired cache entries
 */
function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of searchCache.entries()) {
    if (now - value.timestamp >= CACHE_TTL) {
      searchCache.delete(key);
    }
  }
}

/**
 * Clear the search cache (useful when new words are added)
 */
export async function clearSearchCache() {
  searchCache.clear();
}

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

    // Create the lesson first
    const lesson = await prisma.pronunciationLesson.create({
      data: {
        title: validatedData.title,
        userId: session.user.id,
      },
    });

    // Process each word: reuse existing or create new
    const wordIds: string[] = [];
    let hasNewWords = false;

    for (const wordItem of validatedData.words) {
      // Check if word already exists
      let existingWord = await prisma.pronunciationWord.findUnique({
        where: { word: wordItem.word },
      });

      // If word doesn't exist, create it
      if (!existingWord) {
        existingWord = await prisma.pronunciationWord.create({
          data: { word: wordItem.word },
        });
        hasNewWords = true;
      }

      wordIds.push(existingWord.id);
    }

    // Create lesson-word relationships
    await prisma.pronunciationLessonWord.createMany({
      data: wordIds.map((wordId) => ({
        lessonId: lesson.id,
        wordId: wordId,
      })),
    });

    // Clear search cache if new words were added
    if (hasNewWords) {
      clearSearchCache();
    }

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
        words: {
          include: {
            word: true,
          },
        },
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
        words: {
          include: {
            word: true,
          },
        },
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

    // Delete existing lesson-word relationships
    await prisma.pronunciationLessonWord.deleteMany({
      where: {
        lessonId,
      },
    });

    // Update lesson title
    const updatedLesson = await prisma.pronunciationLesson.update({
      where: {
        id: lessonId,
      },
      data: {
        title: validatedData.title,
      },
    });

    // Process each word: reuse existing or create new
    const wordIds: string[] = [];
    let hasNewWords = false;

    for (const wordItem of validatedData.words) {
      // Check if word already exists
      let existingWord = await prisma.pronunciationWord.findUnique({
        where: { word: wordItem.word },
      });

      // If word doesn't exist, create it
      if (!existingWord) {
        existingWord = await prisma.pronunciationWord.create({
          data: { word: wordItem.word },
        });
        hasNewWords = true;
      }

      wordIds.push(existingWord.id);
    }

    // Create new lesson-word relationships
    await prisma.pronunciationLessonWord.createMany({
      data: wordIds.map((wordId) => ({
        lessonId: lessonId,
        wordId: wordId,
      })),
    });

    // Clear search cache if new words were added
    if (hasNewWords) {
      clearSearchCache();
    }

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
    // Delete lesson-word relationships first (cascade will handle this automatically, but being explicit)
    await prisma.pronunciationLessonWord.deleteMany({
      where: {
        lessonId,
      },
    });

    // Delete the lesson itself
    await prisma.pronunciationLesson.delete({
      where: {
        id: lessonId,
      },
    });

    // Note: We don't delete PronunciationWord records as they might be used by other lessons

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

/**
 * Server action to search for pronunciation words with caching
 * @param query - The search query string
 * @returns ApiResponse containing matching words
 */
export async function searchPronunciationWords(
  query: string,
): Promise<ApiResponse> {
  try {
    if (!query || query.length < 1) {
      return createSuccessResponse([]);
    }

    const cacheKey = query.toLowerCase().trim();
    const now = Date.now();

    // Check if we have a valid cached result
    const cachedResult = searchCache.get(cacheKey);
    if (cachedResult && now - cachedResult.timestamp < CACHE_TTL) {
      return createSuccessResponse(cachedResult.data);
    }

    // Search for words that start with the query string
    const words = await prisma.pronunciationWord.findMany({
      where: {
        word: {
          startsWith: query.toLowerCase(),
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        word: true,
      },
      orderBy: {
        word: 'asc',
      },
      take: 10, // Limit to 10 suggestions
    });

    // Cache the result
    searchCache.set(cacheKey, {
      data: words,
      timestamp: now,
    });

    // Clean up old cache entries periodically
    if (searchCache.size > 100) {
      cleanupCache();
    }

    return createSuccessResponse(words);
  } catch (error) {
    console.error('Error searching pronunciation words:', error);
    return createErrorResponse(
      'SEARCH_WORDS_ERROR',
      'Failed to search words. Please try again later.',
    );
  }
}
