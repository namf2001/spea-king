import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Exercise } from "../data/exercises"
import { motion } from "framer-motion"
import { Volume2 } from "lucide-react"
import { useState } from "react"

const getBadgeVariant = (difficulty: Exercise["difficulty"]) => {
    if (difficulty === "easy") return "outline"
    if (difficulty === "medium") return "secondary"
    return "destructive"
}

interface ExerciseDisplayProps {
    readonly exercise: Exercise
    readonly currentIndex: number
    readonly totalExercises: number
    readonly onPlayExample?: () => void
}

export function ExerciseDisplay({ exercise, currentIndex, totalExercises, onPlayExample }: ExerciseDisplayProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Handle the play button click with audio context unlocking for mobile
    const handlePlayExample = () => {
        if (!onPlayExample || isPlaying) return;
        
        setIsPlaying(true);
        
        try {
            // Create and immediately play silent audio to unlock audio context on mobile
            const silentAudio = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABGwD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwA8MAAAAAAAAAABQgJAi4QAAB4AAABRsgyDfkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sUZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUZCgP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUZEwP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUZHIP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
            silentAudio.play().catch(err => console.log("Silent audio play failed:", err));
            
            // Then play the actual speech after a short delay
            setTimeout(() => {
                onPlayExample();
                // Reset state after a short delay
                setTimeout(() => setIsPlaying(false), 1000);
            }, 50);
        } catch (err) {
            console.error("Error in play example handler:", err);
            onPlayExample();
            // Reset state even if there was an error
            setTimeout(() => setIsPlaying(false), 1000);
        }
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            key={currentIndex}
        >
            <Card className="mb-8 border-2 border-blue-100 dark:border-blue-900 shadow-md pt-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 py-4 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-blue-800 dark:text-blue-300">
                            Exercise {currentIndex + 1}/{totalExercises}
                        </CardTitle>
                        <Badge variant={getBadgeVariant(exercise.difficulty)} className="text-sm font-medium">
                            {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                        </Badge>
                    </div>
                    <CardDescription className="text-blue-600 dark:text-blue-400 font-medium">
                        Focus on the <span className="text-blue-800 dark:text-blue-200 font-bold">"{exercise.focusSound}"</span> sound
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div 
                        className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg mb-6 text-center relative
                        border border-blue-100 dark:border-blue-800 shadow-inner"
                    >
                        <p className="text-2xl font-medium tracking-wide">{exercise.text}</p>
                        {onPlayExample && (
                            <button 
                                onClick={handlePlayExample}
                                disabled={isPlaying}
                                className={`absolute top-3 right-3 p-2 
                                ${isPlaying 
                                    ? 'text-blue-400 dark:text-blue-300 cursor-not-allowed' 
                                    : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800/50'
                                } 
                                rounded-full transition-colors`}
                                aria-label="Play pronunciation example"
                            >
                                <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
                            </button>
                        )}
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-100 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <span className="font-bold">Tip:</span> Pay close attention to how your mouth and tongue position 
                            changes when making the "{exercise.focusSound}" sound.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
