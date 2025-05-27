import { z } from 'zod';

export const reflexSchema = z
  .object({
    question: z.string().min(1, {
      message: 'Question is required',
    }),
    answer: z.string().min(1, {
      message: 'Answer is required',
    }),
  })
  .strict();
