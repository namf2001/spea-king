"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { Mic, StopCircle, SkipForward, Clock } from "lucide-react"

interface ReflexControlsProps {
    isListening: boolean
    isRecognizing: boolean
    onStartListening: () => Promise<void>
    onStopListening: () => void
    onNextQuestion: () => void
    timeRemaining: number
    getAudioData?: () => Uint8Array | null
    disabled: boolean
}

export function ReflexControls({
    isListening,
    isRecognizing,
    onStartListening,
    onStopListening,
    onNextQuestion,
    timeRemaining,
    getAudioData,
    disabled
}: ReflexControlsProps) {
    const [countdown, setCountdown] = useState(5)
    const [isCountingDown, setIsCountingDown] = useState(false)

    // Start countdown before recording
    const handlePrepareStartListening = () => {
        setIsCountingDown(true)
        setCountdown(5)
    }

    // Recording countdown timer
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null
        
        if (isCountingDown && countdown > 0) {
            interval = setInterval(() => {
                setCountdown(prev => prev - 1)
            }, 1000)
        } else if (isCountingDown && countdown === 0) {
            setIsCountingDown(false)
            onStartListening()
        }
        
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isCountingDown, countdown, onStartListening])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    return (
        <div className="mb-10">
            <motion.div 
                className="bg-gradient-to-b from-white to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg border border-green-100 dark:border-green-900 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {isListening && getAudioData && (
                    <motion.div 
                        className="w-full mb-6"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">Đang ghi âm...</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="h-4 w-4" />
                                <span className="font-mono">{formatTime(timeRemaining)}</span>
                            </div>
                        </div>
                        <div className="relative">
                            <AudioVisualizer
                                getAudioData={getAudioData}
                                isActive={isListening}
                                height={60}
                                barColor="#22c55e"
                                backgroundColor="rgba(248, 250, 252, 0.8)"
                                className="rounded-lg overflow-hidden"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg pointer-events-none"></div>
                        </div>
                    </motion.div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg">
                    <AnimatePresence mode="wait">
                        {isCountingDown ? (
                            <motion.div
                                key="countdown"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="flex flex-col items-center justify-center gap-2"
                            >
                                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                                    {countdown}
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Chuẩn bị trả lời...
                                </p>
                            </motion.div>
                        ) : isListening ? (
                            <motion.div
                                key="stop-button"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="flex justify-center w-full sm:w-auto"
                            >
                                <Button 
                                    onClick={onStopListening} 
                                    variant="destructive" 
                                    size="lg"
                                    className="flex items-center gap-2 h-14 px-6 relative pulse-animation rounded-xl shadow-md w-full sm:w-auto"
                                >
                                    <StopCircle className="h-5 w-5" />
                                    <span className="font-medium">Dừng</span>
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="start-button"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="flex justify-center w-full sm:w-auto"
                            >
                                <Button
                                    onClick={handlePrepareStartListening}
                                    variant="default"
                                    size="lg"
                                    className="flex items-center gap-2 h-14 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg w-full sm:w-auto"
                                    disabled={isRecognizing || disabled}
                                >
                                    <Mic className="h-5 w-5" />
                                    <span className="font-medium">{isRecognizing ? "Đang nghe..." : "Trả lời"}</span>
                                </Button>
                                {!isRecognizing && !disabled && (
                                    <motion.div 
                                        className="absolute -z-10 inset-0 bg-green-300 dark:bg-green-700 rounded-xl opacity-20"
                                        animate={{ 
                                            scale: [1, 1.05, 1],
                                            opacity: [0.2, 0.3, 0.2] 
                                        }}
                                        transition={{ 
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="flex justify-center w-full sm:w-auto mt-2 sm:mt-0"
                    >
                        <Button 
                            onClick={onNextQuestion} 
                            variant="ghost" 
                            size="lg"
                            className="flex items-center gap-2 h-14 px-6 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl shadow-sm border border-transparent hover:border-green-200 dark:hover:border-green-800 transition-all w-full sm:w-auto"
                        >
                            <SkipForward className="h-5 w-5" />
                            <span>Câu tiếp</span>
                        </Button>
                    </motion.div>
                </div>

                <div className="flex items-center mt-8 gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span>Thời gian còn lại: {formatTime(timeRemaining)}</span>
                </div>
            </motion.div>

            <style jsx global>{`
                .pulse-animation {
                    animation: pulse 1.5s infinite;
                }
                
                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
                    }
                }
            `}</style>
        </div>
    )
}