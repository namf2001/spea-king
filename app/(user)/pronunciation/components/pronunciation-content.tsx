'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, AlertCircle, Mic, Trash2, ArrowRight, MoreVertical, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LessonForm from './lesson-form';
import DeleteConfirmationDialog from './delete-pronunciation-dialog';
import {
  type PronunciationLesson,
  type PronunciationLessonWord,
  type PronunciationWord,
} from '@prisma/client';

// Define a type that includes the words relation
type PronunciationLessonWithWords = PronunciationLesson & {
  words: (PronunciationLessonWord & {
    word: PronunciationWord;
  })[];
};

export default function PronunciationContent({
  lessons,
  error,
}: {
  lessons: PronunciationLessonWithWords[];
  error?: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // State to track which lesson is being edited or deleted
  const [editingLesson, setEditingLesson] =
    useState<PronunciationLessonWithWords | null>(null);
  const [deletingLesson, setDeletingLesson] =
    useState<PronunciationLessonWithWords | null>(null);
  // Determine if we're in edit mode
  const isEditMode = !!editingLesson;

  // Function to handle opening the edit modal
  const handleEditLesson = (lesson: PronunciationLessonWithWords) => {
    setEditingLesson(lesson);
    setIsModalOpen(true);
  };

  // Function to handle opening the delete confirmation dialog
  const handleDeleteClick = (lesson: PronunciationLessonWithWords) => {
    setDeletingLesson(lesson);
    setIsDeleteModalOpen(true);
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset editing state after modal is closed
    setTimeout(() => {
      setEditingLesson(null);
    }, 300); // Small delay to avoid flickering during modal animation
  };

  // Function to handle closing the delete confirmation dialog
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTimeout(() => {
      setDeletingLesson(null);
    }, 300);
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && lessons.length === 0 && (
        <Card className="mb-6 border-dashed">
          <CardContent className="flex flex-col items-center pt-8 pb-6 text-center">
            <div className="bg-muted mb-5 flex h-16 w-16 items-center justify-center rounded-full">
              <Plus className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              Chưa có bài học phát âm
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Tạo bài học phát âm tùy chỉnh đầu tiên của bạn để bắt đầu luyện tập.
              Bạn có thể thêm các từ hoặc cụm từ bạn muốn cải thiện.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center"
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" /> Tạo bài học đầu tiên
            </Button>
          </CardContent>
        </Card>
      )}

      {!error && lessons.length > 0 && (
        <>
          <div className="animate-slideInLeft mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="bg-primary relative overflow-hidden rounded-full p-2"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <motion.div
                  className="bg-primary-foreground/20 absolute inset-0"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0, 0.3, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: 'easeInOut',
                  }}
                />
                <Mic className="relative z-10 h-5 w-5 text-white sm:h-6 sm:w-6" />
              </motion.div>
              <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">
                Luyện Tập Phát Âm
              </h1>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => {
                  setEditingLesson(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" /> Bài Học Mới
              </Button>
            </motion.div>
          </div>
          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  show: { y: 0, opacity: 1 },
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <motion.div
                  whileHover={{
                    y: -5,
                    boxShadow:
                      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  className="h-full rounded-xl"
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <motion.div
                      className="absolute inset-0"
                      layoutId={`background-${lesson.id}`}
                    />
                    <CardHeader className="pb-2 relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <CardTitle className="text-lg font-semibold mb-1">
                              {lesson.title}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {new Date(lesson.createdAt).toLocaleDateString()}
                            </Badge>
                          </motion.div>
                        </div>

                        {/* Menu for edit and delete */}
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="flex cursor-pointer items-center gap-2"
                                onClick={() => handleEditLesson(lesson)}
                              >
                                <Edit size={14} />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive flex cursor-pointer items-center gap-2"
                                onClick={() => handleDeleteClick(lesson)}
                              >
                                <Trash2 size={14} />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </motion.div>
                      </div>
                    </CardHeader>

                    <CardContent className="py-3 relative z-10">
                      <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {/* Progress Info */}
                        <div className="flex items-center justify-between text-sm">
                          <motion.div
                            className="flex items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <motion.div
                              className="mr-2 h-2 w-2 rounded-full bg-green-500"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            />
                            <span>
                              {lesson.words.length} từ để luyện tập
                            </span>
                          </motion.div>
                        </div>

                        {/* Word badges */}
                        <motion.div
                          className="flex flex-wrap gap-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          {lesson.words.slice(0, 3).map((lessonWord) => (
                            <Badge
                              key={lessonWord.id}
                              variant="secondary"
                              className="text-xs max-w-[120px] truncate h-6 inline-flex items-center whitespace-nowrap"
                            >
                              {lessonWord.word.word}
                            </Badge>
                          ))}
                          {lesson.words.length > 3 && (
                            <Badge variant="secondary" className="text-xs h-6 inline-flex items-center">
                              +{lesson.words.length - 3} từ nữa
                            </Badge>
                          )}
                        </motion.div>
                      </motion.div>
                    </CardContent>

                    <CardFooter className="pt-1 relative z-10">
                      {/* Action Button */}
                      <Link href={`/pronunciation/${lesson.id}`} className="w-full">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full"
                        >
                          <Button className="w-full group/btn">
                            <motion.div
                              className="flex items-center"
                              whileHover={{ x: 2 }}
                              transition={{ duration: 0.2 }}
                            >
                              Luyện Tập Ngay
                              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:animate-pulse" />
                            </motion.div>
                          </Button>
                        </motion.div>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {/* Add/Edit lesson modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? 'Chỉnh Sửa Bài Học Phát Âm'
                : 'Thêm Bài Học Phát Âm Mới'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Cập nhật bài học phát âm của bạn với các từ mới để luyện tập.'
                : 'Tạo bài học phát âm của riêng bạn với các câu tùy chỉnh để luyện tập.'}
            </DialogDescription>
          </DialogHeader>
          <LessonForm
            onCancel={handleCloseModal}
            onSuccess={handleCloseModal}
            lesson={editingLesson || undefined}
            mode={isEditMode ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      {deletingLesson && (
        <DeleteConfirmationDialog
          isOpen={isDeleteModalOpen}
          lessonId={deletingLesson.id}
          lessonTitle={deletingLesson.title}
          onClose={handleCloseDeleteModal}
        />
      )}
    </>
  );
}
