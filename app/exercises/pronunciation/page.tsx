"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import Link from "next/link"
import { SpeechFallback } from "@/components/speech-fallback"
import { exercises } from "./data/exercises"
import { ExerciseDisplay } from "./components/exercise-display"
import { ExerciseControls } from "./components/exercise-controls"
import { TranscriptDisplay } from "./components/transcript-display"
import { evaluatePronunciation } from "@/app/actions/speech"
import { FeedbackDisplay } from "./components/feedback-display"

export default function PronunciationPage() {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [score, setScore] = useState<number | null>(null)
    const [feedback, setFeedback] = useState("")
    const [useFallback, setUseFallback] = useState(false)
    const {
        startRecognition,
        stopRecognition,
        recognizedText,
        isRecognizing,
        error: recognitionError,
    } = useSpeechRecognition()
    const { speak, isSpeaking, error: synthesisError } = useSpeechSynthesis()
    const audioVisualizerRef = useRef<HTMLCanvasElement>(null)

    const currentExercise = exercises[currentExerciseIndex]

    // Display errors as toasts
    useEffect(() => {
        if (recognitionError) {
            toast.error("Speech Recognition Error", {
                description: recognitionError,
            })
            setUseFallback(true)
        }
    }, [recognitionError, toast])

    useEffect(() => {
        if (synthesisError) {
            toast.error("Speech Synthesis Error", {
                description: synthesisError,
            })
            setUseFallback(true)
        }
    }, [synthesisError, toast])

    useEffect(() => {
        if (recognizedText) {
            setTranscript(recognizedText)
            handleEvaluatePronunciation(recognizedText)
        }
    }, [recognizedText])

    const handleStartListening = async () => {
        setIsListening(true)
        setTranscript("")
        setScore(null)
        setFeedback("")
        try {
            await startRecognition()
        } catch (error) {
            setIsListening(false)
            setUseFallback(true)
            toast.error("Error", {
                description: error instanceof Error ? error.message : "Failed to start speech recognition",
            })
        }
    }

    const handleStopListening = () => {
        setIsListening(false)
        stopRecognition()
    }

    const handlePlayExample = async () => {
        try {
            await speak(currentExercise.text)
        } catch (error) {
            setUseFallback(true)
            toast.error("Error", {
                description: error instanceof Error ? error.message : "Failed to play audio example",
            })
        }
    }

    const handleNextExercise = () => {
        setCurrentExerciseIndex((prev) => (prev + 1) % exercises.length)
        setTranscript("")
        setScore(null)
        setFeedback("")
    }

    const handleFallbackSubmit = (text: string) => {
        setTranscript(text)
        handleEvaluatePronunciation(text)
    }

    const handleEvaluatePronunciation = async (text: string) => {
        // Use the Server Action to evaluate pronunciation
        const result = await evaluatePronunciation(text, currentExercise.text, currentExercise.focusSound)

        if (result.success) {
            setScore(result.score ?? 0)
            setFeedback(result.feedback ?? "")
        } else {
            toast.error("Evaluation Error", {
                description: result.error ?? "Failed to evaluate pronunciation",
            })
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

                <ExerciseDisplay
                    exercise={currentExercise}
                    currentIndex={currentExerciseIndex}
                    totalExercises={exercises.length}
                />

                {useFallback ? (
                    <div className="mb-6">
                        <SpeechFallback onTextSubmit={handleFallbackSubmit} type="recognition" />
                    </div>
                ) : (
                    <ExerciseControls
                        isListening={isListening}
                        isSpeaking={isSpeaking}
                        isRecognizing={isRecognizing}
                        onStartListening={handleStartListening}
                        onStopListening={handleStopListening}
                        onPlayExample={handlePlayExample}
                        onNextExercise={handleNextExercise}
                    />
                )}

                {isListening && !useFallback && (
                    <div className="mb-4">
                        <canvas ref={audioVisualizerRef} className="w-full h-16 bg-gray-100 dark:bg-gray-800 rounded-md" />
                    </div>
                )}

                {transcript && <TranscriptDisplay transcript={transcript} />}

                {score !== null && <FeedbackDisplay score={score} feedback={feedback} />}
            </div>
        </div>
    )
}
