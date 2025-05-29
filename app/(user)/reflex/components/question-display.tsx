'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Volume2, Mic } from 'lucide-react';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { toast } from 'sonner';

// Define a common question interface that works with both types
interface CommonQuestion {
  id: string | number;
  question: string;
  answer: string;
}

interface QuestionDisplayProps {
  readonly question: CommonQuestion;
  readonly currentIndex: number;
  readonly totalQuestions: number;
  readonly timeRemaining?: number; // Make timeRemaining optional to support manual input mode
  readonly isAnswering: boolean;
}

export function QuestionDisplay({
  question,
  currentIndex,
  totalQuestions,
  timeRemaining = 45, // Default value if not provided
  isAnswering,
}: QuestionDisplayProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const { speak, isSpeaking, error } = useSpeechSynthesis();

  useEffect(() => {
    setShowAnswer(false);
  }, [question.id]);

  useEffect(() => {
    if (error) {
      toast.error('Speech Synthesis Error', {
        description: error,
      });
    }
  }, [error]);

  const handlePlayQuestion = async () => {
    try {
      await speak(question.question);
    } catch (err) {
      toast.error('Error', {
        description:
          err instanceof Error ? err.message : 'Không thể phát câu hỏi',
      });
    }
  };

  const handlePlayAnswer = async () => {
    try {
      await speak(question.answer);
    } catch (err) {
      toast.error('Error', {
        description:
          err instanceof Error ? err.message : 'Không thể phát câu trả lời',
      });
    }
  };

  // Calculate progress percentage
  const calculateProgressPercentage = () => {
    if (timeRemaining) {
      return (timeRemaining / 45) * 100;
    }
    return 0;
  };

  // Store the calculation result
  const progressPercentage = calculateProgressPercentage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      key={question.id}
      className="mb-4"
    >
      <Card className="gap-0 overflow-hidden border-2 border-gray-200 dark:border-gray-600 pt-0">
        {/* Thanh thời gian */}
        {timeRemaining !== undefined && (
          <div className="relative h-2 bg-gray-100 dark:bg-gray-800">
            <motion.div
              className="bg-primary absolute top-0 left-0 h-full"
              initial={{ width: '100%' }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        <CardHeader className="py-3 sm:py-4">
          <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-medium sm:text-base">
              Câu hỏi {currentIndex + 1}/{totalQuestions}
            </h3>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="bg-primary/10 border-primary/20 relative rounded-lg border p-4 text-center shadow-inner sm:p-6">
              <p className="text-lg font-medium tracking-wide sm:text-xl lg:text-2xl">
                {question.question}
              </p>
              <button
                onClick={handlePlayQuestion}
                disabled={isSpeaking}
                className="text-primary hover:text-primary/80 hover:bg-primary/10 absolute top-2 right-2 rounded-full p-1.5 transition-colors sm:top-3 sm:right-3 sm:p-2"
                aria-label="Phát câu hỏi"
              >
                <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {(showAnswer || !isAnswering) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="bg-primary/10 border-primary/20 relative rounded-lg border p-4 text-center shadow-inner sm:p-6"
              >
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Câu trả lời mẫu
                  </Badge>
                  <button
                    onClick={handlePlayAnswer}
                    disabled={isSpeaking}
                    className="text-primary hover:text-primary/80 hover:bg-primary/10 ml-auto rounded-full p-1 transition-colors sm:p-1.5"
                    aria-label="Phát câu trả lời"
                  >
                    <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 sm:text-base dark:text-gray-300">
                  {question.answer}
                </p>
              </motion.div>
            )}

            {isAnswering && !showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed `p-4 sm:gap-4 sm:p-6 dark:border-gray-600"
              >
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full sm:h-16 sm:w-16">
                  <Mic className="h-5 w-5 animate-pulse sm:h-6 sm:w-6" />
                </div>
                <div className="text-center">
                  <p className="text-primary text-sm font-medium sm:text-base">
                    Đang nghe câu trả lời của bạn...
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                    Nói câu trả lời của bạn một cách tự nhiên
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnswer(true)}
                  className="text-xs sm:text-sm"
                >
                  Xem câu trả lời mẫu
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
