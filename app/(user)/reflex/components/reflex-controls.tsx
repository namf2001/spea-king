'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioVisualizer } from '@/components/audio-visualizer';
import { Mic, StopCircle, SkipForward, SkipBack, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ReflexControlsProps {
  isListening: boolean;
  isRecognizing: boolean;
  onStartListening: () => Promise<void>;
  onStopListening: () => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  timeRemaining: number;
  getAudioData?: () => Uint8Array | null;
  disabled: boolean;
}

export function ReflexControls({
  isListening,
  isRecognizing,
  onStartListening,
  onStopListening,
  onNextQuestion,
  onPreviousQuestion,
  timeRemaining,
  getAudioData,
  disabled,
}: ReflexControlsProps) {
  const [countdown, setCountdown] = useState(5);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // Start countdown before recording
  const handlePrepareStartListening = () => {
    setIsCountingDown(true);
    setCountdown(5);
  };

  // Recording countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isCountingDown && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      onStartListening();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCountingDown, countdown, onStartListening]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-4 sm:mb-6"
    >
      <Card className="items-center border-2 border-gray-200 dark:border-gray-600 p-4 sm:p-6">
        {isListening && getAudioData && (
          <motion.div
            className="mb-4 w-full sm:mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Recording...</p>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-sm text-gray-500 dark:text-gray-400">{formatTime(timeRemaining)}</span>
              </div>
            </div>
            <div className="relative">
              <AudioVisualizer
                getAudioData={getAudioData}
                isActive={isListening}
                height={60}
                barColor="#ed9392"
                backgroundColor="rgba(248, 250, 252, 0.8)"
                className="overflow-hidden rounded-lg"
              />
              <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
            </div>
          </motion.div>
        )}
        <div className="flex w-full max-w-lg items-center justify-center gap-3">
          {/* Previous Question Button */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex w-full justify-center sm:w-auto"
          >
            <Button
              onClick={onPreviousQuestion}
              variant="secondary"
              disabled={disabled}
              className="w-full"
            >
              <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden text-sm sm:block sm:text-base">Câu trước</span>
            </Button>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Extract nested ternary operation into independent conditional statements */}
            {isCountingDown && (
              <motion.div
                key="countdown"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center justify-center gap-2"
              >
                <div className="text-primary text-3xl font-bold sm:text-4xl">
                  {countdown}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline sm:text-base">
                  Chuẩn bị trả lời...
                </p>
              </motion.div>
            )}

            {!isCountingDown && isListening && (
              <motion.div
                key="stop-button"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex w-full justify-center sm:w-auto"
              >
                <Button
                  onClick={onStopListening}
                  variant="destructive"
                  size="lg"
                  className="pulse-animation relative flex h-12 w-12 items-center justify-center gap-2 rounded-xl px-2 shadow-md sm:h-14 sm:w-auto sm:px-6"
                >
                  <StopCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden text-sm font-medium sm:inline sm:text-base">Dừng</span>
                </Button>
              </motion.div>
            )}

            {!isCountingDown && !isListening && (
              <motion.div
                key="start-button"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex w-full justify-center sm:w-auto"
              >
                <Button
                  onClick={handlePrepareStartListening}
                  disabled={isRecognizing || disabled}
                  className="w-full"
                >
                  <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden text-sm font-medium sm:block sm:text-base">
                    {isRecognizing ? 'Đang nghe...' : 'Trả lời'}
                  </span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex w-full justify-center sm:w-auto"
          >
            <Button
              onClick={onNextQuestion}
              variant="secondary"
              className="w-full"
            >
              <span className="hidden text-sm sm:inline sm:text-base">Câu tiếp</span>
              <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </motion.div>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Time remaining: {formatTime(timeRemaining)}</span>
        </div>
      </Card>
    </motion.div>
  );
}
