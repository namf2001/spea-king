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
import { deleteConversationTopic } from "@/app/actions/conversation"

interface DeleteTopicDialogProps {
  isOpen: boolean
  topicId: string
  topicTitle: string
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteTopicDialog({
  isOpen,
  topicId,
  topicTitle,
  onClose,
  onSuccess
}: DeleteTopicDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await deleteConversationTopic(topicId)
      
      if (response.success) {
        toast.success("Topic deleted", {
          description: "The conversation topic has been successfully removed"
        })
        onSuccess()
      } else {
        toast.error("Failed to delete topic", {
          description: response.error || "An unknown error occurred"
        })
      }
    } catch (error) {
      toast.error("Error deleting topic", {
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
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Conversation Topic
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-medium">"{topicTitle}"</span>? 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}