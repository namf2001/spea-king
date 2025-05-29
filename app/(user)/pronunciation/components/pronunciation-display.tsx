'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import type {
  PronunciationLesson,
  PronunciationWord,
  PronunciationLessonWord,
} from '@prisma/client';

interface ExerciseDisplayProps {
  readonly exercise: PronunciationLesson & {
    words: (PronunciationLessonWord & {
      word: PronunciationWord;
    })[];
  };
  readonly currentIndex: number;
  readonly totalExercises: number;
  readonly currentWordIndex?: number;
}

export function ExerciseDisplay({
  exercise,
  currentIndex,
  totalExercises,
  currentWordIndex = 0,
}: ExerciseDisplayProps) {
  const currentWord = exercise.words[currentWordIndex];
  const wordProgress = `${currentWordIndex + 1}/${exercise.words.length}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      key={`${currentIndex}-${currentWordIndex}`}
      className="mb-8"
    >
      <Card className=" mb-8 border-2 border-gray-200 pt-0 shadow-md">
        <CardHeader className="rounded-t-lg py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {exercise.title} - {currentIndex + 1}/{totalExercises}
            </CardTitle>
            <div className="bg-primary/10 rounded-full px-2 py-1 text-sm">
              Word: {wordProgress}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="bg-primary/10 relative mb-6 rounded-lg p-6 text-center shadow-inner">
            <p className="text-2xl font-medium tracking-wide">
              {currentWord.word.word}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
