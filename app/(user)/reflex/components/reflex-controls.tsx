'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioVisualizer } from '@/components/audio-visualizer';
import { Mic, StopCircle, SkipForward, Clock } from 'lucide-react';

interface ReflexControlsProps {
  isListening: boolean;
  isRecognizing: boolean;
  onStartListening: () => Promise<void>;
  onStopListening: () => void;
  onNextQuestion: () => void;
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
    <div className="mb-6 sm:mb-10">
      <motion.div
        className="from-primary/20 to-background flex flex-col items-center rounded-xl bg-gradient-to-t p-4 sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isListening && getAudioData && (
          <motion.div
            className="mb-4 w-full sm:mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary h-3 w-3 animate-pulse rounded-full"></div>
                <p className="text-primary text-sm font-medium">Recording...</p>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeRemaining)}</span>
              </div>
            </div>
            <div className="relative">
              <AudioVisualizer
                getAudioData={getAudioData}
                isActive={isListening}
                height={60}
                barColor="#f09695"
                backgroundColor="#fef4f4"
                className="overflow-hidden rounded-lg"
              />
            </div>
          </motion.div>
        )}

        <div className="flex w-full max-w-lg flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
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
                <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
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
                  className="pulse-animation relative flex h-12 w-full items-center gap-2 rounded-xl px-4 shadow-md sm:h-14 sm:w-auto sm:px-6"
                >
                  <StopCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm font-medium sm:text-base">Dừng</span>
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
                  size="lg"
                  className="flex h-12 w-full items-center gap-2 rounded-xl px-4 shadow-md sm:h-14 sm:w-auto sm:px-6"
                >
                  <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm font-medium sm:text-base">
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
              variant="ghost"
              className="flex h-10 w-full items-center gap-2 sm:h-auto sm:w-auto"
            >
              <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Câu tiếp</span>
            </Button>
          </motion.div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs sm:mt-8 sm:text-sm">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Time remaining: {formatTime(timeRemaining)}</span>
        </div>
      </motion.div>
    </div>
  );
}
