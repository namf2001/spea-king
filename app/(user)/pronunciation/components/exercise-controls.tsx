"use client"

import { Button } from "@/components/ui/button"
import { Mic, SkipForward, VolumeX, Volume2, Headphones } from "lucide-react"
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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
                                barColor="#ed9392"
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
                                variant="secondary"
                                disabled={isSpeaking}
                                className="w-full"
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
                                    variant="secondary"
                                    className="w-full"
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
                                    disabled={isRecognizing}
                                    className="w-full"
                                >
                                    <Mic className="h-5 w-5" />
                                    <span className="font-medium">{isRecognizing ? "Listening..." : "Record"}</span>
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="flex justify-center w-full sm:w-auto sm:mt-0"
                    >
                        <Button
                            onClick={onNextExercise}
                            variant="secondary"
                            className="w-full"
                        >
                            <SkipForward className="h-5 w-5" />
                            <span>Next</span>
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}
