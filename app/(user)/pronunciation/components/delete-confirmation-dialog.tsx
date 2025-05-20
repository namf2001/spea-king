"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2, AlertTriangle } from "lucide-react"
import { deletePronunciationLesson } from "@/app/actions/pronunciation"
import { motion } from "framer-motion"

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  lessonId: string
  lessonTitle: string
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteConfirmationDialog({
  isOpen,
  lessonId,
  lessonTitle,
  onClose,
  onSuccess
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await deletePronunciationLesson(lessonId)
      
      if (response.success) {
        toast.success("Lesson deleted", {
          description: "The lesson has been successfully removed"
        })
        onSuccess()
      } else {
        toast.error("Failed to delete lesson", {
          description: response.error || "An unknown error occurred"
        })
      }
    } catch (error) {
      toast.error("Error deleting lesson", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      })
    } finally {
      setIsDeleting(false)
      onClose()
    }
  }

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
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </motion.div>
            Delete Lesson
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-semibold">"{lessonTitle}"</span>? 
            This action cannot be undone and all associated words will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
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
                Deleting...
              </>
            ) : (
              'Delete Lesson'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}