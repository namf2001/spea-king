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

    const renderControlButton = () => {
        if (isCountingDown) {
            return (
                <motion.div
                    key="countdown"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex flex-col items-center justify-center gap-2"
                >
                    <div className="text-4xl font-bold text-primary">
                        {countdown}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Preparing to answer...
                    </p>
                </motion.div>
            );
        }

        if (isListening) {
            return (
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
                        className="flex items-center gap-2 h-14 px-6 relative pulse-animation rounded-xl shadow-md w-full sm:w-auto bg-destructive hover:bg-destructive/90"
                    >
                        <StopCircle className="h-5 w-5" />
                        <span className="font-medium">Stop</span>
                    </Button>
                </motion.div>
            );
        }

        return (
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
                    disabled={isRecognizing || disabled}
                    className="bg-primary hover:bg-primary/90"
                >
                    <Mic className="h-5 w-5" />
                    <span className="font-medium">{isRecognizing ? "Listening..." : "Answer"}</span>
                </Button>
            </motion.div>
        );
    };

    return (
        <div className="mb-10">
            <motion.div 
                className="bg-gradient-to-t from-primary/20 to-background flex flex-col items-center p-6 rounded-xl"
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
                                <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                                <p className="text-sm font-medium text-primary">Recording...</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="font-mono">{formatTime(timeRemaining)}</span>
                            </div>
                        </div>
                        <div className="relative">
                            <AudioVisualizer
                                getAudioData={getAudioData}
                                isActive={isListening}
                                height={60}
                                barColor="hsl(var(--primary))"
                                backgroundColor="rgba(248, 250, 252, 0.8)"
                                className="rounded-lg overflow-hidden"
                            />
                        </div>
                    </motion.div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg">
                    <AnimatePresence mode="wait">
                        {/* Extract nested ternary operation into independent conditional statements */}
                        {isCountingDown && (
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
                        )}

                        {!isCountingDown && isListening && (
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
                        )}

                        {!isCountingDown && !isListening && (
                            <motion.div
                                key="start-button"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="flex justify-center w-full sm:w-auto"
                            >
                                <Button
                                    onClick={handlePrepareStartListening}
                                    disabled={isRecognizing || disabled}
                                >
                                    <Mic className="h-5 w-5" />
                                    <span className="font-medium">{isRecognizing ? "Đang nghe..." : "Trả lời"}</span>
                                </Button>
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
                        >
                            <SkipForward className="h-5 w-5" />
                            <span>Câu tiếp</span>
                        </Button>
                    </motion.div>
                </div>

                <div className="flex items-center mt-8 gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Time remaining: {formatTime(timeRemaining)}</span>
                </div>
            </motion.div>
        </div>
    )
}