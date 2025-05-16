"use client"

import { useState, useEffect } from "react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import Link from "next/link"
import { SpeechFallback } from "@/components/speech-fallback"
import { questions } from "./data/questions"
import { QuestionDisplay } from "./components/question-display"
import { ReflexControls } from "./components/reflex-controls"
import { AnswerFeedback } from "./components/answer-feedback"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Award, Zap, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExerciseResult {
    questionId: number
    accuracy: number
    responseTime: number
    date: string
}

export default function ReflexPage() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [useFallback, setUseFallback] = useState(false)
    const [audioVisualizerEnabled, setAudioVisualizerEnabled] = useState(true)
    const [timeRemaining, setTimeRemaining] = useState(45)
    const [sessionStarted, setSessionStarted] = useState(false)
    const [sessionCompleted, setSessionCompleted] = useState(false)
    const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([])
    const [currentResult, setCurrentResult] = useState<ExerciseResult | null>(null)
    const [responseStartTime, setResponseStartTime] = useState<number | null>(null)

    const {
        startRecognition,
        stopRecognition,
        recognizedText,
        isRecognizing,
        error: recognitionError,
        audioData
    } = useSpeechRecognition()

    const { speak, isSpeaking, error: synthesisError } = useSpeechSynthesis()

    const {
        audioUrl,
        startRecording,
        stopRecording,
        getAudioData,
        error: recordingError,
    } = useAudioRecorder()

    const currentQuestion = questions[currentQuestionIndex]

    // Xử lý lỗi nhận dạng giọng nói
    useEffect(() => {
        if (recognitionError) {
            toast.error("Lỗi nhận dạng giọng nói", {
                description: recognitionError,
            })
            setUseFallback(true)
        }
    }, [recognitionError])

    // Xử lý lỗi tổng hợp giọng nói
    useEffect(() => {
        if (synthesisError) {
            toast.error("Lỗi tổng hợp giọng nói", {
                description: synthesisError,
            })
            setUseFallback(true)
        }
    }, [synthesisError])

    // Xử lý lỗi ghi âm
    useEffect(() => {
        if (recordingError) {
            toast.error("Lỗi ghi âm", {
                description: recordingError,
            })
            setAudioVisualizerEnabled(false)
        }
    }, [recordingError])

    // Cập nhật văn bản khi nhận dạng giọng nói thành công
    useEffect(() => {
        if (recognizedText) {
            setTranscript(recognizedText)
        }
    }, [recognizedText])

    // Tính giờ cho bài tập
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null

        if (isListening && timeRemaining > 0) {
            timer = setInterval(() => {
                setTimeRemaining(prevTime => {
                    if (prevTime <= 1) {
                        handleStopListening()
                        return 0
                    }
                    return prevTime - 1
                })
            }, 1000)
        }

        return () => {
            if (timer) clearInterval(timer)
        }
    }, [isListening, timeRemaining])

    // Bắt đầu nghe
    const handleStartListening = async () => {
        setSessionStarted(true)
        setIsListening(true)
        setTranscript("")
        setTimeRemaining(45)
        setResponseStartTime(Date.now())

        try {
            // Bắt đầu nhận dạng giọng nói
            await startRecognition()

            // Thử bắt đầu ghi âm để trực quan hóa
            try {
                await startRecording()
            } catch (err) {
                console.error("Không thể bắt đầu ghi âm:", err)
                setAudioVisualizerEnabled(false)
            }
        } catch (err) {
            setIsListening(false)
            setUseFallback(true)
            toast.error("Lỗi", {
                description: err instanceof Error ? err.message : "Không thể bắt đầu nhận dạng giọng nói",
            })
        }
    }

    // Dừng nghe
    const handleStopListening = () => {
        if (!isListening) return

        setIsListening(false)
        stopRecognition()
        stopRecording()

        // Tính toán kết quả
        if (responseStartTime) {
            const responseTime = (Date.now() - responseStartTime) / 1000 // chuyển đổi thành giây

            // Lấy độ chính xác từ phân tích văn bản (giả định)
            // Trong thực tế, bạn sẽ lấy điều này từ AnswerFeedback component
            // Thông qua một callback
            const calculatedAccuracy = calculateAccuracy(transcript, currentQuestion.answer)

            const result: ExerciseResult = {
                questionId: currentQuestion.id,
                accuracy: calculatedAccuracy,
                responseTime: responseTime,
                date: new Date().toISOString()
            }

            setCurrentResult(result)
            setExerciseResults(prev => [...prev, result])

            // Hiển thị thông báo kết quả
            toast.success("Đã hoàn thành câu hỏi", {
                description: `Độ chính xác: ${calculatedAccuracy}%, Thời gian: ${responseTime.toFixed(1)}s`
            })
        }
    }

    // Tính toán độ chính xác dựa trên khoảng cách Levenshtein
    const calculateAccuracy = (spoken: string, target: string): number => {
        if (!spoken) return 0

        // Chuẩn hóa chuỗi
        const normalizedSpoken = spoken.toLowerCase().replace(/[.,?!]/g, "")
        const normalizedTarget = target.toLowerCase().replace(/[.,?!]/g, "")

        // Tách thành các từ
        const spokenWords = normalizedSpoken.split(" ").filter(word => word.trim() !== "")
        const targetWords = normalizedTarget.split(" ").filter(word => word.trim() !== "")

        // Đếm từ khớp
        let correctCount = 0
        let partialCount = 0

        spokenWords.forEach(word => {
            if (targetWords.includes(word)) {
                correctCount++
            } else if (targetWords.some(targetWord =>
                targetWord.includes(word) || word.includes(targetWord) ||
                calculateLevenshteinDistance(word, targetWord) <= Math.min(2, Math.floor(targetWord.length / 3))
            )) {
                partialCount++
            }
        })

        // Tính toán độ chính xác
        const totalWords = Math.max(spokenWords.length, 1)
        return Math.round(((correctCount + (partialCount * 0.5)) / totalWords) * 100)
    }

    // Hàm tính khoảng cách Levenshtein
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

    // Chuyển sang câu hỏi tiếp theo
    const handleNextQuestion = () => {
        if (currentQuestionIndex >= questions.length - 1) {
            // Đã hoàn thành tất cả câu hỏi
            setSessionCompleted(true)
            return
        }

        setCurrentQuestionIndex(prevIndex => prevIndex + 1)
        setTranscript("")
        setTimeRemaining(45)
        setCurrentResult(null)

        // Nếu đang nghe thì dừng lại
        if (isListening) {
            stopRecognition()
            stopRecording()
            setIsListening(false)
        }
    }

    // Bắt đầu lại phiên luyện tập
    const handleRestartSession = () => {
        setCurrentQuestionIndex(0)
        setSessionCompleted(false)
        setExerciseResults([])
        setTranscript("")
        setTimeRemaining(45)
        setCurrentResult(null)
        setSessionStarted(false)
    }

    // Xử lý gửi văn bản từ fallback
    const handleFallbackSubmit = (text: string) => {
        setTranscript(text)

        // Tính toán kết quả
        const calculatedAccuracy = calculateAccuracy(text, currentQuestion.answer)

        const result: ExerciseResult = {
            questionId: currentQuestion.id,
            accuracy: calculatedAccuracy,
            responseTime: 0, // Không có thời gian phản ứng thực tế
            date: new Date().toISOString()
        }

        setCurrentResult(result)
        setExerciseResults(prev => [...prev, result])
    }

    // Safe wrapper cho getAudioData để ngăn lỗi lan truyền
    const safeGetAudioData = () => {
        if (!audioVisualizerEnabled) return null

        try {
            return getAudioData()
        } catch (err) {
            console.error("Lỗi khi lấy dữ liệu âm thanh:", err)
            setAudioVisualizerEnabled(false)
            return null
        }
    }

    // Tính điểm trung bình
    const calculateAverageScore = () => {
        if (exerciseResults.length === 0) return 0
        const totalAccuracy = exerciseResults.reduce((sum, result) => sum + result.accuracy, 0)
        return Math.round(totalAccuracy / exerciseResults.length)
    }

    // Tính thời gian phản ứng trung bình
    const calculateAverageResponseTime = () => {
        if (exerciseResults.length === 0) return 0
        const totalTime = exerciseResults.reduce((sum, result) => sum + result.responseTime, 0)
        return (totalTime / exerciseResults.length).toFixed(1)
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                        <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Luyện tập Phản xạ</h1>
                </div>
                {!sessionStarted && !sessionCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <Card className="mb-8 border-2 shadow-md pt-0">
                            <CardHeader className="py-4 rounded-t-lg bg-gradient-to-b from-primary/20 to-background">
                                <CardTitle>Bắt đầu Luyện tập Phản xạ</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Bạn sẽ được hiển thị một câu hỏi và có 45 giây để trả lời.
                                    Càng trả lời nhanh và chính xác, điểm của bạn càng cao!
                                </p>
                                <div className="p-4 rounded-lg shadow-inner">
                                    <h3 className="font-medium mb-2">Hướng dẫn</h3>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        <li>Nhấn nút "Trả lời" để bắt đầu ghi âm</li>
                                        <li>Nói rõ ràng vào micrô câu trả lời của bạn</li>
                                        <li>Bạn có thể dừng lại bất cứ lúc nào hoặc đợi hết 45 giây</li>
                                        <li>Nhận phản hồi ngay lập tức về độ chính xác của câu trả lời</li>
                                    </ul>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button
                                    onClick={() => setSessionStarted(true)}
                                    className="w-full"
                                >
                                    Bắt đầu ngay
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}

                {sessionCompleted ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <Card className="border-2 border-green-100 dark:border-green-900 bg-gradient-to-t from-primary/20 to-background shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-yellow-500" />
                                    Kết quả Luyện tập
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gradient-to-t from-green-100/80 to-green-50/60 dark:from-green-900/20 dark:to-green-800/10 p-4 rounded-lg border border-green-100 dark:border-green-800 flex flex-col items-center">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Điểm trung bình</p>
                                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{calculateAverageScore()}%</p>
                                    </div>
                                    <div className="bg-gradient-to-t from-blue-100/80 to-blue-50/60 dark:from-blue-900/20 dark:to-blue-800/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex flex-col items-center">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Thời gian phản ứng trung bình</p>
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{calculateAverageResponseTime()}s</p>
                                    </div>
                                </div>

                                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Kết quả từng câu</h3>
                                <div className="space-y-3 mb-6">
                                    {exerciseResults.map((result, index) => {
                                        const question = questions.find(q => q.id === result.questionId)

                                        return (
                                            <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-t from-primary/5 to-background dark:from-primary/10 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{question?.question || `Câu hỏi ${index + 1}`}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Thời gian: {result.responseTime.toFixed(1)}s
                                                    </p>
                                                </div>
                                                <div className={`px-2 py-1 rounded-full text-white font-medium ${result.accuracy >= 80 ? 'bg-green-500' :
                                                    result.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}>
                                                    {result.accuracy}%
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button
                                    onClick={handleRestartSession}
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                >
                                    Thử lại
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ) : sessionStarted && (
                    <AnimatePresence mode="wait">
                        <QuestionDisplay
                            key={currentQuestion.id}
                            question={currentQuestion}
                            currentIndex={currentQuestionIndex}
                            totalQuestions={questions.length}
                            timeRemaining={timeRemaining}
                            isAnswering={isListening}
                        />
                    </AnimatePresence>
                )}

                {sessionStarted && !sessionCompleted && (
                    <>
                        {useFallback ? (
                            <motion.div
                                className="mb-8"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="p-6 border-amber-200 dark:border-amber-800 bg-gradient-to-t from-amber-100/50 to-amber-50/30 dark:from-amber-900/20 dark:to-background">
                                    <h3 className="font-medium text-amber-700 dark:text-amber-300 mb-2">
                                        Nhận dạng giọng nói không khả dụng
                                    </h3>
                                    <p className="text-amber-600 dark:text-amber-400 mb-4 text-sm">
                                        Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói hoặc quyền truy cập micrô bị từ chối.
                                        Vui lòng nhập văn bản của bạn theo cách thủ công.
                                    </p>
                                    <SpeechFallback onTextSubmit={handleFallbackSubmit} type="recognition" />
                                </Card>
                            </motion.div>
                        ) : (
                            <ReflexControls
                                isListening={isListening}
                                isRecognizing={isRecognizing}
                                onStartListening={handleStartListening}
                                onStopListening={handleStopListening}
                                onNextQuestion={handleNextQuestion}
                                timeRemaining={timeRemaining}
                                getAudioData={audioVisualizerEnabled ? safeGetAudioData : undefined}
                                disabled={currentResult !== null}
                            />
                        )}

                        <AnimatePresence>
                            {transcript && (
                                <AnswerFeedback
                                    transcript={transcript}
                                    targetAnswerText={currentQuestion.answer}
                                    isActive={isListening}
                                />
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    )
}