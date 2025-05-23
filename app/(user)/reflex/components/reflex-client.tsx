"use client"

import { useState, useEffect } from "react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { questions as defaultQuestions } from "../data/questions"
import { QuestionDisplay } from "./question-display"
import { ReflexControls } from "./reflex-controls"
import { AnswerFeedback } from "./answer-feedback"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { MicOff, Keyboard, BrainCircuit, ListPlus } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

interface ExerciseResult {
    questionId: string | number
    accuracy: number
    responseTime: number
    date: string
}

// ReflexQuestion interface to match the database schema
interface ReflexQuestion {
    id: string
    question: string
    answer: string
    suggestedAnswer: string | null
    createdAt: Date
    updatedAt: Date
}

interface ReflexClientProps {
    userQuestions: ReflexQuestion[]
}

export default function ReflexClient({ userQuestions }: ReflexClientProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [useFallback, setUseFallback] = useState(false)
    const [audioVisualizerEnabled, setAudioVisualizerEnabled] = useState(true)
    const [timeRemaining, setTimeRemaining] = useState(45)
    const [currentResult, setCurrentResult] = useState<ExerciseResult | null>(null)
    const [responseStartTime, setResponseStartTime] = useState<number | null>(null)
    const [useManualInput, setUseManualInput] = useState(false)
    const [manualAnswer, setManualAnswer] = useState("")

    const {
        startRecognition,
        stopRecognition,
        recognizedText,
        isRecognizing,
        error: recognitionError,
    } = useSpeechRecognition()

    const { error: synthesisError } = useSpeechSynthesis()

    const {
        startRecording,
        stopRecording,
        getAudioData,
        error: recordingError,
    } = useAudioRecorder()

    // Get the current question - either from userQuestions or defaultQuestions
    const currentQuestion = userQuestions.length > 0
        ? userQuestions[currentQuestionIndex % userQuestions.length]
        : defaultQuestions[currentQuestionIndex % defaultQuestions.length]

    // Handle speech recognition errors
    useEffect(() => {
        if (recognitionError) {
            toast.error("Lỗi nhận dạng giọng nói", {
                description: recognitionError,
            })
            setUseFallback(true)
        }
    }, [recognitionError])

    // Handle speech synthesis errors
    useEffect(() => {
        if (synthesisError) {
            toast.error("Lỗi tổng hợp giọng nói", {
                description: synthesisError,
            })
            setUseFallback(true)
        }
    }, [synthesisError])

    // Handle recording errors
    useEffect(() => {
        if (recordingError) {
            toast.error("Lỗi ghi âm", {
                description: recordingError,
            })
            setAudioVisualizerEnabled(false)
        }
    }, [recordingError])

    // Update text when speech recognition succeeds
    useEffect(() => {
        if (recognizedText) {
            setTranscript(recognizedText)
        }
    }, [recognizedText])

    // Timer for exercises
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

    // Start listening
    const handleStartListening = async () => {
        setIsListening(true)
        setTranscript("")
        setTimeRemaining(45)
        setResponseStartTime(Date.now())

        // Skip speech recognition if manual input mode
        if (useManualInput) {
            return
        }

        try {
            // Start speech recognition
            await startRecognition()

            // Try to start recording for visualization
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

    // Stop listening
    const handleStopListening = () => {
        if (!isListening) return

        setIsListening(false)
        stopRecognition()
        stopRecording()

        // Calculate results
        if (responseStartTime && !useManualInput) {
            const responseTime = (Date.now() - responseStartTime) / 1000 // chuyển đổi thành giây

            // Lấy độ chính xác từ phân tích văn bản
            const calculatedAccuracy = calculateAccuracy(transcript, currentQuestion.answer)

            const result: ExerciseResult = {
                questionId: currentQuestion.id,
                accuracy: calculatedAccuracy,
                responseTime: responseTime,
                date: new Date().toISOString()
            }

            setCurrentResult(result)

            // Hiển thị thông báo kết quả
            toast.success("Đã hoàn thành câu hỏi", {
                description: `Độ chính xác: ${calculatedAccuracy}%, Thời gian: ${responseTime.toFixed(1)}s`
            })
        }
    }

    // Handle manual answer submission
    const handleManualAnswerSubmit = (answer: string) => {
        // Tính toán độ chính xác với câu trả lời thủ công
        const calculatedAccuracy = calculateAccuracy(answer, currentQuestion.answer)

        const responseTime = responseStartTime
            ? (Date.now() - responseStartTime) / 1000
            : 0

        const result: ExerciseResult = {
            questionId: currentQuestion.id,
            accuracy: calculatedAccuracy,
            responseTime: responseTime,
            date: new Date().toISOString()
        }

        setCurrentResult(result)
        setTranscript(answer)

        toast.success("Đã gửi câu trả lời", {
            description: `Độ chính xác: ${calculatedAccuracy}%`
        })
    }

    // Handler for moving to the next question
    const handleNextQuestion = () => {
        const totalQuestions = userQuestions.length > 0
            ? userQuestions.length
            : defaultQuestions.length;

        setCurrentQuestionIndex((prev) => (prev + 1) % totalQuestions);
        setTimeRemaining(45);
        setTranscript("");
        setCurrentResult(null);
        setResponseStartTime(null);
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

    // Chuyển đổi giữa chế độ giọng nói và nhập thủ công
    const handleToggleInputMode = () => {
        setUseManualInput(!useManualInput)
        if (isListening) {
            stopRecognition()
            stopRecording()
            setIsListening(false)
        }
    }

    // Extract the nested ternary into an independent statement
    const getInputModeLabel = () => {
        if (useManualInput) {
            return (
                <div className="flex items-center">
                    <Keyboard className="h-4 w-4 mr-1" /> Nhập thủ công
                </div>
            );
        } else {
            return (
                <div className="flex items-center">
                    <MicOff className="h-4 w-4 mr-1" /> Tắt mic
                </div>
            );
        }
    };

    return (
        <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="flex items-center justify-between mb-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-full relative overflow-hidden">
                        <BrainCircuit className="h-5 w-5 sm:h-6 sm:w-6 text-white relative z-10" />
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Conversation Practice</h1>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button asChild variant="outline" className="flex items-center gap-2">
                            <Link href="/reflex/question">
                                <ListPlus className="h-4 w-4" /> My Question
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Manage your custom questions
                    </TooltipContent>
                </Tooltip>
            </motion.div>
            <div className="mb-4 flex items-center justify-end space-x-2">
                <div className="flex items-center space-x-2">
                    <Label htmlFor="input-mode" className={useManualInput ? "text-primary" : "text-muted-foreground"}>
                        {getInputModeLabel()}
                    </Label>
                    <Switch
                        id="input-mode"
                        checked={useManualInput}
                        onCheckedChange={handleToggleInputMode}
                        className="data-[state=checked]:bg-primary"
                    />
                </div>
            </div>
            <AnimatePresence mode="wait">
                <QuestionDisplay
                    key={currentQuestion.id}
                    question={currentQuestion}
                    currentIndex={currentQuestionIndex}
                    totalQuestions={userQuestions.length > 0 ? userQuestions.length : defaultQuestions.length}
                    timeRemaining={useManualInput ? undefined : timeRemaining}
                    isAnswering={isListening}
                />
            </AnimatePresence>

            {useManualInput ? (
                <Card className="border-2">
                    <CardContent className="pt-6">
                        <Textarea
                            placeholder="Type your answer here..."
                            value={manualAnswer}
                            onChange={(e) => setManualAnswer(e.target.value)}
                            className="min-h-[100px] mb-4 border-primary/20 focus:border-primary"
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={handleNextQuestion}
                                className="hover:bg-primary/10 hover:text-primary border-primary/20"
                            >
                                Skip
                            </Button>
                            <Button
                                disabled={!manualAnswer.trim()}
                                className="bg-primary hover:bg-primary/90"
                            >
                                Submit Answer
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
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
        </motion.div>
    )
}