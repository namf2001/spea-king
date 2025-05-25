"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import type { PronunciationLesson, PronunciationWord } from "@prisma/client"

interface ExerciseDisplayProps {
    readonly exercise: PronunciationLesson & {
        words: PronunciationWord[]
    }
    readonly currentIndex: number
    readonly totalExercises: number
    readonly currentWordIndex?: number
}

export function ExerciseDisplay({ 
    exercise, 
    currentIndex, 
    totalExercises, 
    currentWordIndex = 0 
}: ExerciseDisplayProps) {
    const currentWord = exercise.words[currentWordIndex]
    const wordProgress = `${currentWordIndex + 1}/${exercise.words.length}`

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            key={`${currentIndex}-${currentWordIndex}`}
            className="mb-8"
        >
            <Card className="mb-8 border-2 shadow-md pt-0 bg-gradient-to-b from-primary/10 to-background">
                <CardHeader className="py-4 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            {exercise.title} - {currentIndex + 1}/{totalExercises}
                        </CardTitle>
                        <div className="text-sm bg-primary/10 px-2 py-1 rounded-full">
                            Word: {wordProgress}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pb-2">
                    <div className="p-6 rounded-lg mb-6 text-center relative shadow-inner bg-primary/10">
                        <p className="text-2xl font-medium tracking-wide">{currentWord.word}</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}