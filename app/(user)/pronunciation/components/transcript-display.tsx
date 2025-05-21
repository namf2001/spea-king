"use client"

import { motion } from "framer-motion"
import { Mic } from "lucide-react"

interface TranscriptDisplayProps {
    transcript: string
}

export function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
    const words = transcript.split(' ').filter(word => word.trim() !== '')

    return (
        <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h3 className="text-sm font-medium flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300">
                <Mic className="h-4 w-4" />
                Your recording:
            </h3>
            <motion.div 
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm relative"
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-wrap gap-2 py-1">
                    {words.map((word, index) => (
                        <motion.span
                            key={index}
                            className="text-lg font-medium"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                                delay: index * 0.05,
                                ease: "easeOut"
                            }}
                        >
                            {word}
                        </motion.span>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    )
}