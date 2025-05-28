'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, AlertCircle, Mic, Trash2 } from 'lucide-react';
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
              No pronunciation lessons yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first custom pronunciation lesson to start practicing.
              You can add words or phrases you want to improve.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center"
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" /> Create your first lesson
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
                Pronunciation Practice
              </h1>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => {
                  setEditingLesson(null); // Ensure we're in create mode
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" /> New Lesson
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
                  className="rounded-2xl"
                >
                  <Card className="hover:border-primary/50 overflow-hidden border transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="font-bold">
                          {lesson.title}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {new Date(lesson.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2 flex items-center">
                        <motion.div
                          className="mr-2 h-2 w-2 rounded-full bg-green-500"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        ></motion.div>
                        <p className="text-sm font-medium">
                          {lesson.words.length}{' '}
                          {lesson.words.length === 1 ? 'word' : 'words'} to
                          practice
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {lesson.words.slice(0, 3).map((lessonWord) => (
                          <Badge
                            key={lessonWord.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {lessonWord.word.word}
                          </Badge>
                        ))}
                        {lesson.words.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{lesson.words.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted flex items-center justify-between border-t px-4">
                      <DropdownMenu>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1 text-xs"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-edit"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                        </motion.div>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            className="flex cursor-pointer items-center gap-2"
                            onClick={() => handleEditLesson(lesson)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-edit"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive flex cursor-pointer items-center gap-2"
                            onClick={() => handleDeleteClick(lesson)}
                          >
                            <Trash2 size={14} />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="sm"
                          className="flex items-center gap-1"
                          asChild
                        >
                          <Link href={`/pronunciation/${lesson.id}`}>
                            Practice Now
                            <motion.svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="ml-1"
                              animate={{ x: [0, 3, 0] }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                repeatType: 'reverse',
                              }}
                            >
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </motion.svg>
                          </Link>
                        </Button>
                      </motion.div>
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
                ? 'Edit Pronunciation Lesson'
                : 'Add New Pronunciation Lesson'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update your pronunciation lesson with new words to practice.'
                : 'Create your own pronunciation lesson with custom sentences to practice.'}
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
