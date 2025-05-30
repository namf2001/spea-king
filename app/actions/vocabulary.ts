'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Tạo bài tập vocabulary mới
export async function createVocabularyExercise(
  title: string,
  description: string | null,
  pairs: { englishWord: string; vietnameseWord: string }[]
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    const exercise = await prisma.vocabularyExercise.create({
      data: {
        title,
        description,
        userId: session.user.id,
        pairs: {
          create: pairs.map(pair => ({
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
    return { success: true, exercise };
  } catch (error) {
    console.error('Error creating vocabulary exercise:', error);
    return { success: false, error: 'Failed to create exercise' };
  }
}

// Lấy danh sách bài tập vocabulary
export async function getVocabularyExercises() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
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

    return exercises;
  } catch (error) {
    console.error('Error fetching vocabulary exercises:', error);
    return [];
  }
}

// Lấy chi tiết bài tập vocabulary
export async function getVocabularyExercise(exerciseId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
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

    return exercise;
  } catch (error) {
    console.error('Error fetching vocabulary exercise:', error);
    return null;
  }
}

// Lưu kết quả bài tập
export async function saveExerciseResult(
  exerciseId: string,
  score: number,
  timeSpent: number,
  attempts: number
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
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
    return { success: true, result };
  } catch (error) {
    console.error('Error saving exercise result:', error);
    return { success: false, error: 'Failed to save result' };
  }
}

// Tạo bài tập mặc định
export async function createDefaultVocabularyExercises() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
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
  ];

  try {
    const results = await Promise.all(
      defaultExercises.map(exercise =>
        createVocabularyExercise(exercise.title, exercise.description, exercise.pairs)
      )
    );

    revalidatePath('/vocabulary');
    return { success: true, results };
  } catch (error) {
    console.error('Error creating default exercises:', error);
    return { success: false, error: 'Failed to create default exercises' };
  }
}