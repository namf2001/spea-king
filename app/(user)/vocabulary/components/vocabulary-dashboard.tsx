'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Play, Trophy, Clock, Target } from 'lucide-react';
import Link from 'next/link';
import { createDefaultVocabularyExercises } from '@/app/actions/vocabulary';
import type { VocabularyExercise, VocabularyPair, ExerciseResult} from '@prisma/client';

interface VocabularyDashboardProps {
  exercises: Array<VocabularyExercise & {
    pairs: VocabularyPair[];
    results: ExerciseResult[];
  }>;
}

export function VocabularyDashboard({ exercises }: VocabularyDashboardProps) {
  const [isCreatingDefaults, setIsCreatingDefaults] = useState(false);

  const handleCreateDefaults = async () => {
    setIsCreatingDefaults(true);
    try {
      await createDefaultVocabularyExercises();
      window.location.reload();
    } catch (error) {
      console.error('Error creating default exercises:', error);
    } finally {
      setIsCreatingDefaults(false);
    }
  };

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa có bài tập nào
          </h3>
          <p className="text-gray-600">
            Bắt đầu với các bài tập từ vựng cơ bản
          </p>
        </div>
        
        <Button 
          onClick={handleCreateDefaults}
          disabled={isCreatingDefaults}
          size="lg"
          className="min-w-[200px]"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreatingDefaults ? 'Đang tạo...' : 'Tạo bài tập mẫu'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng bài tập</p>
                <p className="text-2xl font-bold text-gray-900">{exercises.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900">
                  {exercises.filter(ex => ex.results.length > 0).length}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Điểm trung bình</p>
                <p className="text-2xl font-bold text-gray-900">
                  {exercises.length > 0 ? Math.round(
                    exercises
                      .filter(ex => ex.results.length > 0)
                      .reduce((acc, ex) => acc + (ex.results[0]?.score || 0), 0) / 
                    Math.max(exercises.filter(ex => ex.results.length > 0).length, 1)
                  ) : 0}%
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 font-bold">%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => {
          const lastResult = exercise.results[0];
          const isCompleted = exercise.results.length > 0;
          
          return (
            <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-1">
                      {exercise.title}
                    </CardTitle>
                    {exercise.description && (
                      <CardDescription className="text-sm text-gray-600">
                        {exercise.description}
                      </CardDescription>
                    )}
                  </div>
                  {isCompleted && (
                    <Badge variant="secondary" className="ml-2">
                      <Trophy className="w-3 h-3 mr-1" />
                      {lastResult.score}%
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{exercise.pairs.length} từ</span>
                    {lastResult && (
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {Math.floor(lastResult.timeSpent / 60)}:{(lastResult.timeSpent % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  {isCompleted && (
                    <div className="space-y-1">
                      <Progress value={lastResult.score} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Điểm: {lastResult.score}%</span>
                        <span>{lastResult.attempts} lần thử</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  <Link href={`/vocabulary/${exercise.id}`} className="block">
                    <Button className="w-full" variant={isCompleted ? "outline" : "default"}>
                      <Play className="w-4 h-4 mr-2" />
                      {isCompleted ? 'Luyện lại' : 'Bắt đầu'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Add New Exercise Card */}
        <Card className="border-dashed border-2 hover:border-primary transition-colors">
          <CardContent className="flex items-center justify-center p-8">
            <Button 
              onClick={handleCreateDefaults}
              disabled={isCreatingDefaults}
              variant="ghost"
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Plus className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                {isCreatingDefaults ? 'Đang tạo...' : 'Thêm bài tập mới'}
              </span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}