'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AnswerFeedbackProps {
  readonly transcript: string;
  readonly targetAnswerText: string;
}

interface WordMatch {
  word: string;
  status: 'correct' | 'incorrect' | 'partial';
  originalIndex: number;
}

export function AnswerFeedback({
  transcript,
  targetAnswerText,
}: AnswerFeedbackProps) {
  const [analyzedWords, setAnalyzedWords] = useState<WordMatch[]>([]);
  const [accuracy, setAccuracy] = useState(0);

  // Get the appropriate badge variant based on accuracy
  const getAccuracyBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 50) return 'secondary';
    return 'destructive';
  };

  // Phân tích và so sánh câu trả lời với câu hỏi
  useEffect(() => {
    if (!transcript || !targetAnswerText) {
      setAnalyzedWords([]);
      setAccuracy(0);
      return;
    }

    // Chuyển đổi thành chữ thường và loại bỏ dấu câu
    const normalizedTranscript = transcript
      .toLowerCase()
      .replace(/[.,?!]/g, '');
    const normalizedTarget = targetAnswerText
      .toLowerCase()
      .replace(/[.,?!]/g, '');

    // Tách thành các từ riêng lẻ
    const transcriptWords = normalizedTranscript
      .split(' ')
      .filter((word) => word.trim() !== '');
    const targetWords = normalizedTarget
      .split(' ')
      .filter((word) => word.trim() !== '');

    // Tạo mảng phân tích từ
    const wordMatches: WordMatch[] = transcriptWords.map((word, index) => {
      // Kiểm tra từ có trùng chính xác với từ nào trong câu hỏi không
      if (targetWords.includes(word)) {
        return { word, status: 'correct', originalIndex: index };
      }

      // Kiểm tra từng phần (ví dụ: từng phần của từ có xuất hiện trong câu hỏi)
      const partialMatch = targetWords.some(
        (targetWord) =>
          targetWord.includes(word) ||
          word.includes(targetWord) ||
          // Sử dụng khoảng cách Levenshtein để kiểm tra từ tương tự
          calculateLevenshteinDistance(word, targetWord) <=
            Math.min(2, Math.floor(targetWord.length / 3)),
      );

      if (partialMatch) {
        return { word, status: 'partial', originalIndex: index };
      }

      // Không có trùng khớp
      return { word, status: 'incorrect', originalIndex: index };
    });

    // Tính toán độ chính xác
    const correctWords = wordMatches.filter(
      (match) => match.status === 'correct',
    ).length;
    const partialWords = wordMatches.filter(
      (match) => match.status === 'partial',
    ).length;
    const totalWords = Math.max(wordMatches.length, 1);

    const calculatedAccuracy = Math.round(
      ((correctWords + partialWords * 0.5) / totalWords) * 100,
    );

    setAnalyzedWords(wordMatches);
    setAccuracy(calculatedAccuracy);
  }, [transcript, targetAnswerText]);

  // Hàm tính khoảng cách Levenshtein (độ tương tự giữa các chuỗi)
  const calculateLevenshteinDistance = (a: string, b: string): number => {
    const matrix = Array(a.length + 1)
      .fill(null)
      .map(() => Array(b.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) {
      matrix[i][0] = i;
    }

    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost,
        );
      }
    }

    return matrix[a.length][b.length];
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-10"
    >
      <Card className="gap-0 border-2 dark:border-gray-600 py-0">
        <CardHeader className="from-primary/20 to-background rounded-lg bg-gradient-to-b p-6">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary h-4 w-4" />
            Answer Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="space-y-4">
            <motion.div
              variants={itemVariants}
              className="from-primary/5 to-background rounded-lg border bg-gradient-to-t"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-primary text-sm font-medium">
                  Your Answer
                </h3>
                <Badge
                  variant={getAccuracyBadgeVariant(accuracy)}
                  className="text-xs"
                >
                  Accuracy: {accuracy}%
                </Badge>
              </div>
              <div className="space-x-1 leading-relaxed">
                {analyzedWords.map((wordMatch, index) => (
                  <span
                    key={`${wordMatch.word}-${index}`}
                    className={`inline-block rounded px-1 ${
                      wordMatch.status === 'correct'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : wordMatch.status === 'partial'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    } `}
                  >
                    {wordMatch.word}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
