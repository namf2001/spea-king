"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Mic, Play, SkipForward, VolumeX, Volume2 } from "lucide-react"
import { toast } from "sonner"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

// Sample pronunciation exercises
const exercises = [
    {
        id: 1,
        text: "The quick brown fox jumps over the lazy dog.",
        difficulty: "easy",
        focusSound: "th",
    },
    {
        id: 2,
        text: "She sells seashells by the seashore.",
        difficulty: "medium",
        focusSound: "s",
    },
    {
        id: 3,
        text: "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
        difficulty: "hard",
        focusSound: "w",
    },
    {
        id: 4,
        text: "Thirty-three thirsty, thundering thoroughbreds.",
        difficulty: "hard",
        focusSound: "th",
    },
    {
        id: 5,
        text: "Red lorry, yellow lorry.",
        difficulty: "medium",
        focusSound: "r/l",
    },
]

export default function PronunciationPage() {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [score, setScore] = useState<number | null>(null)
    const [feedback, setFeedback] = useState("")
    const { startRecognition, stopRecognition, recognizedText, isRecognizing } = useSpeechRecognition()
    const { speak, isSpeaking } = useSpeechSynthesis()
    const audioVisualizerRef = useRef<HTMLCanvasElement>(null)

    const currentExercise = exercises[currentExerciseIndex]

    useEffect(() => {
        if (recognizedText) {
            setTranscript(recognizedText)
            evaluatePronunciation(recognizedText)
        }
    }, [recognizedText])

    const handleStartListening = () => {
        setIsListening(true)
        setTranscript("")
        setScore(null)
        setFeedback("")
        startRecognition()
    }

    const handleStopListening = () => {
        setIsListening(false)
        stopRecognition()
    }

    const handlePlayExample = () => {
        speak(currentExercise.text)
    }

    const handleNextExercise = () => {
        setCurrentExerciseIndex((prev) => (prev + 1) % exercises.length)
        setTranscript("")
        setScore(null)
        setFeedback("")
    }

    const evaluatePronunciation = (text: string) => {
        // This is a simplified scoring algorithm
        // In a real app, you would use Azure's pronunciation assessment API
        const targetText = currentExercise.text.toLowerCase().replace(/[.,?!]/g, "")
        const spokenText = text.toLowerCase().replace(/[.,?!]/g, "")

        // Simple word match ratio
        const targetWords = targetText.split(" ")
        const spokenWords = spokenText.split(" ")

        let matchedWords = 0
        for (const targetWord of targetWords) {
            if (spokenWords.includes(targetWord)) {
                matchedWords++
            }
        }

        const matchRatio = targetWords.length > 0 ? (matchedWords / targetWords.length) * 100 : 0
        const calculatedScore = Math.round(matchRatio)

        setScore(calculatedScore)

        // Generate feedback based on score
        if (calculatedScore >= 90) {
            setFeedback("Excellent pronunciation! You've mastered this phrase.")
        } else if (calculatedScore >= 70) {
            setFeedback("Good job! Try to focus more on the '" + currentExercise.focusSound + "' sound.")
        } else if (calculatedScore >= 50) {
            setFeedback("Keep practicing. Pay special attention to the '" + currentExercise.focusSound + "' sound.")
        } else {
            setFeedback("Let's try again. Listen to the example and focus on each word carefully.")
        }
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Pronunciation Practice</h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Listen to the example, then record yourself saying the same phrase
                    </p>
                </div>

                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>
                                Exercise {currentExerciseIndex + 1}/{exercises.length}
                            </CardTitle>
                            <Badge
                                variant={
                                    currentExercise.difficulty === "easy"
                                        ? "outline"
                                        : currentExercise.difficulty === "medium"
                                            ? "secondary"
                                            : "destructive"
                                }
                            >
                                {currentExercise.difficulty}
                            </Badge>
                        </div>
                        <CardDescription>Focus on the "{currentExercise.focusSound}" sound</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-6 text-center">
                            <p className="text-xl font-medium">{currentExercise.text}</p>
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center mb-6">
                            <Button
                                onClick={handlePlayExample}
                                variant="outline"
                                className="flex items-center gap-2"
                                disabled={isSpeaking}
                            >
                                {isSpeaking ? <Volume2 className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                {isSpeaking ? "Playing..." : "Listen to Example"}
                            </Button>

                            {isListening ? (
                                <Button onClick={handleStopListening} variant="destructive" className="flex items-center gap-2">
                                    <VolumeX className="h-4 w-4" />
                                    Stop Recording
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleStartListening}
                                    variant="default"
                                    className="flex items-center gap-2"
                                    disabled={isRecognizing}
                                >
                                    <Mic className="h-4 w-4" />
                                    {isRecognizing ? "Listening..." : "Start Recording"}
                                </Button>
                            )}

                            <Button onClick={handleNextExercise} variant="ghost" className="flex items-center gap-2">
                                <SkipForward className="h-4 w-4" />
                                Next Exercise
                            </Button>
                        </div>

                        {isListening && (
                            <div className="mb-4">
                                <canvas ref={audioVisualizerRef} className="w-full h-16 bg-gray-100 dark:bg-gray-800 rounded-md" />
                            </div>
                        )}

                        {transcript && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Your recording:</h3>
                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                                    <p>{transcript}</p>
                                </div>
                            </div>
                        )}

                        {score !== null && (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium">Accuracy Score</span>
                                        <span className="text-sm font-medium">{score}%</span>
                                    </div>
                                    <Progress value={score} className="h-2" />
                                </div>

                                <Alert>
                                    <AlertDescription>{feedback}</AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
