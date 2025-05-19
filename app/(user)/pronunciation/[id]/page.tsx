"use client"

import { useState, useEffect } from "react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { SpeechFallback } from "@/components/speech-fallback"
import { exercises } from "../data/exercises"
import { ExerciseDisplay } from "../components/exercise-display"
import { ExerciseControls } from "../components/exercise-controls"
import { TranscriptDisplay } from "../components/transcript-display"
import { FeedbackDisplay } from "../components/feedback-display"
import { evaluatePronunciation } from "@/app/actions/speech"
import { ReplayButton } from "@/components/replay-button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Mic } from "lucide-react"
import { RippleEffect } from "@/components/animations/ripple-effect"

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
            // Only evaluate pronunciation if we have both text and audio data
            if (audioData) {
                handleEvaluatePronunciation(recognizedText, audioData)
            } else {
                // If no audio data, use text-only evaluation
                handleEvaluatePronunciation(recognizedText)
            }
        }
    }, [recognizedText, audioData])

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

    const handleEvaluatePronunciation = async (text: string, audioData?: Blob) => {
        // Hiển thị trạng thái đang đánh giá
        toast.info("Evaluating pronunciation...");

        try {
            let result;
            
            if (audioData) {
                // Create FormData for audio-based evaluation
                const formData = new FormData();
                formData.append('audio', audioData, 'recording.wav');
                formData.append('text', text);
                formData.append('targetText', currentExercise.text);

                // Call API route for audio-based evaluation
                const response = await fetch('/api/evaluate-pronunciation', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error ?? `Server error: ${response.status}`);
                }

                result = await response.json();
            } else {
                // Fallback to text-only evaluation
                result = await evaluatePronunciation(text, currentExercise.text);
            }

            handleEvaluationResult(result);
        } catch (err) {
            console.error("Error during pronunciation evaluation:", err);
            toast.error("Evaluation Error", {
                description: err instanceof Error ? err.message : "An unexpected error occurred",
            });
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
                        <div className="absolute inset-0">
                            <RippleEffect color="white" />
                        </div>
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Pronunciation Practice</h1>
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
            </motion.div >
        </div>
    )
}