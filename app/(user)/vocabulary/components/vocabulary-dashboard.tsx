'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Plus,
  Play,
  Trophy,
  Clock,
  Target,
  Search,
  MoreVertical,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createDefaultVocabularyExercises } from '@/app/actions/vocabulary';
import type {
  VocabularyExercise,
  VocabularyPair,
  ExerciseResult,
} from '@prisma/client';
import { VocabularyModal } from './vocabulary-modal';
import VocabularyDeleteDialog from './vocabulary-delete-dialog';
import { VocabularySearch } from './vocabulary-search';
import { cuteStudying, cutePool, cuteFood } from '@/assets/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

const iconVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, rotate: 5 },
  tap: { scale: 0.95 },
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

interface VocabularyDashboardProps {
  exercises: Array<
    VocabularyExercise & {
      pairs: VocabularyPair[];
      results: ExerciseResult[];
    }
  >;
  error?: string;
}

export function VocabularyDashboard({
  exercises: initialExercises,
  error,
}: VocabularyDashboardProps) {
  const [isCreatingDefaults, setIsCreatingDefaults] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<
    VocabularyExercise & {
      pairs: VocabularyPair[];
      results: ExerciseResult[];
    }
  > | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingExercise, setDeletingExercise] = useState<
    | (VocabularyExercise & {
        pairs: VocabularyPair[];
        results: ExerciseResult[];
      })
    | null
  >(null);
  const router = useRouter();

  // Handle search results
  const handleSearchResults = (
    results: Array<
      VocabularyExercise & {
        pairs: VocabularyPair[];
        results: ExerciseResult[];
      }
    > | null,
  ) => {
    setSearchResults(results);
  };

  // Determine which exercises to display - search results or all exercises
  const displayExercises =
    searchResults !== null ? searchResults : initialExercises;

  // Function to handle opening the delete confirmation dialog
  const handleDeleteClick = (
    exercise: VocabularyExercise & {
      pairs: VocabularyPair[];
      results: ExerciseResult[];
    },
  ) => {
    setDeletingExercise(exercise);
    setIsDeleteModalOpen(true);
  };

  // Function to handle closing the delete confirmation dialog
  const handleCloseDeleteModal = (deleted = false) => {
    setIsDeleteModalOpen(false);
  };

  const handleCreateDefaults = async () => {
    setIsCreatingDefaults(true);
    try {
      const response = await createDefaultVocabularyExercises();
      if (response.success) {
        // Use router.refresh() instead of window.location.reload()
        router.refresh();
      } else {
        console.error('Error creating default exercises:', response.error);
        // You can add toast notification here if available
      }
    } catch (error) {
      console.error('Error creating default exercises:', error);
    } finally {
      setIsCreatingDefaults(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen"
    >
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {!error && initialExercises.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="flex min-h-[60vh] items-center justify-center"
        >
          <Card className="mx-auto mb-6 max-w-2xl border-dashed">
            <CardContent className="flex flex-col items-center pt-8 pb-6 text-center">
              <motion.div
                className="bg-muted mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                variants={pulseVariants}
                animate="pulse"
              >
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Plus className="text-muted-foreground h-8 w-8" />
                </motion.div>
              </motion.div>
              <motion.h3
                className="mb-2 text-lg font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Bạn chưa có bài tập từ vựng nào
              </motion.h3>
              <motion.p
                className="text-muted-foreground mb-6 max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Hãy tạo bài tập từ vựng đầu tiên của bạn để bắt đầu luyện tập.
                Bạn có thể tạo bài tập mới hoặc sử dụng các bài tập mẫu.
              </motion.p>
              <motion.div
                className="flex flex-col gap-4 md:flex-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <VocabularyModal
                  mode="create"
                  buttonSize="lg"
                  className="min-w-[200px]"
                />

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleCreateDefaults}
                    disabled={isCreatingDefaults}
                    size="lg"
                    variant="outline"
                    className="min-w-[200px]"
                  >
                    <motion.div
                      animate={
                        isCreatingDefaults ? { rotate: 360 } : { rotate: 0 }
                      }
                      transition={{
                        duration: 1,
                        repeat: isCreatingDefaults ? Infinity : 0,
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                    </motion.div>
                    {isCreatingDefaults ? 'Đang tạo...' : 'Tạo bài tập mẫu'}
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!error && initialExercises.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <motion.div
            className="mx-auto max-w-7xl"
            variants={containerVariants}
          >
            {/* Header Section */}
            <motion.div
              className="mb-8 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="bg-primary relative overflow-hidden rounded-full p-2"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Trophy className="relative z-10 h-5 w-5 text-white sm:h-6 sm:w-6" />
                </motion.div>
                <motion.h1
                  className="text-xl font-bold sm:text-2xl lg:text-3xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Luyện Tập Từ Vựng
                </motion.h1>
              </div>

              {/* Search Bar */}
              <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
                <VocabularySearch onSearchResults={handleSearchResults} />
              </motion.div>
            </motion.div>

            {/* Search Results Info */}
            <AnimatePresence>
              {searchResults !== null && (
                <motion.div
                  className="bg-muted mb-6 flex items-center justify-between rounded-md px-4 py-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-muted-foreground text-sm">
                    {searchResults.length === 0
                      ? 'Không tìm thấy kết quả nào'
                      : `Tìm thấy ${searchResults.length} kết quả`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Statistics */}
            <motion.div
              className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
                <Card className="overflow-hidden py-0 transition-shadow hover:shadow-lg">
                  <CardContent className="relative p-0">
                    <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
                      <Image
                        src={cuteStudying}
                        alt="Cute studying character"
                        fill
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 z-10 flex items-center justify-between p-6">
                        <div className="rounded-lg bg-blue-500/80 p-4 shadow-lg">
                          <p className="text-sm font-bold">Tổng bài tập</p>
                          <motion.p
                            className="text-2xl font-bold"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              delay: 0.3,
                              type: 'spring',
                              stiffness: 200,
                            }}
                          >
                            {initialExercises.length}
                          </motion.p>
                        </div>
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Target className="h-8 w-8 text-blue-600" />
                        </motion.div>
                      </div>
                    </AspectRatio>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
                <Card className="overflow-hidden py-0 transition-shadow hover:shadow-lg">
                  <CardContent className="relative p-0">
                    <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
                      <Image
                        src={cutePool}
                        alt="Cute character in hoodie"
                        fill
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 z-10 flex items-center justify-between p-6">
                        <div className="rounded-lg bg-green-500/80 p-4 shadow-lg">
                          <p className="text-sm font-bold">Đã hoàn thành</p>
                          <motion.p
                            className="text-2xl font-bold"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              delay: 0.4,
                              type: 'spring',
                              stiffness: 200,
                            }}
                          >
                            {
                              initialExercises.filter(
                                (ex) => ex.results.length > 0,
                              ).length
                            }
                          </motion.p>
                        </div>
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          <Trophy className="h-8 w-8 text-green-600" />
                        </motion.div>
                      </div>
                    </AspectRatio>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
                <Card className="overflow-hidden py-0 transition-shadow hover:shadow-lg">
                  <CardContent className="relative p-0">
                    <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
                      <Image
                        src={cuteFood}
                        alt="Cute characters with food"
                        fill
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 z-10 flex items-center justify-between p-6">
                        <div className="rounded-lg bg-orange-500/80 p-4 shadow-lg">
                          <p className="text-sm font-bold">Tổng điểm</p>
                          <motion.p
                            className="text-2xl font-bold"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              delay: 0.5,
                              type: 'spring',
                              stiffness: 200,
                            }}
                          >
                            {initialExercises.length > 0
                              ? Math.round(
                                  initialExercises
                                    .filter((ex) => ex.results.length > 0)
                                    .reduce(
                                      (acc, ex) =>
                                        acc + (ex.results[0]?.score || 0),
                                      0,
                                    ) /
                                    Math.max(
                                      initialExercises.filter(
                                        (ex) => ex.results.length > 0,
                                      ).length,
                                      1,
                                    ),
                                )
                              : 0}
                            %
                          </motion.p>
                        </div>
                        <motion.div
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100"
                          whileHover={{
                            scale: 1.2,
                            backgroundColor: '#fed7aa',
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="font-bold text-orange-600">%</span>
                        </motion.div>
                      </div>
                    </AspectRatio>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Exercises Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                key={searchResults ? 'search' : 'all'}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {displayExercises.length === 0 && searchResults !== null ? (
                  <motion.div
                    className="col-span-full py-12 text-center"
                    variants={itemVariants}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <Search className="mx-auto mb-4 h-12 w-12" />
                    </motion.div>
                    <h3 className="mb-2 text-lg font-medium">
                      Không tìm thấy kết quả nào
                    </h3>
                    <p>Hãy thử tìm kiếm với từ khóa khác</p>
                  </motion.div>
                ) : (
                  displayExercises.map((exercise, index) => {
                    const lastResult = exercise.results[0];
                    const isCompleted = exercise.results.length > 0;

                    return (
                      <motion.div
                        key={exercise.id}
                        variants={cardVariants}
                        whileHover="hover"
                        layout
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{
                          layout: { duration: 0.3 },
                          delay: index * 0.1,
                        }}
                      >
                        <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-xl">
                          <motion.div
                            className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-100"
                            layoutId={`background-${exercise.id}`}
                          />
                          <CardHeader className="relative z-10 pb-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <CardTitle className="mb-1 text-lg font-semibold">
                                    {exercise.title}
                                  </CardTitle>
                                  {exercise.description && (
                                    <CardDescription className="text-sm">
                                      {exercise.description}
                                    </CardDescription>
                                  )}
                                </motion.div>
                              </div>

                              {/* Menu for edit and delete */}
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                                    >
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
                                      onClick={() =>
                                        handleDeleteClick(exercise)
                                      }
                                    >
                                      <Trash2 size={14} />
                                      Xóa
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </motion.div>
                            </div>
                          </CardHeader>

                          <CardContent className="relative z-10 py-3">
                            <motion.div
                              className="space-y-3"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              {/* Progress Info */}
                              <div className="flex items-center justify-between text-sm">
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.4 }}
                                >
                                  {exercise.pairs.length} từ
                                </motion.span>
                                {lastResult && (
                                  <motion.span
                                    className="flex items-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                  >
                                    <Clock className="mr-1 h-3 w-3" />
                                    {Math.floor(lastResult.timeSpent / 60)}:
                                    {(lastResult.timeSpent % 60)
                                      .toString()
                                      .padStart(2, '0')}
                                  </motion.span>
                                )}
                              </div>

                              {/* Progress Bar */}
                              {isCompleted && (
                                <motion.div
                                  className="space-y-1"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.6, type: 'spring' }}
                                >
                                  <Progress
                                    value={lastResult.score}
                                    className="h-2"
                                  />
                                  <div className="flex justify-between text-xs">
                                    <span>Điểm: {lastResult.score}%</span>
                                    <span>{lastResult.attempts} lần thử</span>
                                  </div>
                                </motion.div>
                              )}
                            </motion.div>
                          </CardContent>

                          <CardFooter className="relative z-10 pt-1">
                            {/* Action Button */}
                            <Link
                              href={`/vocabulary/${exercise.id}`}
                              className="w-full"
                            >
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full"
                              >
                                <Button
                                  className="group/btn w-full"
                                  variant={isCompleted ? 'outline' : 'default'}
                                >
                                  <motion.div
                                    className="flex items-center"
                                    whileHover={{ x: 2 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Play className="mr-2 h-4 w-4 group-hover/btn:animate-pulse" />
                                    {isCompleted ? 'Luyện lại' : 'Bắt đầu'}
                                  </motion.div>
                                </Button>
                              </motion.div>
                            </Link>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    );
                  })
                )}

                {/* Add New Exercise Card */}
                {searchResults === null && (
                  <motion.div
                    variants={cardVariants}
                    whileHover="hover"
                    className="h-full"
                  >
                    <Card className="hover:border-primary group flex h-full items-center justify-center border-2 border-dashed transition-all duration-300 hover:shadow-lg">
                      <CardContent className="flex items-center justify-center p-8">
                        <VocabularyModal
                          mode="create"
                          buttonVariant="ghost"
                          trigger={
                            <motion.div
                              className="flex h-auto flex-col items-center gap-2 py-4"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <motion.div
                                animate={{
                                  scale: [1, 1.1, 1],
                                  rotate: [0, 90, 0],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }}
                              >
                                <Plus className="group-hover:text-primary h-8 w-8 transition-colors" />
                              </motion.div>
                              <span className="group-hover:text-primary text-sm transition-colors">
                                Tạo bài tập từ vựng mới
                              </span>
                            </motion.div>
                          }
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Delete confirmation dialog */}
            <AnimatePresence>
              {deletingExercise && (
                <VocabularyDeleteDialog
                  isOpen={isDeleteModalOpen}
                  exerciseId={deletingExercise.id}
                  exerciseTitle={deletingExercise.title}
                  onClose={handleCloseDeleteModal}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
