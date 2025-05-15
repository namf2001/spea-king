"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface AnswerFeedbackProps {
    readonly transcript: string
    readonly targetAnswerText: string
    readonly isActive: boolean
}

interface WordMatch {
    word: string
    status: 'correct' | 'incorrect' | 'partial'
    originalIndex: number
}

export function AnswerFeedback({
    transcript,
    targetAnswerText,
    isActive
}: AnswerFeedbackProps) {
    const [analyzedWords, setAnalyzedWords] = useState<WordMatch[]>([])
    const [accuracy, setAccuracy] = useState(0)

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

    // Nếu không có dữ liệu, trả về null
    if (!transcript || analyzedWords.length === 0) {
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
        >
            <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Phân tích câu trả lời</h3>
                        <Badge 
                            variant={accuracy >= 80 ? "default" : accuracy >= 50 ? "secondary" : "destructive"}
                            className="text-sm font-medium"
                        >
                            Độ chính xác: {accuracy}%
                        </Badge>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                        <div className="space-x-1 leading-relaxed">
                            {analyzedWords.map((wordMatch, index) => (
                                <span 
                                    key={`${wordMatch.word}-${index}`}
                                    className={`
                                        inline-block px-1 rounded
                                        ${wordMatch.status === 'correct' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 
                                          wordMatch.status === 'partial' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 
                                          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}
                                    `}
                                >
                                    {wordMatch.word}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex flex-wrap gap-2 mt-2">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span>Chính xác</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <span>Một phần</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span>Không chính xác</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}