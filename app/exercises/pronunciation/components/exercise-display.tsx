import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Exercise } from "../data/exercises"

const getBadgeVariant = (difficulty: Exercise["difficulty"]) => {
    if (difficulty === "easy") return "outline"
    if (difficulty === "medium") return "secondary"
    return "destructive"
}

interface ExerciseDisplayProps {
    readonly exercise: Exercise
    readonly currentIndex: number
    readonly totalExercises: number
}

export function ExerciseDisplay({ exercise, currentIndex, totalExercises }: ExerciseDisplayProps) {
    return (
        <Card className="mb-8">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>
                        Exercise {currentIndex + 1}/{totalExercises}
                    </CardTitle>
                    <Badge variant={getBadgeVariant(exercise.difficulty)}>
                        {exercise.difficulty}
                    </Badge>
                </div>
                <CardDescription>Focus on the "{exercise.focusSound}" sound</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-6 text-center">
                    <p className="text-xl font-medium">{exercise.text}</p>
                </div>
            </CardContent>
        </Card>
    )
}
