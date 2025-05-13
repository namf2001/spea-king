"use client"

import { Button } from "@/components/ui/button"
import { Mic, Play, SkipForward, VolumeX, Volume2 } from "lucide-react"

interface ExerciseControlsProps {
    readonly isListening: boolean
    readonly isSpeaking: boolean
    readonly isRecognizing: boolean
    readonly onStartListening: () => Promise<void>
    readonly onStopListening: () => void
    readonly onPlayExample: () => Promise<void>
    readonly onNextExercise: () => void
}

export function ExerciseControls({
    isListening,
    isSpeaking,
    isRecognizing,
    onStartListening,
    onStopListening,
    onPlayExample,
    onNextExercise,
}: ExerciseControlsProps) {
    return (
        <div className="flex flex-wrap gap-3 justify-center mb-6">
            <Button onClick={onPlayExample} variant="outline" className="flex items-center gap-2" disabled={isSpeaking}>
                {isSpeaking ? <Volume2 className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isSpeaking ? "Playing..." : "Listen to Example"}
            </Button>

            {isListening ? (
                <Button onClick={onStopListening} variant="destructive" className="flex items-center gap-2">
                    <VolumeX className="h-4 w-4" />
                    Stop Recording
                </Button>
            ) : (
                <Button
                    onClick={onStartListening}
                    variant="default"
                    className="flex items-center gap-2"
                    disabled={isRecognizing}
                >
                    <Mic className="h-4 w-4" />
                    {isRecognizing ? "Listening..." : "Start Recording"}
                </Button>
            )}

            <Button onClick={onNextExercise} variant="ghost" className="flex items-center gap-2">
                <SkipForward className="h-4 w-4" />
                Next Exercise
            </Button>
        </div>
    )
}
