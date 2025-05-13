"use client"

import { useState, useEffect } from "react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import Link from "next/link"
import { SpeechFallback } from "@/components/speech-fallback"
import { exercises } from "./data/exercises"
import { ExerciseDisplay } from "./components/exercise-display"
import { ExerciseControls } from "./components/exercise-controls"
import { TranscriptDisplay } from "./components/transcript-display"
import { FeedbackDisplay } from "./components/feedback-display"
import { evaluatePronunciation } from "@/app/actions/speech"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { ReplayButton } from "@/components/replay-button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export default function PronunciationPage() {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [score, setScore] = useState<number | null>(null)
    const [feedback, setFeedback] = useState("")
    const [useFallback, setUseFallback] = useState(false)
    const [audioVisualizerEnabled, setAudioVisualizerEnabled] = useState(true)
    const {
        startRecognition,
        stopRecognition,
        recognizedText,
        isRecognizing,
        error: recognitionError,
    } = useSpeechRecognition()
    const { speak, isSpeaking, error: synthesisError } = useSpeechSynthesis()
    const {
        isRecording,
        audioUrl,
        startRecording,
        stopRecording,
        playRecording,
        getAudioData,
        error: recordingError,
    } = useAudioRecorder()

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
        if (recordingError) {
            toast.error("Recording Error", {
                description: recordingError,
            })
            setAudioVisualizerEnabled(false)
        }
    }, [recordingError, toast])

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
            // Start speech recognition
            await startRecognition()

            // Try to start audio recording for visualization and replay
            try {
                await startRecording()
            } catch (err) {
                console.error("Failed to start audio recording:", err)
                setAudioVisualizerEnabled(false)
                // Don't show error toast here, just disable the visualizer
                // We can still continue with speech recognition
            }
        } catch (err) {
            setIsListening(false)
            setUseFallback(true)
            toast.error("Error", {
                description: err instanceof Error ? err.message : "Failed to start speech recognition",
            })
        }
    }

    const handleStopListening = () => {
        setIsListening(false)
        stopRecognition()

        // Try to stop recording, but don't fail if it errors
        try {
            stopRecording()
        } catch (err) {
            console.error("Error stopping recording:", err)
        }
    }

    const handlePlayExample = async () => {
        try {
            await speak(currentExercise.text)
        } catch (err) {
            setUseFallback(true)
            toast.error("Error", {
                description: err instanceof Error ? err.message : "Failed to play audio example",
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
        if (result.success && result.score !== undefined && result.feedback) {
            setScore(result.score)
            setFeedback(result.feedback)
        } else {
            toast.error("Evaluation Error", {
                description: result.error || "Failed to evaluate pronunciation",
            })
        }
    }

    const handleReplayRecording = () => {
        if (audioUrl) {
            try {
                playRecording()
            } catch (err) {
                console.error("Error playing recording:", err)
                toast.error("Replay Error", {
                    description: "Failed to play recording",
                })
            }
        } else {
                toast.error("Replay Error", {
                description: "No recording available to replay",
            })
        }
    }

    // Safe wrapper for getAudioData to prevent errors from propagating
    const safeGetAudioData = () => {
        if (!audioVisualizerEnabled) return null

        try {
            return getAudioData()
        } catch (err) {
            console.error("Error getting audio data:", err)
            setAudioVisualizerEnabled(false)
            return null
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
                        getAudioData={audioVisualizerEnabled ? safeGetAudioData : undefined}
                    />
                )}

                {isListening && !useFallback && audioVisualizerEnabled && (
                    <Card className="p-4 mb-6">
                        <p className="text-sm text-gray-500 mb-2">Voice Level</p>
                        <AudioVisualizer
                            getAudioData={safeGetAudioData}
                            isActive={isListening}
                            height={80}
                            barColor="#3b82f6"
                            backgroundColor="#f8fafc"
                        />
                    </Card>
                )}

                {transcript && (
                    <div className="space-y-4">
                        <TranscriptDisplay transcript={transcript} />

                        {audioUrl && (
                            <div className="flex justify-center mb-4">
                                <ReplayButton onReplay={handleReplayRecording} disabled={isSpeaking} />
                            </div>
                        )}
                    </div>
                )}

                {score !== null && <FeedbackDisplay score={score} feedback={feedback} />}
            </div>
        </div>
    )
}
