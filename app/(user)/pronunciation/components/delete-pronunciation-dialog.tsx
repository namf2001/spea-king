'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';
import { deletePronunciationLesson } from '@/app/actions/pronunciation';
import { motion } from 'framer-motion';

interface DeletePronunciationDialogProps {
  isOpen: boolean;
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
}

export default function DeletePronunciationDialogProps({
  isOpen,
  lessonId,
  lessonTitle,
  onClose,
}: DeletePronunciationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await deletePronunciationLesson(lessonId);

      if (response.success) {
        toast.success('Đã xóa bài học', {
          description: 'Bài học đã được xóa thành công',
        });
      } else {
        toast.error('Không thể xóa bài học', {
          description: response.error?.message || 'Đã xảy ra lỗi không xác định',
        });
      }
    } catch (error) {
      toast.error('Lỗi khi xóa bài học', {
        description:
          error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định',
      });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <AlertTriangle className="text-destructive h-5 w-5" />
            </motion.div>
            Xóa Bài Học
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa{' '}
            <span className="font-semibold">"{lessonTitle}"</span>? Hành động này
            không thể hoàn tác và tất cả các từ liên quan sẽ bị xóa vĩnh viễn.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-1"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              'Xóa Bài Học'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
