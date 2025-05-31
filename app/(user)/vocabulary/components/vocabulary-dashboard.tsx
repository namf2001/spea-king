'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Play, Trophy, Clock, Target, Search, MoreVertical, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { createDefaultVocabularyExercises } from '@/app/actions/vocabulary';
import type { VocabularyExercise, VocabularyPair, ExerciseResult} from '@prisma/client';
import { VocabularyModal } from './vocabulary-modal';
import VocabularyDeleteDialog from './vocabulary-delete-dialog';
import { VocabularySearch } from './vocabulary-search';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VocabularyDashboardProps {
  exercises: Array<VocabularyExercise & {
    pairs: VocabularyPair[];
    results: ExerciseResult[];
  }>;
  error?: string;
}

export function VocabularyDashboard({ exercises: initialExercises, error }: VocabularyDashboardProps) {
  const [isCreatingDefaults, setIsCreatingDefaults] = useState(false);
  const [exercises, setExercises] = useState(initialExercises);
  const [searchResults, setSearchResults] = useState<Array<VocabularyExercise & {
    pairs: VocabularyPair[];
    results: ExerciseResult[];
  }> | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingExercise, setDeletingExercise] = useState<VocabularyExercise & {
    pairs: VocabularyPair[];
    results: ExerciseResult[];
  } | null>(null);

  // Handle search results
  const handleSearchResults = (results: Array<VocabularyExercise & {
    pairs: VocabularyPair[];
    results: ExerciseResult[];
  }> | null) => {
    setSearchResults(results);
  };

  // Determine which exercises to display - search results or all exercises
  const displayExercises = searchResults !== null ? searchResults : exercises;

  // Function to handle opening the delete confirmation dialog
  const handleDeleteClick = (exercise: VocabularyExercise & {
    pairs: VocabularyPair[];
    results: ExerciseResult[];
  }) => {
    setDeletingExercise(exercise);
    setIsDeleteModalOpen(true);
  };

  // Function to handle closing the delete confirmation dialog
  const handleCloseDeleteModal = (deleted = false) => {
    setIsDeleteModalOpen(false);

    // If an exercise was deleted, update the exercises state
    if (deleted && deletingExercise) {
      setExercises(prevExercises => 
        prevExercises.filter(exercise => exercise.id !== deletingExercise.id)
      );

      // Also update search results if they exist
      if (searchResults) {
        setSearchResults(prevResults => 
          prevResults ? prevResults.filter(exercise => exercise.id !== deletingExercise.id) : null
        );
      }
    }

    
  };

  const handleCreateDefaults = async () => {
    setIsCreatingDefaults(true);
    try {
      const response = await createDefaultVocabularyExercises();
      if (response.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating default exercises:', error);
    } finally {
      setIsCreatingDefaults(false);
    }
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 text-red-400 mx-auto mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-gray-600 mb-8">
            {error}
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    );
  }

  if (initialExercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa có bài tập nào
          </h3>
          <p className="text-gray-600 mb-8">
            Tạo bài tập từ vựng của riêng bạn hoặc bắt đầu với các bài tập mẫu
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <VocabularyModal 
            mode="create" 
            buttonSize="lg" 
            className="min-w-[200px]" 
          />

          <Button 
            onClick={handleCreateDefaults}
            disabled={isCreatingDefaults}
            size="lg"
            variant="outline"
            className="min-w-[200px]"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreatingDefaults ? 'Đang tạo...' : 'Tạo bài tập mẫu'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <VocabularySearch onSearchResults={handleSearchResults} />

      {/* Search Results Info */}
      {searchResults !== null && (
        <div className="flex items-center justify-between bg-muted px-4 py-2 rounded-md">
          <p className="text-sm text-muted-foreground">
            {searchResults.length === 0 
              ? 'Không tìm thấy kết quả nào' 
              : `Tìm thấy ${searchResults.length} kết quả`}
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng bài tập</p>
                <p className="text-2xl font-bold text-gray-900">{initialExercises.length}</p>
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
                  {initialExercises.filter(ex => ex.results.length > 0).length}
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
                  {initialExercises.length > 0 ? Math.round(
                    initialExercises
                      .filter(ex => ex.results.length > 0)
                      .reduce((acc, ex) => acc + (ex.results[0]?.score || 0), 0) / 
                    Math.max(initialExercises.filter(ex => ex.results.length > 0).length, 1)
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
        {displayExercises.length === 0 && searchResults !== null ? (
          <div className="col-span-full text-center py-8">
            <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kết quả nào</h3>
            <p className="text-gray-600">Hãy thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          displayExercises.map((exercise) => {
            const lastResult = exercise.results[0];
            const isCompleted = exercise.results.length > 0;

            return (
              <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
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

                    {/* Menu for edit and delete */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <VocabularyModal
                            mode="edit"
                            exercise={exercise}
                            trigger={
                              <div className="flex w-full cursor-pointer">
                                Chỉnh sửa
                              </div>
                            }
                            buttonVariant="ghost"
                          />
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive flex cursor-pointer items-center gap-2"
                          onClick={() => handleDeleteClick(exercise)}
                        >
                          <Trash2 size={14} />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="py-3">
                  <div className="space-y-3">
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
                  </div>
                </CardContent>

                <CardFooter className="pt-1">
                  {/* Action Button */}
                  <Link href={`/vocabulary/${exercise.id}`} className="w-full">
                    <Button className="w-full" variant={isCompleted ? "outline" : "default"}>
                      <Play className="w-4 h-4 mr-2" />
                      {isCompleted ? 'Luyện lại' : 'Bắt đầu'}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })
        )}

        {/* Add New Exercise Card */}
        {searchResults === null && (
          <Card className="border-dashed border-2 hover:border-primary transition-colors">
            <CardContent className="flex items-center justify-center p-8">
              <VocabularyModal
                mode="create"
                buttonVariant="ghost"
                trigger={
                  <Button 
                    variant="ghost"
                    className="flex flex-col items-center gap-2 h-auto py-4"
                  >
                    <Plus className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Tạo bài tập từ vựng mới
                    </span>
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {deletingExercise && (
        <VocabularyDeleteDialog
          isOpen={isDeleteModalOpen}
          exerciseId={deletingExercise.id}
          exerciseTitle={deletingExercise.title}
          onClose={handleCloseDeleteModal}
        />
      )}
    </div>
  );
}
