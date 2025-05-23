"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles } from "lucide-react"
import { generateAnswerSuggestion } from "@/app/actions/reflex"
import { toast } from "sonner"

interface AnswerFeedbackProps {
    readonly transcript: string
    readonly targetAnswerText: string
    readonly isActive: boolean
    readonly onManualAnswerSubmit?: (answer: string) => void
    readonly allowManualInput?: boolean
}

interface WordMatch {
    word: string
    status: 'correct' | 'incorrect' | 'partial'
    originalIndex: number
}

export function AnswerFeedback({
    transcript,
    targetAnswerText,
    isActive,
    onManualAnswerSubmit,
    allowManualInput = false
}: AnswerFeedbackProps) {
    const [analyzedWords, setAnalyzedWords] = useState<WordMatch[]>([])
    const [accuracy, setAccuracy] = useState(0)
    const [manualAnswer, setManualAnswer] = useState("")
    const [suggestedAnswer, setSuggestedAnswer] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)

    // Get the appropriate badge variant based on accuracy
    const getAccuracyBadgeVariant = (score: number) => {
        if (score >= 80) return "default";
        if (score >= 50) return "secondary";
        return "destructive";
    };

    // Phân tích và so sánh câu trả lời với câu hỏi
    useEffect(() => {
        if (!transcript || !targetAnswerText) {
            setAnalyzedWords([])
            setAccuracy(0)
            return
        }
        
        // Chuyển đổi thành chữ thường và loại bỏ dấu câu
        const normalizedTranscript = transcript.toLowerCase().replace(/[.,?!]/g, "")
        const normalizedTarget = targetAnswerText.toLowerCase().replace(/[.,?!]/g, "")
        
        // Tách thành các từ riêng lẻ
        const transcriptWords = normalizedTranscript.split(" ").filter(word => word.trim() !== "")
        const targetWords = normalizedTarget.split(" ").filter(word => word.trim() !== "")
        
        // Tạo mảng phân tích từ
        const wordMatches: WordMatch[] = transcriptWords.map((word, index) => {
            // Kiểm tra từ có trùng chính xác với từ nào trong câu hỏi không
            if (targetWords.includes(word)) {
                return { word, status: 'correct', originalIndex: index }
            }
            
            // Kiểm tra từng phần (ví dụ: từng phần của từ có xuất hiện trong câu hỏi)
            const partialMatch = targetWords.some(targetWord => 
                targetWord.includes(word) || word.includes(targetWord) || 
                // Sử dụng khoảng cách Levenshtein để kiểm tra từ tương tự
                calculateLevenshteinDistance(word, targetWord) <= Math.min(2, Math.floor(targetWord.length / 3))
            )
            
            if (partialMatch) {
                return { word, status: 'partial', originalIndex: index }
            }
            
            // Không có trùng khớp
            return { word, status: 'incorrect', originalIndex: index }
        })
        
        // Tính toán độ chính xác
        const correctWords = wordMatches.filter(match => match.status === 'correct').length
        const partialWords = wordMatches.filter(match => match.status === 'partial').length
        const totalWords = Math.max(wordMatches.length, 1)
        
        const calculatedAccuracy = Math.round(
            ((correctWords + (partialWords * 0.5)) / totalWords) * 100
        )
        
        setAnalyzedWords(wordMatches)
        setAccuracy(calculatedAccuracy)
    }, [transcript, targetAnswerText])

    // Hàm tạo gợi ý câu trả lời từ AI
    const handleGetSuggestion = async () => {
        if (isGenerating) return
        
        setIsGenerating(true)
        try {
            const result = await generateAnswerSuggestion(targetAnswerText.split('[')[0].trim())
            
            if (result.success && result.data.suggestion) {
                setSuggestedAnswer(result.data.suggestion)
            } else {
                toast.error("Không thể tạo gợi ý")
            }
        } catch (error) {
            console.error("Lỗi khi tạo gợi ý:", error)
            toast.error("Không thể tạo gợi ý câu trả lời")
        } finally {
            setIsGenerating(false)
        }
    }
    
    // Hàm gửi câu trả lời thủ công
    const handleSubmitManualAnswer = () => {
        if (!manualAnswer.trim()) {
            toast.error("Vui lòng nhập câu trả lời của bạn")
            return
        }
        
        if (onManualAnswerSubmit) {
            onManualAnswerSubmit(manualAnswer)
            setManualAnswer("") // Xóa sau khi gửi
        }
    }
    
    // Sử dụng câu trả lời được gợi ý
    const handleUseSuggestion = () => {
        if (!suggestedAnswer) {
            toast.error("Không có gợi ý nào")
            return
        }
        
        if (onManualAnswerSubmit) {
            onManualAnswerSubmit(suggestedAnswer)
        }
    }

    // Hàm tính khoảng cách Levenshtein (độ tương tự giữa các chuỗi)
    const calculateLevenshteinDistance = (a: string, b: string): number => {
        const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null))
        
        for (let i = 0; i <= a.length; i++) {
            matrix[i][0] = i
        }
        
        for (let j = 0; j <= b.length; j++) {
            matrix[0][j] = j
        }
        
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                )
            }
        }
        
        return matrix[a.length][b.length]
    }

    // Nếu không có dữ liệu hoặc chỉ cho phép nhập thủ công, xử lý phù hợp
    if ((!transcript || analyzedWords.length === 0) && !allowManualInput) {
        return null
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-10"
        >
            <Card className="border-2">
                <CardHeader className="bg-gradient-to-b from-primary/5 to-background">
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Answer Feedback
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 pb-2">
                    <div className="space-y-4">
                        <motion.div
                            variants={itemVariants}
                            className="p-4 rounded-lg border bg-gradient-to-t from-primary/5 to-background"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium text-primary">Your Answer</h3>
                                <Badge 
                                    variant={getAccuracyBadgeVariant(accuracy)}
                                    className="text-xs"
                                >
                                    Accuracy: {accuracy}%
                                </Badge>
                            </div>
                            <div className="space-x-1 leading-relaxed">
                                {analyzedWords.map((wordMatch, index) => (
                                    <span 
                                        key={`${wordMatch.word}-${index}`}
                                        className={`
                                            inline-block px-1 rounded
                                            ${wordMatch.status === 'correct' ? 'bg-primary/10 text-primary' : 
                                            wordMatch.status === 'partial' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 
                                            'bg-destructive/10 text-destructive'}
                                        `}
                                    >
                                        {wordMatch.word}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="p-4 rounded-lg border bg-gradient-to-t from-primary/5 to-background"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-sm font-medium text-primary">Expected Answer</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{targetAnswerText}</p>
                        </motion.div>

                        {allowManualInput && (
                            <motion.div
                                variants={itemVariants}
                                className="mt-4"
                            >
                                <Textarea
                                    placeholder="Type your answer here..."
                                    value={manualAnswer}
                                    onChange={(e) => setManualAnswer(e.target.value)}
                                    className="min-h-[100px] mb-4"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleSubmitManualAnswer}
                                        disabled={!manualAnswer.trim()}
                                        className="hover:bg-primary/10 hover:text-primary"
                                    >
                                        Submit Answer
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}