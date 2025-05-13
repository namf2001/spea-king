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
import { ReplayButton } from "@/components/replay-button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Award, Mic } from "lucide-react"

export default function PronunciationPage() {
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [score, setScore] = useState<number | null>(null)
    const [feedback, setFeedback] = useState("")
    const [details, setDetails] = useState<any>(null)
    const [useFallback, setUseFallback] = useState(false)
    const [audioVisualizerEnabled, setAudioVisualizerEnabled] = useState(true)
    const {
        startRecognition,
        stopRecognition,
        recognizedText,
        isRecognizing,
        error: recognitionError,
        audioData
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

    const currentExercise = exercises[currentExerciseIndex]

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
        setDetails(null)
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
        setDetails(null)
    }

    const handleFallbackSubmit = (text: string) => {
        setTranscript(text)
        handleEvaluatePronunciation(text)
    }

    const handleEvaluatePronunciation = async (text: string) => {
        // Hiển thị trạng thái đang đánh giá
        toast.info("Evaluating pronunciation...");
        
        // Chuẩn bị dữ liệu để gửi đến server
        try {
            // Kiểm tra xem có dữ liệu âm thanh không
            if (!audioData) {
                console.warn("No audio data available for pronunciation assessment");
                // Nếu không có dữ liệu âm thanh, sử dụng server action hiện tại
                const result = await evaluatePronunciation(text, currentExercise.text, currentExercise.focusSound);
                handleEvaluationResult(result);
                return;
            }
            
            console.log("Audio data available for pronunciation assessment:", {
                type: audioData.type,
                size: audioData.size,
                hasAudio: !!audioData
            });
            
            // Chuyển đổi Blob thành FormData và gửi đến API route
            const formData = new FormData();
            formData.append('audio', audioData, 'recording.wav');
            formData.append('text', text);
            formData.append('targetText', currentExercise.text);
            formData.append('focusSound', currentExercise.focusSound);
            
            // Gọi API route để đánh giá phát âm
            const response = await fetch('/api/evaluate-pronunciation', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error ?? `Server error: ${response.status}`);
            }
            
            const result = await response.json();
            handleEvaluationResult(result);
        } catch (err) {
            console.error("Error during pronunciation evaluation:", err);
            
            // Nếu API gặp lỗi, thử sử dụng server action hiện tại
            try {
                toast.warning("Using fallback pronunciation assessment method");
                const result = await evaluatePronunciation(text, currentExercise.text, currentExercise.focusSound);
                handleEvaluationResult(result);
            } catch (fallbackErr) {
                console.error("Fallback evaluation also failed:", fallbackErr);
                toast.error("Evaluation Error", {
                    description: err instanceof Error ? err.message : "An unexpected error occurred",
                });
            }
        }
    };

    // Xử lý kết quả đánh giá
    interface EvaluationResult {
        success: boolean;
        score?: number;
        feedback?: string;
        details?: any;
        error?: string;
    }

    const handleEvaluationResult = (result: EvaluationResult) => {
        // Log kết quả đánh giá phát âm
        console.log("Pronunciation Evaluation Result:", {
            success: result.success,
            score: result.score,
            feedback: result.feedback,
            hasDetails: !!result.details
        });
        
        if (result.success && result.score !== undefined && result.feedback) {
            setScore(result.score);
            setFeedback(result.feedback);
            
            // Đặt dữ liệu đánh giá chi tiết nếu có
            if (result.details) {
                setDetails(result.details);
            }
            
            // Thông báo hoàn tất đánh giá
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

    return (
        <motion.div 
            className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <motion.div 
                        className="mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Link 
                            href="/" 
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 
                            hover:underline mb-4 inline-flex items-center gap-1 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span>Back to Home</span>
                        </Link>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                                <Mic className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pronunciation Practice</h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 ml-12">
                            Listen to the example, then record yourself saying the same phrase.
                            Receive instant feedback on your pronunciation.
                        </p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        <ExerciseDisplay
                            exercise={currentExercise}
                            currentIndex={currentExerciseIndex}
                            totalExercises={exercises.length}
                            onPlayExample={handlePlayExample}
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
                    
                    <motion.div 
                        className="mt-12 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                    >
                        <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 
                        text-sm bg-gray-50 dark:bg-gray-800 py-2 px-4 rounded-full">
                            <Award className="h-4 w-4 text-blue-500" />
                            <span>Practice regularly to improve your pronunciation skills</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}
