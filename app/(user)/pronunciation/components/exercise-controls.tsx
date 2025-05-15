"use client"

import { Button } from "@/components/ui/button"
import { Mic, SkipForward, VolumeX, Volume2, Headphones, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { useState, useEffect } from "react"

interface ExerciseControlsProps {
    readonly isListening: boolean
    readonly isSpeaking: boolean
    readonly isRecognizing: boolean
    readonly onStartListening: () => Promise<void>
    readonly onStopListening: () => void
    readonly onPlayExample: () => Promise<void>
    readonly onNextExercise: () => void
    readonly getAudioData?: () => Uint8Array | null
}

export function ExerciseControls({
    isListening,
    isSpeaking,
    isRecognizing,
    onStartListening,
    onStopListening,
    onPlayExample,
    onNextExercise,
    getAudioData,
}: ExerciseControlsProps) {
    const [recordingTime, setRecordingTime] = useState(0);
    const [showTip, setShowTip] = useState(false);

    // Recording timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (isListening) {
            setRecordingTime(0);
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isListening]);

    // Show tip randomly
    useEffect(() => {
        const tipTimeout = setTimeout(() => {
            setShowTip(true);
        }, 3000);
        
        return () => clearTimeout(tipTimeout);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="mb-10">
            <motion.div 
                className="bg-gradient-to-b from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg border border-blue-100 dark:border-blue-900 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Floating Tips */}
                <AnimatePresence>
                    {showTip && !isListening && !isRecognizing && (
                        <motion.div 
                            className="absolute -top-12 bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 rounded-lg p-3 shadow-md"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex items-start gap-2">
                                <Sparkles className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                        Tip: Speak clearly and at a normal pace for best results.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowTip(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                >
                                    &times;
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">Recording...</p>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                {formatTime(recordingTime)}
                            </div>
                        </div>
                        <div className="relative">
                            <AudioVisualizer
                                getAudioData={getAudioData}
                                isActive={isListening}
                                height={60}
                                barColor="#3b82f6"
                                backgroundColor="rgba(248, 250, 252, 0.8)"
                                className="rounded-lg overflow-hidden"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg pointer-events-none"></div>
                        </div>
                    </motion.div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-lg">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="listen-button"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex justify-center w-full sm:w-auto"
                        >
                            <Button 
                                onClick={onPlayExample} 
                                variant="outline" 
                                size="lg"
                                className={`flex items-center gap-2 h-14 px-6 relative overflow-hidden transition-all w-full sm:w-auto
                                    rounded-xl shadow-sm border-2
                                    ${isSpeaking 
                                        ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700' 
                                        : 'border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700'}`}
                                disabled={isSpeaking}
                            >
                                <div className="relative z-10 flex items-center gap-2">
                                    {isSpeaking 
                                        ? <Volume2 className="h-5 w-5 animate-pulse" /> 
                                        : <Headphones className="h-5 w-5" />}
                                    <span>{isSpeaking ? "Playing..." : "Listen"}</span>
                                </div>
                                {isSpeaking && (
                                    <motion.div 
                                        className="absolute inset-0 bg-blue-100 dark:bg-blue-800/30" 
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}
                            </Button>
                        </motion.div>
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {isListening ? (
                            <motion.div
                                key="stop-recording"
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
                                    <VolumeX className="h-5 w-5" />
                                    <span className="font-medium">Stop</span>
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="start-recording"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="flex justify-center w-full sm:w-auto"
                            >
                                <Button
                                    onClick={onStartListening}
                                    variant="default"
                                    size="lg"
                                    className="flex items-center gap-2 h-14 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg w-full sm:w-auto"
                                    disabled={isRecognizing}
                                >
                                    <Mic className="h-5 w-5" />
                                    <span className="font-medium">{isRecognizing ? "Listening..." : "Record"}</span>
                                </Button>
                                {!isRecognizing && (
                                    <motion.div 
                                        className="absolute -z-10 inset-0 bg-blue-300 dark:bg-blue-700 rounded-xl opacity-20"
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
                            onClick={onNextExercise} 
                            variant="ghost" 
                            size="lg"
                            className="flex items-center gap-2 h-14 px-6 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl shadow-sm border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all w-full sm:w-auto"
                        >
                            <SkipForward className="h-5 w-5" />
                            <span>Next</span>
                        </Button>
                    </motion.div>
                </div>

                {/* Progress Steps Indicator */}
                <div className="flex items-center mt-8 gap-1 w-full max-w-lg mx-auto justify-between">
                    <div className="flex items-center gap-1 sm:gap-2 text-xs text-blue-600 dark:text-blue-400">
                        <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-medium text-[10px] sm:text-xs">1</div>
                        <span className="hidden sm:inline">Listen</span>
                    </div>
                    <div className="h-[2px] flex-1 bg-blue-100 dark:bg-blue-900"></div>
                    <div className="flex items-center gap-1 sm:gap-2 text-xs text-blue-600 dark:text-blue-400">
                        <div className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full flex items-center justify-center font-medium text-[10px] sm:text-xs ${
                            isListening || isRecognizing ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        }`}>2</div>
                        <span className="hidden sm:inline">Record</span>
                    </div>
                    <div className="h-[2px] flex-1 bg-blue-100 dark:bg-blue-900"></div>
                    <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-400 dark:text-gray-500">
                        <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center font-medium text-[10px] sm:text-xs">3</div>
                        <span className="hidden sm:inline">Review</span>
                    </div>
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
