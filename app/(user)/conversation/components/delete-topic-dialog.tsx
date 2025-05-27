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
import { deleteConversationTopic } from '@/app/actions/conversation';

interface DeleteTopicDialogProps {
  isOpen: boolean;
  topicId: string;
  topicTitle: string;
  userId: string;
  onClose: () => void;
}

export default function DeleteTopicDialog({
  isOpen,
  topicId,
  topicTitle,
  userId,
  onClose,
}: DeleteTopicDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await deleteConversationTopic(topicId, userId);

      if (response.success) {
        toast.success('Topic deleted', {
          description: 'The conversation topic has been successfully removed',
        });
      } else {
        toast.error('Failed to delete topic', {
          description: response.error?.message || 'An unknown error occurred',
        });
      }
    } catch (error) {
      toast.error('Error deleting topic', {
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
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
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="text-destructive h-5 w-5" />
            Delete Conversation Topic
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-medium">"{topicTitle}"</span>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
