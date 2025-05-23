"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Volume2 } from "lucide-react"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { toast } from "sonner"

// Define a common question interface that works with both types
interface CommonQuestion {
    id: string | number
    question: string
    answer: string
}

interface QuestionDisplayProps {
    readonly question: CommonQuestion
    readonly currentIndex: number
    readonly totalQuestions: number
    readonly timeRemaining?: number  // Make timeRemaining optional to support manual input mode
    readonly isAnswering: boolean
}

export function QuestionDisplay({
    question,
    currentIndex,
    totalQuestions,
    timeRemaining = 45, // Default value if not provided
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

    // Calculate progress percentage
    const calculateProgressPercentage = () => {
        if (timeRemaining) {
            return (timeRemaining / 45) * 100
        }
        return 0
    }

    // Store the calculation result
    const progressPercentage = calculateProgressPercentage()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            key={question.id}
            className="mb-8"
        >
            <Card className="border-2 shadow-md overflow-hidden pt-0 gap-0">
                {/* Thanh thời gian */}
                {timeRemaining !== undefined && (
                    <div className="relative h-2 bg-gray-100 dark:bg-gray-800">
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-primary"
                            initial={{ width: "100%" }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                )}

                <CardHeader className="py-4 bg-gradient-to-b from-primary/20 to-background">
                    <CardTitle className="flex justify-between items-center">
                        <h3 className="font-medium">
                            Câu hỏi {currentIndex + 1}/{totalQuestions}
                        </h3>
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                    <div className="flex flex-col gap-6">
                        <div
                            className="bg-primary/10 p-6 rounded-lg text-center relative
                            border border-primary/20 shadow-inner"
                        >
                            <p className="text-2xl font-medium tracking-wide">{question.question}</p>
                            <button
                                onClick={handlePlayQuestion}
                                disabled={isSpeaking}
                                className="absolute top-3 right-3 p-2 text-primary hover:text-primary/80
rounded-full hover:bg-primary/10 transition-colors"
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
                                className="bg-primary/10 p-6 rounded-lg text-center relative
                            border border-primary/20 shadow-inner"
                            >
                                <div className="flex items-start gap-2 mb-2">
                                    <Badge variant="secondary">
                                        Câu trả lời mẫu
                                    </Badge>
                                </div>
                                <p>
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