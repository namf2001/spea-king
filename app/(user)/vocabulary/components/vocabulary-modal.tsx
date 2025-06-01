'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Edit2 } from 'lucide-react';
import { VocabularyForm } from './vocabulary-form';

interface VocabularyPair {
  id?: string;
  englishWord: string;
  vietnameseWord: string;
}

interface VocabularyExercise {
  id: string;
  title: string;
  description: string | null;
  pairs: VocabularyPair[];
}

interface VocabularyModalProps {
  mode: 'create' | 'edit';
  exercise?: VocabularyExercise;
  trigger?: React.ReactNode;
  buttonVariant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'secondary';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function VocabularyModal({
  mode = 'create',
  exercise,
  trigger,
  buttonVariant = mode === 'create' ? 'default' : 'outline',
  buttonSize = mode === 'create' ? 'default' : 'sm',
  className,
}: VocabularyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isEditMode = mode === 'edit';

  // Validation for edit mode
  if (isEditMode && !exercise) {
    console.error('Exercise object is required in edit mode');
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
  };

  // Determine modal title and description based on mode
  const modalTitle = isEditMode
    ? 'Chỉnh sửa bài tập từ vựng'
    : 'Tạo bài tập từ vựng mới';
  const modalDescription = isEditMode
    ? 'Cập nhật tiêu đề, mô tả hoặc các cặp từ vựng cho bài tập của bạn.'
    : 'Thêm tiêu đề, mô tả và các cặp từ vựng Anh - Việt để tạo bài tập mới.';

  // Default trigger button based on mode
  const defaultTrigger = (
    <Button variant={buttonVariant} size={buttonSize} className={className}>
      {isEditMode ? (
        <>
          <Edit2 className="mr-2 h-4 w-4" /> Chỉnh sửa
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" /> Thêm bài tập mới
        </>
      )}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>
        <VocabularyForm
          mode={mode}
          exercise={exercise}
          onSuccess={handleClose}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
