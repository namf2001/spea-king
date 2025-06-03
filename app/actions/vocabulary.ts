'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  ApiResponse,
  createErrorResponse,
  createSuccessResponse,
} from '@/types/response';

// Tạo bài tập vocabulary mới
export async function createVocabularyExercise(
  title: string,
  description: string | null,
  pairs: { englishWord: string; vietnameseWord: string }[],
): Promise<ApiResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse('AUTH_ERROR', 'Unauthorized');
    }

    const exercise = await prisma.vocabularyExercise.create({
      data: {
        title,
        description,
        userId: session.user.id,
        pairs: {
          create: pairs.map((pair) => ({
            englishWord: pair.englishWord,
            vietnameseWord: pair.vietnameseWord,
          })),
        },
      },
      include: {
        pairs: true,
      },
    });

    revalidatePath('/vocabulary');
    return createSuccessResponse(exercise, { timestamp: Date.now() });
  } catch (error) {
    console.error('Error creating vocabulary exercise:', error);
    return createErrorResponse(
      'CREATE_EXERCISE_ERROR',
      'Failed to create exercise. Please try again later.',
    );
  }
}

// Lấy danh sách bài tập vocabulary
export async function getVocabularyExercises(): Promise<ApiResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse('AUTH_ERROR', 'Unauthorized', { data: [] });
    }

    const exercises = await prisma.vocabularyExercise.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        pairs: true,
        results: {
          orderBy: {
            completedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return createSuccessResponse(exercises);
  } catch (error) {
    console.error('Error fetching vocabulary exercises:', error);
    return createErrorResponse(
      'FETCH_EXERCISES_ERROR',
      'Failed to fetch exercises',
      { data: [] },
    );
  }
}

// Lấy chi tiết bài tập vocabulary
export async function getVocabularyExercise(
  exerciseId: string,
): Promise<ApiResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse('AUTH_ERROR', 'Unauthorized');
    }

    const exercise = await prisma.vocabularyExercise.findFirst({
      where: {
        id: exerciseId,
        userId: session.user.id,
      },
      include: {
        pairs: true,
        results: {
          where: {
            userId: session.user.id,
          },
          orderBy: {
            completedAt: 'desc',
          },
        },
      },
    });

    if (!exercise) {
      return createErrorResponse('NOT_FOUND', 'Exercise not found');
    }

    return createSuccessResponse(exercise);
  } catch (error) {
    console.error('Error fetching vocabulary exercise:', error);
    return createErrorResponse(
      'FETCH_EXERCISE_ERROR',
      'Failed to fetch exercise',
    );
  }
}

// Lưu kết quả bài tập
export async function saveExerciseResult(
  exerciseId: string,
  score: number,
  timeSpent: number,
  attempts: number,
): Promise<ApiResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse('AUTH_ERROR', 'Unauthorized');
    }

    const result = await prisma.exerciseResult.create({
      data: {
        userId: session.user.id,
        exerciseId,
        score,
        timeSpent,
        attempts,
      },
    });

    revalidatePath('/vocabulary');
    return createSuccessResponse(result, { timestamp: Date.now() });
  } catch (error) {
    console.error('Error saving exercise result:', error);
    return createErrorResponse(
      'SAVE_RESULT_ERROR',
      'Failed to save result. Please try again later.',
    );
  }
}

