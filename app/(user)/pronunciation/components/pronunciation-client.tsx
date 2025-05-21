"use client"

import { useState, useEffect, useRef } from "react"
import { usePronunciationAssessment } from "@/hooks/use-pronunciation-assessment"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { SpeechFallback } from "@/components/speech-fallback"
import { ExerciseDisplay } from "./exercise-display"
import { ExerciseControls } from "./exercise-controls"
import { TranscriptDisplay } from "./transcript-display"
import { FeedbackDisplay } from "./feedback-display"
import { ReplayButton } from "@/components/replay-button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Mic } from "lucide-react"
import type { PronunciationLesson, PronunciationWord } from "@prisma/client"

interface PronunciationClientProps {
    lessons: (PronunciationLesson & {
        words: PronunciationWord[]
    })[];
    userId: string;
    error?: string;
}

export default function PronunciationClient({ lessons, userId, error }: PronunciationClientProps) {
    // State
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
    const [isAssessing, setIsAssessing] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [results, setResults] = useState<any>(null)
    const [useFallback, setUseFallback] = useState(false)
    const [audioVisualizerEnabled, setAudioVisualizerEnabled] = useState(true)
    
    // Refs
    const assessmentProcessedRef = useRef<boolean>(false)
    
    // Hooks
    const {
        startRecognition,
        stopRecognition,
        results: pronunciationResults,
        error: assessmentError,
        resetResults,
        isProcessingResult,
    } = usePronunciationAssessment()
    
    const { speak, isSpeaking, error: synthesisError } = useSpeechSynthesis()
    const {
        audioUrl,
        startRecording,
        stopRecording,
        playRecording,
        getAudioData,
        error: recordingError,
    } = useAudioRecorder()

    // Current exercise and its text
    const currentExercise = lessons[currentExerciseIndex]
    const exerciseText = currentExercise?.words.map(word => word.word).join(" ")
    
    // Display errors as toasts
    useEffect(() => {
        if (assessmentError) {
            toast.error("Speech Recognition Error", {
                description: assessmentError.message || "An error occurred with speech recognition",
            })
            setUseFallback(true)
        }
    }, [assessmentError])

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

    // Process pronunciation assessment results when they arrive
    useEffect(() => {
        if (pronunciationResults && !assessmentProcessedRef.current) {
            setResults(pronunciationResults)
            setTranscript(pronunciationResults.words.map((w: any) => w.word).join(" "))
            assessmentProcessedRef.current = true
            
            // Show toast with score
            toast.success("Assessment completed", {
                description: `Your overall score: ${pronunciationResults.pronunciationScore}%`
            })
            
            console.log("Pronunciation assessment completed:", pronunciationResults)
        }
    }, [pronunciationResults])

    const handleStartAssessment = async () => {
        setIsAssessing(true)
        setTranscript("")
        setResults(null)
        resetResults()
        assessmentProcessedRef.current = false
        
        try {
            // Start pronunciation assessment
            await startRecognition(exerciseText)
            
            // Try to start audio recording for visualization and replay
            try {
                await startRecording()
            } catch (err) {
                console.error("Failed to start audio recording:", err)
                setAudioVisualizerEnabled(false)
            }
        } catch (err) {
            setIsAssessing(false)
            setUseFallback(true)
            toast.error("Error", {
                description: err instanceof Error ? err.message : "Failed to start speech recognition",
            })
        }
    }
    
    const handleStopAssessment = () => {
        setIsAssessing(false)
        stopRecognition()
        
        // Stop recording
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
        setResults(null)
        resetResults()
        assessmentProcessedRef.current = false
    }
    
    const handleFallbackSubmit = (text: string) => {
        setTranscript(text)
        // In a real implementation, you would process this with an API
        toast.info("Fallback mode", {
            description: "Text submitted for evaluation. This is a fallback mode with limited features."
        })
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
    
    // Safe wrapper for getAudioData to prevent errors
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
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-2 rounded-full relative overflow-hidden">
                            <motion.div
                                className="absolute inset-0 bg-primary-foreground/20"
                                animate={{ 
                                    scale: [1, 1.5, 1],
                                    opacity: [0, 0.3, 0]
                                }}
                                transition={{ 
                                    repeat: Infinity, 
                                    duration: 2,
                                    ease: "easeInOut" 
                                }}
                            />
                            <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-white relative z-10" />
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2">
                            Pronunciation Practice
                            <span className="text-sm font-normal bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                Advanced Mode
                            </span>
                        </h1>
                    </div>
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
                        isAssessing={isAssessing}
                        isSpeaking={isSpeaking}
                        isProcessing={isProcessingResult}
                        onStartAssessment={handleStartAssessment}
                        onStopAssessment={handleStopAssessment}
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
                    {results && <FeedbackDisplay results={results} />}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}