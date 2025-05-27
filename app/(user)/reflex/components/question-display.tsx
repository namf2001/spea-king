'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
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
  const { speak, isSpeaking, error } = useSpeechSynthesis();
  const [showAnswer, setShowAnswer] = useState(false);

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
      className="mb-8"
    >
      <Card className="gap-0 overflow-hidden border-2 pt-0 shadow-md">
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

        <CardHeader className="from-primary/20 to-background bg-gradient-to-b py-4">
          <CardTitle className="flex items-center justify-between">
            <h3 className="font-medium">
              Câu hỏi {currentIndex + 1}/{totalQuestions}
            </h3>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="bg-primary/10 border-primary/20 relative rounded-lg border p-6 text-center shadow-inner">
              <p className="text-2xl font-medium tracking-wide">
                {question.question}
              </p>
              <button
                onClick={handlePlayQuestion}
                disabled={isSpeaking}
                className="text-primary hover:text-primary/80 hover:bg-primary/10 absolute top-3 right-3 rounded-full p-2 transition-colors"
                aria-label="Phát câu hỏi"
              >
                <Volume2 className="h-5 w-5" />
              </button>
            </div>

            {(showAnswer || !isAnswering) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="bg-primary/10 border-primary/20 relative rounded-lg border p-6 text-center shadow-inner"
              >
                <div className="mb-2 flex items-start gap-2">
                  <Badge variant="secondary">Câu trả lời mẫu</Badge>
                </div>
                <p>{question.answer}</p>
              </motion.div>
            )}

            {isAnswering && !showAnswer && (
              <button
                onClick={() => setShowAnswer(true)}
                className="self-end text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Xem câu trả lời mẫu
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
