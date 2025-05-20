"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AddLessonForm from "./add-lesson-form"

// Define types for clarity
type Word = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  word: string;
  lessonId: string;
}

type Lesson = {
  words: Word[];
  title: string;
  id: string;
  createdAt: Date;
  userId: string;
  updatedAt: Date;
}

export default function PronunciationLessonsContent(
    { lessons, userId, error }: { lessons: Lesson[], userId: string, error?: string }
) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!error && lessons.length === 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
            <p className="text-muted-foreground mb-4">You haven't created any pronunciation lessons yet.</p>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" /> Create your first lesson
            </Button>
          </CardContent>
        </Card>
      )}

      {!error && lessons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{lesson.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {lesson.words.length} words to practice
                </p>
              </CardContent>
              <CardFooter className="bg-muted p-4 flex justify-between">
                <div className="text-xs text-muted-foreground">
                  {new Date(lesson.createdAt).toLocaleDateString()}
                </div>
                <Button size="sm" asChild>
                  <Link href={`/pronunciation/${lesson.id}`}>Practice Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Floating action button (FAB) */}
      <motion.div
        className="fixed bottom-6 right-6"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          aria-label="Add new pronunciation lesson"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Add lesson modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Pronunciation Lesson</DialogTitle>
            <DialogDescription>
              Create your own pronunciation lesson with custom sentences to practice.
            </DialogDescription>
          </DialogHeader>
          <AddLessonForm 
            userId={userId}
            onCancel={() => setIsModalOpen(false)}
            onSuccess={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}