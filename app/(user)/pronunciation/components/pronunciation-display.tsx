'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { toast } from 'sonner';
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
  const { speak, isSpeaking } = useSpeechSynthesis();

  const handlePlayWord = async () => {
    try {
      await speak(currentWord.word.word);
    } catch (error: unknown) {
      console.error('Speech synthesis error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      toast.error('Error', {
        description: `Không thể phát âm từ này: ${errorMessage}`,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      key={`${currentIndex}-${currentWordIndex}`}
      className="mb-4"
    >
      <Card className="pt-0">
        <CardHeader className="py-4">
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
          <div className="bg-primary/10 relative rounded-lg border p-6 text-center shadow-inner">
            <p className="text-2xl font-medium tracking-wide">
              {currentWord.word.word}
            </p>
            <button
              onClick={handlePlayWord}
              disabled={isSpeaking}
              className="text-primary hover:text-primary/80 hover:bg-primary/10 absolute top-2 right-2 rounded-full p-1.5 transition-colors sm:top-3 sm:right-3 sm:p-2"
              aria-label="Phát âm từ"
            >
              <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
