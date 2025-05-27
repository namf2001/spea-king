'use client';

import { useState, useTransition } from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { deleteReflexQuestion } from '@/app/actions/reflex';

interface DeleteQuestionDialogProps {
  isOpen: boolean;
  questionId: string;
  questionText: string;
  userId: string;
  onClose: () => void;
}

export default function DeleteQuestionDialog({
  isOpen,
  questionId,
  questionText,
  userId,
  onClose,
}: DeleteQuestionDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);

    startTransition(async () => {
      try {
        const response = await deleteReflexQuestion(questionId);

        if (!response.success) {
          throw new Error(
            response.error?.message || 'Failed to delete question',
          );
        }

        onClose();
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unexpected error occurred');
        }
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive h-5 w-5" />
            Delete Question
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this question? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 my-2 rounded-md border p-3">
          <p className="truncate text-sm font-medium">{questionText}</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="gap-1"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
