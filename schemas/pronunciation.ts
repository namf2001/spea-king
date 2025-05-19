import { z } from "zod";


export const lessonSchema = z.object({
    title: z.string().min(1, {
      message: "Title is required",
    }),
    words: z
      .array(
        z.object({
          id: z.string(),
          word: z.string().min(1, {
            message: "Word is required",
          }),
        })
      )
      .min(1, {
        message: "At least one word is required",
      }),
  }).strict();

