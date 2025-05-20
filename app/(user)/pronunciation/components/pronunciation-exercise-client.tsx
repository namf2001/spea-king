"use client"

import { useState, useEffect, useRef } from "react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { SpeechFallback } from "@/components/speech-fallback"
import { ExerciseDisplay } from "./exercise-display"
import { ExerciseControls } from "./exercise-controls"
import { TranscriptDisplay } from "./transcript-display"
import { FeedbackDisplay } from "./feedback-display"
import { evaluatePronunciation } from "@/app/actions/speech"
import { ReplayButton } from "@/components/replay-button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Mic } from "lucide-react"
import type { PronunciationLesson, PronunciationWord } from "@prisma/client"

interface PronunciationExerciseClientProps {
    lessons: (PronunciationLesson & {
        words: PronunciationWord[]
    })[];
}

export default function PronunciationExerciseClient({ lessons }: PronunciationExerciseClientProps) {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [score, setScore] = useState<number | null>(null)
    const [feedback, setFeedback] = useState("")
    const [details, setDetails] = useState<any>(null)
    const [useFallback, setUseFallback] = useState(false)
    const [audioVisualizerEnabled, setAudioVisualizerEnabled] = useState(true)
    const evaluationProcessedRef = useRef<boolean>(false)
    const {
        startRecognition,
        stopRecognition,
        recognizedText,
        isRecognizing,
        error: recognitionError,
    } = useSpeechRecognition()
    const { speak, isSpeaking, error: synthesisError } = useSpeechSynthesis()
    const {
        audioUrl,
        startRecording,
        stopRecording,
        playRecording,
        getAudioData,
        error: recordingError,
    } = useAudioRecorder()

    const currentExercise = lessons[currentExerciseIndex]
    const exerciseText = currentExercise?.words.map(word => word.word).join(" ")

    // Display errors as toasts
    useEffect(() => {
        if (recognitionError) {
            toast.error("Speech Recognition Error", {
                description: recognitionError,
            })
            setUseFallback(true)
        }
    }, [recognitionError])

    useEffect(() => {
        if (synthesisError) {
            toast.error("Speech Synthesis Error", {
                description: synthesisError,
            })
            setUseFallback(true)
        }
    }, [synthesisError])

    useEffect(() => {
        if (recordingError) {
            toast.error("Recording Error", {
                description: recordingError,
            })
            setAudioVisualizerEnabled(false)
        }
    }, [recordingError])

    useEffect(() => {
        // Reset the evaluation status when starting a new recognition
        if (!recognizedText) {
            evaluationProcessedRef.current = false;
            return;
        }

        setTranscript(recognizedText);

        // Only evaluate if we haven't already processed this input
        if (!evaluationProcessedRef.current) {
            // Both text and audio are available
            handleEvaluatePronunciation(recognizedText);
            evaluationProcessedRef.current = true;
        }
    }, [recognizedText, isRecognizing]);

    const handleStartListening = async () => {
        setIsListening(true)
        setTranscript("")
        setScore(null)
        setFeedback("")
        setDetails(null)
        evaluationProcessedRef.current = false; // Reset evaluation status when starting new listening
        try {
            // Start speech recognition
            await startRecognition()

            // Try to start audio recording for visualization and replay
            try {
                await startRecording()
            } catch (err) {
                console.error("Failed to start audio recording:", err)
                setAudioVisualizerEnabled(false)
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
            await speak(exerciseText)
        } catch (err) {
            setUseFallback(true)
            toast.error("Error", {
                description: err instanceof Error ? err.message : "Failed to play audio example",
            })
        }
    }

    const handleNextExercise = () => {
        setCurrentExerciseIndex((prev) => (prev + 1) % lessons.length)
        setTranscript("")
        setScore(null)
        setFeedback("")
        setDetails(null)
    }

    const handleFallbackSubmit = (text: string) => {
        setTranscript(text)
        handleEvaluatePronunciation(text)
    }

    const handleEvaluatePronunciation = async (text: string) => {
        try {
            const result = await evaluatePronunciation(text, exerciseText);
            handleEvaluationResult(result);
        } catch (err) {
            console.error("Error during pronunciation evaluation:", err);
            toast.error("Evaluation Error", {
                description: err instanceof Error ? err.message : "An unexpected error occurred",
            });
        }
    };

    // Handle evaluation result
    interface EvaluationResult {
        success: boolean;
        score?: number;
        feedback?: string;
        details?: any;
        error?: string;
    }

    const handleEvaluationResult = (result: EvaluationResult) => {
        console.log("Pronunciation Evaluation Result:", {
            success: result.success,
            score: result.score,
            feedback: result.feedback,
            hasDetails: !!result.details
        });

        if (result.success && result.score !== undefined && result.feedback) {
            setScore(result.score);
            setFeedback(result.feedback);

            if (result.details) {
                setDetails(result.details);
            }

            toast.success("Pronunciation evaluated", {
                description: `Your score: ${result.score}%`
            });
        } else {
            toast.error("Evaluation Error", {
                description: result.error ?? "Failed to evaluate pronunciation",
            });
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

    if (!currentExercise || lessons.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Card className="p-6 max-w-md">
                    <h3 className="font-medium text-lg mb-2">No exercises available</h3>
                    <p className="text-muted-foreground mb-4">
                        There are no pronunciation exercises in this lesson or the lesson could not be found.
                    </p>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <motion.div
                className="max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="flex items-center gap-3 mb-8"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="bg-primary p-2 rounded-full relative overflow-hidden">
                        <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-white relative z-10" />
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Pronunciation Practice</h1>
                </motion.div>
                <AnimatePresence mode="wait">
                    <ExerciseDisplay
                        exercise={currentExercise}
                        currentIndex={currentExerciseIndex}
                        totalExercises={lessons.length}
                    />
                </AnimatePresence>
                {useFallback ? (
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="p-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                            <h3 className="font-medium text-amber-700 dark:text-amber-300 mb-2">
                                Speech Recognition Unavailable
                            </h3>
                            <p className="text-amber-600 dark:text-amber-400 mb-4 text-sm">
                                Your browser doesn't support speech recognition or microphone access was denied.
                                Please enter your text manually.
                            </p>
                            <SpeechFallback onTextSubmit={handleFallbackSubmit} type="recognition" />
                        </Card>
                    </motion.div>
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
                <AnimatePresence>
                    {transcript && (
                        <motion.div
                            className="space-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <TranscriptDisplay transcript={transcript} />

                            {audioUrl && (
                                <motion.div
                                    className="flex justify-center mb-6"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                >
                                    <div className="bg-gray-50 dark:bg-gray-800 py-3 px-6 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                                        <ReplayButton
                                            onReplay={handleReplayRecording}
                                            disabled={isSpeaking}
                                            label="Listen to your recording"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {score !== null && <FeedbackDisplay score={score} feedback={feedback} details={details} />}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}