import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Exercise } from "../data/exercises"
import { motion } from "framer-motion"
import { Volume2 } from "lucide-react"


interface ExerciseDisplayProps {
    readonly exercise: Exercise
    readonly currentIndex: number
    readonly totalExercises: number
    readonly onPlayExample?: () => void
}

export function ExerciseDisplay({ exercise, currentIndex, totalExercises, onPlayExample }: ExerciseDisplayProps) {
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
                            Exercise {currentIndex + 1}/{totalExercises}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pb-2">
                    <div className="p-6 rounded-lg mb-6 text-center relative border-4 shadow-inner bg-primary/10">
                        <p className="text-2xl font-medium tracking-wide">{exercise.text}</p>
                        {onPlayExample && (
                            <button 
                                onClick={onPlayExample}
                                className="absolute top-3 right-3 p-2 text-blue-600 hover:text-blue-800 
                                dark:text-blue-400 dark:hover:text-blue-200 rounded-full 
                                hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
                                aria-label="Play pronunciation example"
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
