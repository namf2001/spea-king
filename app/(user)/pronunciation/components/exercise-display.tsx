import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import type { PronunciationLesson, PronunciationWord } from "@prisma/client"


interface ExerciseDisplayProps {
    readonly exercise: PronunciationLesson & {
        words: PronunciationWord[]
    }
    readonly currentIndex: number
    readonly totalExercises: number
}

export function ExerciseDisplay({ exercise, currentIndex, totalExercises }: ExerciseDisplayProps) {
    // Create a single string from all the words for display and pronunciation
    const exerciseText = exercise.words.map(word => word.word).join(" ")

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            key={currentIndex}
            className="mb-8"
        >
            <Card className="mb-8 border-2 shadow-md pt-0">
                <CardHeader className="py-4 rounded-t-lg bg-gradient-to-b from-primary/20 to-background">
                    <div className="flex justify-between items-center">
                        <CardTitle>
                            {exercise.title} - {currentIndex + 1}/{totalExercises}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pb-2">
                    <div className="p-6 rounded-lg mb-6 text-center relative border-4 shadow-inner bg-primary/10">
                        <p className="text-2xl font-medium tracking-wide">{exerciseText}</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
