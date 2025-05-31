'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { deleteVocabularyExercise } from '@/app/actions/vocabulary';
import { motion } from 'framer-motion';

interface VocabularyDeleteDialogProps {
    isOpen: boolean;
    exerciseId: string;
    exerciseTitle: string;
    onClose: (deleted?: boolean) => void;
}

export default function VocabularyDeleteDialog({
    isOpen,
    exerciseId,
    exerciseTitle,
    onClose,
}: VocabularyDeleteDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        let deleteSuccessful = false;

        try {
            setIsDeleting(true);

            const response = await deleteVocabularyExercise(exerciseId);

            if (response.success) {
                deleteSuccessful = true;
                toast.success('Đã xóa bài tập từ vựng', {
                    description: 'Bài tập từ vựng đã được xóa thành công'
                });
            } else {
                toast.error('Không thể xóa bài tập từ vựng', {
                    description: response.error?.message || 'Đã xảy ra lỗi không xác định'
                });
            }
        } catch (error) {
            toast.error('Lỗi khi xóa bài tập từ vựng', {
                description: error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'
            });
        } finally {
            setIsDeleting(false);
            // Pass true to onClose if deletion was successful
            onClose(deleteSuccessful);
            router.refresh();
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
                        Xóa bài tập từ vựng
                    </DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn xóa bài tập từ vựng <span className="font-medium">"{exerciseTitle}"</span>?
                        Hành động này không thể hoàn tác và tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onClose()} disabled={isDeleting}>
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
                            'Xóa bài tập'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
