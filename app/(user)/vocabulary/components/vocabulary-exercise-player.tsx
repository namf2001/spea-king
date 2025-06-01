'use client';

import { useState } from 'react';
import { MatchingPairs } from '@/components/matching-pairs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import { saveExerciseResult } from '@/app/actions/vocabulary';
import Link from 'next/link';

interface VocabularyExercise {
  id: string;
  title: string;
  description: string | null;
  pairs: Array<{
    id: string;
    englishWord: string;
    vietnameseWord: string;
  }>;
  results: Array<{
    id: string;
    score: number;
    timeSpent: number;
    attempts: number;
    completedAt: Date;
  }>;
}

interface VocabularyExercisePlayerProps {
  exercise: VocabularyExercise;
}

export function VocabularyExercisePlayer({
  exercise,
}: VocabularyExercisePlayerProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Convert database pairs to component format
  const convertedPairs = exercise.pairs.map((pair) => ({
    english: {
      id: `en-${pair.id}`,
      text: pair.englishWord,
      matchId: `vi-${pair.id}`,
      isEnglish: true,
    },
    vietnamese: {
      id: `vi-${pair.id}`,
      text: pair.vietnameseWord,
      matchId: `en-${pair.id}`,
      isEnglish: false,
    },
  }));

  const handleComplete = async (
    score: number,
    time: number,
    attemptCount: number,
  ) => {
    setCurrentScore(score);
    setTimeSpent(time);
    setAttempts(attemptCount);
    setIsCompleted(true);

    // Save result to database
    setIsSaving(true);
    try {
      await saveExerciseResult(exercise.id, score, time, attemptCount);
    } catch (error) {
      console.error('Error saving result:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    setIsCompleted(false);
    setCurrentScore(0);
    setTimeSpent(0);
    setAttempts(0);
    window.location.reload();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Xuất sắc! 🎉';
    if (score >= 70) return 'Tốt lắm! 👍';
    if (score >= 50) return 'Khá ổn! 😊';
    return 'Cần cố gắng thêm! 💪';
  };

  const lastResult = exercise.results[0];

  if (isCompleted) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Hoàn thành bài tập!
            </CardTitle>
            <p className="mt-2 text-gray-600">
              {getScoreMessage(currentScore)}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Results */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div
                  className={`text-3xl font-bold ${getScoreColor(currentScore)}`}
                >
                  {currentScore}%
                </div>
                <p className="text-sm text-gray-600">Điểm số</p>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-blue-600">
                  {formatTime(timeSpent)}
                </div>
                <p className="text-sm text-gray-600">Thời gian</p>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-purple-600">
                  {attempts}
                </div>
                <p className="text-sm text-gray-600">Lần thử</p>
              </div>
            </div>

            {/* Previous Best */}
            {lastResult && (
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Kết quả trước đó:
                </p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Điểm: {lastResult.score}%</span>
                  <span>Thời gian: {formatTime(lastResult.timeSpent)}</span>
                  <span>{lastResult.attempts} lần thử</span>
                </div>
                {currentScore > lastResult.score && (
                  <Badge className="mt-2" variant="default">
                    🎉 Cải thiện +{currentScore - lastResult.score}%
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleRestart}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Thử lại
              </Button>
              <Link href="/vocabulary" className="flex-1">
                <Button className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Về danh sách
                </Button>
              </Link>
            </div>

            {isSaving && (
              <p className="text-center text-sm text-gray-600">
                Đang lưu kết quả...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen max-w-4xl">
      {/* Exercise */}
      <Card className="h-full border-0">
        <CardContent className="h-full p-8">
          <MatchingPairs pairs={convertedPairs} onComplete={handleComplete} />
        </CardContent>
      </Card>
    </div>
  );
}
