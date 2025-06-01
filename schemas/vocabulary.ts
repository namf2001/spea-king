import { z } from 'zod';

// Schema for a word pair (English-Vietnamese)
export const wordPairSchema = z.object({
  id: z.string().optional(),
  englishWord: z
    .string()
    .min(1, { message: 'Từ tiếng Anh không được để trống' }),
  vietnameseWord: z
    .string()
    .min(1, { message: 'Từ tiếng Việt không được để trống' }),
});

// Schema for the entire vocabulary exercise form
export const vocabularyExerciseSchema = z.object({
  title: z.string().min(3, { message: 'Tiêu đề cần ít nhất 3 ký tự' }),
  description: z.string().nullable().optional(),
  pairs: z
    .array(wordPairSchema)
    .min(1, { message: 'Cần ít nhất một cặp từ vựng' }),
});

export type VocabularyExerciseFormValues = z.infer<
  typeof vocabularyExerciseSchema
>;
export type WordPairFormValues = z.infer<typeof wordPairSchema>;
