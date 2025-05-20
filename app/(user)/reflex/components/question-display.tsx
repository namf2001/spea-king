"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Volume2 } from "lucide-react"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { Question } from "../data/questions"
import { toast } from "sonner"

interface QuestionDisplayProps {
    readonly question: Question
    readonly currentIndex: number
    readonly totalQuestions: number
    readonly timeRemaining: number
    readonly isAnswering: boolean
}

export function QuestionDisplay({
    question,
    currentIndex,
    totalQuestions,
    timeRemaining,
    isAnswering
}: QuestionDisplayProps) {
    const { speak, isSpeaking, error } = useSpeechSynthesis()
    const [showAnswer, setShowAnswer] = useState(false)

    useEffect(() => {
        setShowAnswer(false)
    }, [question.id])

    useEffect(() => {
        if (error) {
            toast.error("Speech Synthesis Error", {
                description: error,
            })
        }
    }, [error])

    const handlePlayQuestion = async () => {
        try {
            await speak(question.question)
        } catch (err) {
            toast.error("Error", {
                description: err instanceof Error ? err.message : "Không thể phát câu hỏi",
            })
        }
    }

    const getBadgeVariant = (difficulty: Question["difficulty"]) => {
        if (difficulty === "easy") return "outline"
        if (difficulty === "medium") return "secondary"
        return "destructive"
    }

    const progressPercentage = (timeRemaining / 45) * 100

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            key={question.id}
            className="mb-8"
        >
            <Card className="border-2 border-green-100 dark:border-green-900 shadow-md overflow-hidden pt-0">
                {/* Thanh thời gian */}
                <div className="relative h-2 bg-gray-100 dark:bg-gray-800">
                    <motion.div 
                        className="absolute top-0 left-0 h-full bg-green-500"
                        initial={{ width: "100%" }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-900 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-green-800 dark:text-green-300 font-medium">
                            Câu hỏi {currentIndex + 1}/{totalQuestions}
                        </h3>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                                {question.category}
                            </Badge>
                            <Badge variant={getBadgeVariant(question.difficulty)} className="text-sm font-medium">
                                {question.difficulty === "easy" ? "Dễ" : 
                                 question.difficulty === "medium" ? "Trung bình" : "Khó"}
                            </Badge>
                        </div>
                    </div>
                </div>
                
                <CardContent className="p-6">
                    <div className="flex flex-col gap-6">
                        <div 
                            className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg text-center relative
                            border border-green-100 dark:border-green-800 shadow-inner"
                        >
                            <p className="text-2xl font-medium tracking-wide">{question.question}</p>
                            <button 
                                onClick={handlePlayQuestion}
                                disabled={isSpeaking}
                                className="absolute top-3 right-3 p-2 text-green-600 hover:text-green-800 
                                dark:text-green-400 dark:hover:text-green-200 rounded-full 
                                hover:bg-green-100 dark:hover:bg-green-800/50 transition-colors"
                                aria-label="Phát câu hỏi"
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {(showAnswer || !isAnswering) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                transition={{ duration: 0.3 }}
                                className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                        Câu trả lời mẫu
                                    </Badge>
                                </div>
                                <p className="text-blue-800 dark:text-blue-200">
                                    {question.answer}
                                </p>
                            </motion.div>
                        )}
                        
                        {isAnswering && !showAnswer && (
                            <button
                                onClick={() => setShowAnswer(true)}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline self-end"
                            >
                                Xem câu trả lời mẫu
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}