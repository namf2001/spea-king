'use client';

import { useState, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { saveSpeakingRecord } from '@/app/actions/speech';
import { questions as defaultQuestions } from '../data/questions';
import { QuestionDisplay } from './question-display';
import { ReflexControls } from './reflex-controls';
import { AnswerFeedback } from './answer-feedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, ListPlus, X, PenSquare, InfoIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { ReflexQuestion } from '@prisma/client';
interface ExerciseResult {
  questionId: string | number;
  accuracy: number;
  responseTime: number;
  date: string;
}

interface ReflexClientProps {
  userQuestions: ReflexQuestion[];
}

export default function ReflexClient({ userQuestions }: ReflexClientProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioVisualizerEnabled, setAudioVisualizerEnabled] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const [currentResult, setCurrentResult] = useState<ExerciseResult | null>(
    null,
  );
  const [responseStartTime, setResponseStartTime] = useState<number | null>(
    null,
  );
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const {
    startRecognition,
    stopRecognition,
    recognizedText,
    isRecognizing,
    error: recognitionError,
  } = useSpeechRecognition();

  const { error: synthesisError } = useSpeechSynthesis();

  const {
    startRecording,
    stopRecording,
    getAudioData,
    error: recordingError,
  } = useAudioRecorder();

  // Get the current question - either custom question, userQuestions or defaultQuestions
  const currentQuestion =
    isCustomMode && customQuestion
      ? {
          id: 'custom',
          question: customQuestion,
          answer: customAnswer || 'No sample answer provided',
        }
      : userQuestions.length > 0
        ? userQuestions[currentQuestionIndex % userQuestions.length]
        : defaultQuestions[currentQuestionIndex % defaultQuestions.length];

  // Handle speech recognition errors
  useEffect(() => {
    if (recognitionError) {
      toast.error('Lỗi nhận dạng giọng nói', {
        description: recognitionError,
      });
    }
  }, [recognitionError]);

  // Handle speech synthesis errors
  useEffect(() => {
    if (synthesisError) {
      toast.error('Lỗi tổng hợp giọng nói', {
        description: synthesisError,
      });
    }
  }, [synthesisError]);

  // Handle recording errors
  useEffect(() => {
    if (recordingError) {
      toast.error('Lỗi ghi âm', {
        description: recordingError,
      });
      setAudioVisualizerEnabled(false);
    }
  }, [recordingError]);

  // Update text when speech recognition succeeds
  useEffect(() => {
    if (recognizedText) {
      setTranscript(recognizedText);
    }
  }, [recognizedText]);

  // Timer for exercises
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isListening && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            handleStopListening();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isListening, timeRemaining]);

  // Start listening
  const handleStartListening = async () => {
    setIsListening(true);
    setTranscript('');
    setTimeRemaining(45);
    setResponseStartTime(Date.now());

    try {
      // Start speech recognition
      await startRecognition();
      // Try to start recording for visualization
      try {
        await startRecording();
      } catch (err) {
        console.error('Không thể bắt đầu ghi âm:', err);
        setAudioVisualizerEnabled(false);
      }
    } catch (err) {
      setIsListening(false);
      toast.error('Lỗi', {
        description:
          err instanceof Error
            ? err.message
            : 'Không thể bắt đầu nhận dạng giọng nói',
      });
    }
  };

  // Stop listening
  const handleStopListening = () => {
    if (!isListening) return;

    setIsListening(false);
    stopRecognition();
    stopRecording();

    // Calculate results
    if (responseStartTime) {
      const responseTime = (Date.now() - responseStartTime) / 1000; // chuyển đổi thành giây

      // Lấy độ chính xác từ phân tích văn bản
      const calculatedAccuracy = calculateAccuracy(
        transcript,
        currentQuestion.answer,
      );

      const result: ExerciseResult = {
        questionId: currentQuestion.id,
        accuracy: calculatedAccuracy,
        responseTime: responseTime,
        date: new Date().toISOString(),
      };

      setCurrentResult(result);

      // Save speaking record for reflex practice - defer to avoid setState during render
      setTimeout(() => {
        const duration = Math.floor(responseTime) || 3; // Use actual response time or default to 3 seconds
        const questionId =
          typeof currentQuestion.id === 'string'
            ? currentQuestion.id
            : undefined;
        saveSpeakingRecord('reflex', duration, undefined, questionId).catch(
          (err) => {
            console.error('Error saving speaking record:', err);
          },
        );
      }, 0);

      // Hiển thị thông báo kết quả
      toast.success('Đã hoàn thành câu hỏi', {
        description: `Độ chính xác: ${calculatedAccuracy}%, Thời gian: ${responseTime.toFixed(1)}s`,
      });
    }
  };

  // Handler for moving to the next question
  const handleNextQuestion = () => {
    if (isCustomMode) {
      // In custom mode, just clear the transcript and results
      setTranscript('');
      setCurrentResult(null);
      setResponseStartTime(null);
      return;
    }

    const totalQuestions =
      userQuestions.length > 0 ? userQuestions.length : defaultQuestions.length;

    setCurrentQuestionIndex((prev) => (prev + 1) % totalQuestions);
    setTimeRemaining(45);
    setTranscript('');
    setCurrentResult(null);
    setResponseStartTime(null);
  };

  // Handle custom question submission
  const handleCustomQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuestion.trim()) {
      setIsCustomMode(true);
      setShowCustomForm(false);
    } else {
      toast.error('Please enter a question');
    }
  };

  // Reset to default or user questions
  const handleResetToDefaultQuestions = () => {
    setIsCustomMode(false);
    setCustomQuestion('');
    setCustomAnswer('');
    setTranscript('');
    setCurrentResult(null);
  };

  // Tính toán độ chính xác dựa trên khoảng cách Levenshtein
  const calculateAccuracy = (spoken: string, target: string): number => {
    if (!spoken) return 0;

    // Chuẩn hóa chuỗi
    const normalizedSpoken = spoken.toLowerCase().replace(/[.,?!]/g, '');
    const normalizedTarget = target.toLowerCase().replace(/[.,?!]/g, '');

    // Tách thành các từ
    const spokenWords = normalizedSpoken
      .split(' ')
      .filter((word) => word.trim() !== '');
    const targetWords = normalizedTarget
      .split(' ')
      .filter((word) => word.trim() !== '');

    // Đếm từ khớp
    let correctCount = 0;
    let partialCount = 0;

    spokenWords.forEach((word) => {
      if (targetWords.includes(word)) {
        correctCount++;
      } else if (
        targetWords.some(
          (targetWord) =>
            targetWord.includes(word) ||
            word.includes(targetWord) ||
            calculateLevenshteinDistance(word, targetWord) <=
              Math.min(2, Math.floor(targetWord.length / 3)),
        )
      ) {
        partialCount++;
      }
    });

    // Tính toán độ chính xác
    const totalWords = Math.max(spokenWords.length, 1);
    return Math.round(((correctCount + partialCount * 0.5) / totalWords) * 100);
  };

  // Hàm tính khoảng cách Levenshtein
  const calculateLevenshteinDistance = (a: string, b: string): number => {
    const matrix = Array(a.length + 1)
      .fill(null)
      .map(() => Array(b.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) {
      matrix[i][0] = i;
    }

    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost,
        );
      }
    }

    return matrix[a.length][b.length];
  };

  // Safe wrapper cho getAudioData để ngăn lỗi lan truyền
  const safeGetAudioData = () => {
    if (!audioVisualizerEnabled) return null;

    try {
      return getAudioData();
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu âm thanh:', err);
      setAudioVisualizerEnabled(false);
      return null;
    }
  };

  return (
    <motion.div
      className="mx-auto w-full max-w-4xl px-2 sm:px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary relative overflow-hidden rounded-full p-2">
            <BrainCircuit className="relative z-10 h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <h1 className="text-lg font-bold sm:text-xl md:text-2xl lg:text-3xl">
            Conversation Practice
          </h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-2 sm:w-auto"
                onClick={() => setShowCustomForm(!showCustomForm)}
              >
                {showCustomForm ? (
                  <X className="h-4 w-4" />
                ) : (
                  <PenSquare className="h-4 w-4" />
                )}
                <span className="sm:hidden">
                  {showCustomForm ? 'Cancel' : 'Custom'}
                </span>
                <span className="hidden sm:inline">
                  {showCustomForm ? 'Cancel' : 'Custom Question'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {showCustomForm ? 'Cancel' : 'Create a custom question'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="outline"
                className="flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                <Link href="/reflex/question">
                  <ListPlus className="h-4 w-4" />
                  <span className="sm:hidden">Questions</span>
                  <span className="hidden sm:inline">My Questions</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Manage your custom questions</TooltipContent>
          </Tooltip>
        </div>
      </motion.div>

      {/* Custom Question Form */}
      <AnimatePresence>
        {showCustomForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="border-2 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg">Custom Question</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  onSubmit={handleCustomQuestionSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="customQuestion" className="text-sm font-medium">Your Question</Label>
                    <Input
                      id="customQuestion"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      placeholder="Enter your question here..."
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="customAnswer"
                      className="flex items-center justify-between text-sm font-medium"
                    >
                      <span>Sample Answer (Optional)</span>
                    </Label>
                    <Textarea
                      id="customAnswer"
                      value={customAnswer}
                      onChange={(e) => setCustomAnswer(e.target.value)}
                      placeholder="Enter a sample answer or leave empty to practice without one..."
                      className="min-h-[80px] w-full sm:min-h-[100px]"
                    />
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setShowCustomForm(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto">Use This Question</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isCustomMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex flex-col gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-2">
            <InfoIcon className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Using custom question mode
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetToDefaultQuestions}
            className="w-full text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-800 sm:w-auto"
          >
            Return to Standard Questions
          </Button>
        </motion.div>
      )}
      <AnimatePresence mode="wait">
        <QuestionDisplay
          key={currentQuestion.id}
          question={currentQuestion}
          currentIndex={currentQuestionIndex}
          totalQuestions={
            userQuestions.length > 0
              ? userQuestions.length
              : defaultQuestions.length
          }
          timeRemaining={timeRemaining}
          isAnswering={isListening}
        />
      </AnimatePresence>

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

      {currentResult && (
        <AnimatePresence>
          <AnswerFeedback
            transcript={transcript}
            targetAnswerText={currentQuestion.answer}
          />
        </AnimatePresence>
      )}
    </motion.div>
  );
}