// Tạo bài tập mặc định
export async function createDefaultVocabularyExercises(): Promise<ApiResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse('AUTH_ERROR', 'Unauthorized');
    }

    const defaultExercises = [
      {
        title: 'Từ vựng cơ bản',
        description: 'Học các từ vựng tiếng Anh cơ bản hàng ngày',
        pairs: [
          { englishWord: 'hello', vietnameseWord: 'xin chào' },
          { englishWord: 'goodbye', vietnameseWord: 'tạm biệt' },
          { englishWord: 'thank you', vietnameseWord: 'cảm ơn' },
          { englishWord: 'please', vietnameseWord: 'làm ơn' },
          { englishWord: 'sorry', vietnameseWord: 'xin lỗi' },
          { englishWord: 'water', vietnameseWord: 'nước' },
        ],
      },
      {
        title: 'Gia đình',
        description: 'Từ vựng về thành viên trong gia đình',
        pairs: [
          { englishWord: 'father', vietnameseWord: 'bố' },
          { englishWord: 'mother', vietnameseWord: 'mẹ' },
          { englishWord: 'brother', vietnameseWord: 'anh trai' },
          { englishWord: 'sister', vietnameseWord: 'chị gái' },
          { englishWord: 'grandfather', vietnameseWord: 'ông' },
          { englishWord: 'grandmother', vietnameseWord: 'bà' },
        ],
      },
      {
        title: 'Màu sắc',
        description: 'Các từ vựng về màu sắc',
        pairs: [
          { englishWord: 'red', vietnameseWord: 'đỏ' },
          { englishWord: 'blue', vietnameseWord: 'xanh dương' },
          { englishWord: 'green', vietnameseWord: 'xanh lá' },
          { englishWord: 'yellow', vietnameseWord: 'vàng' },
          { englishWord: 'black', vietnameseWord: 'đen' },
          { englishWord: 'white', vietnameseWord: 'trắng' },
        ],
      },
      {
        title: 'Từ vựng IELTS',
        description: 'Các từ vựng quan trọng thường xuất hiện trong bài thi IELTS',
        pairs: [
          { englishWord: 'accomplish', vietnameseWord: 'hoàn thành' },
          { englishWord: 'accurate', vietnameseWord: 'chính xác' },
          { englishWord: 'adequate', vietnameseWord: 'đầy đủ' },
          { englishWord: 'alternative', vietnameseWord: 'thay thế' },
          { englishWord: 'analyze', vietnameseWord: 'phân tích' },
          { englishWord: 'apparent', vietnameseWord: 'rõ ràng' },
          { englishWord: 'approximately', vietnameseWord: 'xấp xỉ' },
          { englishWord: 'assess', vietnameseWord: 'đánh giá' },
          { englishWord: 'benefit', vietnameseWord: 'lợi ích' },
          { englishWord: 'category', vietnameseWord: 'danh mục' },
          { englishWord: 'component', vietnameseWord: 'thành phần' },
          { englishWord: 'concept', vietnameseWord: 'khái niệm' },
          { englishWord: 'considerable', vietnameseWord: 'đáng kể' },
          { englishWord: 'consistent', vietnameseWord: 'nhất quán' },
          { englishWord: 'constitute', vietnameseWord: 'cấu thành' },
          { englishWord: 'context', vietnameseWord: 'bối cảnh' },
          { englishWord: 'contrast', vietnameseWord: 'tương phản' },
          { englishWord: 'crucial', vietnameseWord: 'quan trọng' },
          { englishWord: 'demonstrate', vietnameseWord: 'chứng minh' },
          { englishWord: 'derive', vietnameseWord: 'bắt nguồn' },
          { englishWord: 'distribution', vietnameseWord: 'phân phối' },
          { englishWord: 'diverse', vietnameseWord: 'đa dạng' },
          { englishWord: 'eliminate', vietnameseWord: 'loại bỏ' },
          { englishWord: 'emphasis', vietnameseWord: 'nhấn mạnh' },
          { englishWord: 'enhance', vietnameseWord: 'nâng cao' },
          { englishWord: 'equivalent', vietnameseWord: 'tương đương' },
          { englishWord: 'establish', vietnameseWord: 'thiết lập' },
          { englishWord: 'evidence', vietnameseWord: 'bằng chứng' },
          { englishWord: 'exclude', vietnameseWord: 'loại trừ' },
          { englishWord: 'factor', vietnameseWord: 'yếu tố' },
          { englishWord: 'feature', vietnameseWord: 'đặc điểm' },
          { englishWord: 'function', vietnameseWord: 'chức năng' },
          { englishWord: 'generate', vietnameseWord: 'tạo ra' },
          { englishWord: 'hypothesis', vietnameseWord: 'giả thuyết' },
          { englishWord: 'identify', vietnameseWord: 'xác định' },
          { englishWord: 'implement', vietnameseWord: 'thực hiện' },
          { englishWord: 'imply', vietnameseWord: 'ngụ ý' },
          { englishWord: 'indicate', vietnameseWord: 'chỉ ra' },
          { englishWord: 'instance', vietnameseWord: 'trường hợp' },
          { englishWord: 'interpret', vietnameseWord: 'giải thích' },
          { englishWord: 'investigate', vietnameseWord: 'điều tra' },
          { englishWord: 'maintain', vietnameseWord: 'duy trì' },
          { englishWord: 'method', vietnameseWord: 'phương pháp' },
          { englishWord: 'objective', vietnameseWord: 'mục tiêu' },
          { englishWord: 'obtain', vietnameseWord: 'có được' },
          { englishWord: 'occur', vietnameseWord: 'xảy ra' },
          { englishWord: 'participate', vietnameseWord: 'tham gia' },
          { englishWord: 'perspective', vietnameseWord: 'quan điểm' },
          { englishWord: 'phenomenon', vietnameseWord: 'hiện tượng' },
          { englishWord: 'proportion', vietnameseWord: 'tỷ lệ' },
          { englishWord: 'significant', vietnameseWord: 'có ý nghĩa' },
        ],
      },
    ];

    const results = await Promise.all(
      defaultExercises.map((exercise) =>
        prisma.vocabularyExercise.create({
          data: {
            title: exercise.title,
            description: exercise.description,
            userId: session.user.id,
            pairs: {
              create: exercise.pairs.map((pair) => ({
                englishWord: pair.englishWord,
                vietnameseWord: pair.vietnameseWord,
              })),
            },
          },
          include: {
            pairs: true,
          },
        }),
      ),
    );

    revalidatePath('/vocabulary');
    return createSuccessResponse(results, { timestamp: Date.now() });
  } catch (error) {
    console.error('Error creating default exercises:', error);
    return createErrorResponse(
      'CREATE_DEFAULT_EXERCISES_ERROR',
      'Failed to create default exercises. Please try again later.',
    );
  }
}

