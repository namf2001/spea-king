'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Plus, AlertCircle, MessageCircle, Trash2, MoreVertical, Edit, ArrowRight } from 'lucide-react';
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
import TopicForm from './topic-form';
import DeleteTopicDialog from './delete-topic-dialog';
import { ConversationTopic } from '@prisma/client';

export default function ConversationTopicsContent({
  topics,
  userId,
  error,
}: {
  topics: ConversationTopic[];
  userId: string;
  error?: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // State to track which topic is being edited or deleted
  const [editingTopic, setEditingTopic] = useState<ConversationTopic | null>(
    null,
  );
  const [deletingTopic, setDeletingTopic] = useState<ConversationTopic | null>(
    null,
  );
  // Determine if we're in edit mode
  const isEditMode = !!editingTopic;

  // Refs to store timeout IDs for cleanup
  const modalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const deleteModalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (modalTimeoutRef.current) {
        clearTimeout(modalTimeoutRef.current);
      }
      if (deleteModalTimeoutRef.current) {
        clearTimeout(deleteModalTimeoutRef.current);
      }
    };
  }, []);

  // Function to handle opening the edit modal
  const handleEditTopic = (topic: ConversationTopic) => {
    setEditingTopic(topic);
    setIsModalOpen(true);
  };

  // Function to handle opening the delete confirmation dialog
  const handleDeleteClick = (topic: ConversationTopic) => {
    setDeletingTopic(topic);
    setIsDeleteModalOpen(true);
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Clear any existing timeout
    if (modalTimeoutRef.current) {
      clearTimeout(modalTimeoutRef.current);
    }
    // Reset editing state after modal is closed
    modalTimeoutRef.current = setTimeout(() => {
      setEditingTopic(null);
    }, 300); // Small delay to avoid flickering during modal animation
  };

  // Function to handle closing the delete confirmation dialog
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    // Clear any existing timeout
    if (deleteModalTimeoutRef.current) {
      clearTimeout(deleteModalTimeoutRef.current);
    }
    // Store the timeout ID in the ref for cleanup on unmount
    deleteModalTimeoutRef.current = setTimeout(() => {
      setDeletingTopic(null);
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

      {!error && topics.length === 0 && (
        <Card className="mb-6 border-dashed">
          <CardContent className="flex flex-col items-center pt-8 pb-6 text-center">
            <div className="bg-muted mb-5 flex h-16 w-16 items-center justify-center rounded-full">
              <Plus className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              Chưa có chủ đề giao tiếp
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Tạo chủ đề giao tiếp đầu tiên của bạn để bắt đầu luyện tập.
              Bạn có thể thêm các chủ đề thú vị để thảo luận.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center"
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" /> Create your first topic
            </Button>
          </CardContent>
        </Card>
      )}

      {!error && topics.length > 0 && (
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
                <MessageCircle className="relative z-10 h-5 w-5 text-white sm:h-6 sm:w-6" />
              </motion.div>
              <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">
                Chủ Đề Giao Tiếp
              </h1>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => {
                  setEditingTopic(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2"
                size="sm"
              >
                <Plus className="h-4 w-4" /> Thêm Chủ Đề Mới
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
            {topics.map((topic, index) => (
              <motion.div
                key={topic.id}
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
                      className="absolute inset-0 group-hover:opacity-100 transition-opacity duration-300"
                      layoutId={`background-${topic.id}`}
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
                              {topic.title}
                            </CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {new Date(topic.createdAt).toLocaleDateString()}
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
                                onClick={() => handleEditTopic(topic)}
                              >
                                <Edit size={14} />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive flex cursor-pointer items-center gap-2"
                                onClick={() => handleDeleteClick(topic)}
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
                        {/* Description */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <p className="text-muted-foreground mb-2 line-clamp-3 text-sm">
                            {topic.description}
                          </p>
                        </motion.div>
                      </motion.div>
                    </CardContent>

                    <CardFooter className="pt-1 relative z-10">
                      {/* Action Button */}
                      <Link href={`/conversation/${topic.id}`} className="w-full">
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
                              Bắt đầu giao tiếp
                              <ArrowRight className="ml-1" />
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

      {/* Add/Edit topic modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? 'Edit Conversation Topic'
                : 'Add New Conversation Topic'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Update your conversation topic details.'
                : 'Create a new conversation topic to practice speaking about.'}
            </DialogDescription>
          </DialogHeader>
          <TopicForm
            onCancel={handleCloseModal}
            onSuccess={handleCloseModal}
            topic={editingTopic || undefined}
            mode={isEditMode ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      {deletingTopic && (
        <DeleteTopicDialog
          isOpen={isDeleteModalOpen}
          topicId={deletingTopic.id}
          topicTitle={deletingTopic.title}
          onClose={handleCloseDeleteModal}
        />
      )}
    </>
  );
}
