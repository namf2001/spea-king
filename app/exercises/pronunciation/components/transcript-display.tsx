import { motion } from "framer-motion"
import { Mic } from "lucide-react"

interface TranscriptDisplayProps {
    readonly transcript: string
}

export function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
    const words = transcript.split(' ').filter(word => word.trim() !== '')

    return (
        <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <h3 className="text-sm font-medium flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                <Mic className="h-4 w-4" />
                Your recording:
            </h3>
            <motion.div 
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm relative"
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-lg" />
                <div className="flex flex-wrap gap-2 py-1">
                    {words.map((word, index) => (
                        <motion.span
                            key={`${word}-${index}`}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03, duration: 0.3 }}
                            className="text-lg"
                        >
                            {word}
                        </motion.span>
                    ))}
                </div>
                {words.length === 0 && (
                    <p className="text-gray-400 dark:text-gray-500 italic">Your spoken text will appear here...</p>
                )}
            </motion.div>
        </motion.div>
    )
}