// Cập nhật bài tập vocabulary
export async function updateVocabularyExercise(
  exerciseId: string,
  title: string,
  description: string | null,
  pairs: { id?: string; englishWord: string; vietnameseWord: string }[],
): Promise<ApiResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse('AUTH_ERROR', 'Unauthorized');
    }

    // Verify the exercise belongs to the user
    const existingExercise = await prisma.vocabularyExercise.findFirst({
      where: {
        id: exerciseId,
        userId: session.user.id,
      },
      include: {
        pairs: true,
      },
    });

    if (!existingExercise) {
      return createErrorResponse(
        'NOT_FOUND',
        'Exercise not found or not authorized',
      );
    }

    // Update the exercise
    const updatedExercise = await prisma.vocabularyExercise.update({
      where: {
        id: exerciseId,
      },
      data: {
        title,
        description,
      },
    });

    // Get the existing pair IDs
    const existingPairIds = existingExercise.pairs.map((pair) => pair.id);

    // Determine which pairs to create, update, or delete
    const pairsToCreate = pairs.filter((pair) => !pair.id);
    const pairsToUpdate = pairs.filter((pair) => pair.id);
    const pairsToDeleteIds = existingPairIds.filter(
      (id) => !pairsToUpdate.some((pair) => pair.id === id),
    );

    // Delete removed pairs
    if (pairsToDeleteIds.length > 0) {
      await prisma.vocabularyPair.deleteMany({
        where: {
          id: {
            in: pairsToDeleteIds,
          },
        },
      });
    }

    // Update existing pairs
    for (const pair of pairsToUpdate) {
      await prisma.vocabularyPair.update({
        where: {
          id: pair.id,
        },
        data: {
          englishWord: pair.englishWord,
          vietnameseWord: pair.vietnameseWord,
        },
      });
    }

    // Create new pairs
    if (pairsToCreate.length > 0) {
      await prisma.vocabularyPair.createMany({
        data: pairsToCreate.map((pair) => ({
          exerciseId,
          englishWord: pair.englishWord,
          vietnameseWord: pair.vietnameseWord,
        })),
      });
    }

    revalidatePath('/vocabulary');

    return createSuccessResponse(
      {
        ...updatedExercise,
        pairs: [...pairsToUpdate, ...pairsToCreate],
      },
      { timestamp: Date.now() },
    );
  } catch (error) {
    console.error('Error updating vocabulary exercise:', error);
    return createErrorResponse(
      'UPDATE_EXERCISE_ERROR',
      'Failed to update exercise. Please try again later.',
    );
  }
}

// Xóa bài tập vocabulary
export async function deleteVocabularyExercise(
  exerciseId: string,
): Promise<ApiResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse('AUTH_ERROR', 'Unauthorized');
    }

    // Verify the exercise belongs to the user
    const existingExercise = await prisma.vocabularyExercise.findFirst({
      where: {
        id: exerciseId,
        userId: session.user.id,
      },
    });

    if (!existingExercise) {
      return createErrorResponse(
        'NOT_FOUND',
        'Exercise not found or not authorized',
      );
    }

    // Delete the exercise and all related data (pairs will be deleted by cascade)
    await prisma.vocabularyExercise.delete({
      where: {
        id: exerciseId,
      },
    });

    revalidatePath('/vocabulary');

    return createSuccessResponse(null, { timestamp: Date.now() });
  } catch (error) {
    console.error('Error deleting vocabulary exercise:', error);
    return createErrorResponse(
      'DELETE_EXERCISE_ERROR',
      'Failed to delete exercise. Please try again later.',
    );
  }
}

// Tìm kiếm bài tập vocabulary
export async function searchVocabularyExercises(
  searchTerm: string,
): Promise<ApiResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return createErrorResponse('AUTH_ERROR', 'Unauthorized', { data: [] });
    }

    const exercises = await prisma.vocabularyExercise.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          {
            pairs: {
              some: {
                OR: [
                  {
                    englishWord: { contains: searchTerm, mode: 'insensitive' },
                  },
                  {
                    vietnameseWord: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      include: {
        pairs: true,
        results: {
          orderBy: {
            completedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return createSuccessResponse(exercises);
  } catch (error) {
    console.error('Error searching vocabulary exercises:', error);
    return createErrorResponse(
      'SEARCH_EXERCISES_ERROR',
      'Failed to search exercises',
      { data: [] },
    );
  }
}
