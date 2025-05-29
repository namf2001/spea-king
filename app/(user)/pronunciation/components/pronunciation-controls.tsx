'use client';

import { Button } from '@/components/ui/button';
import { Mic, SkipBack, SkipForward, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioVisualizer } from '@/components/audio-visualizer';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface ExerciseControlsProps {
  readonly isAssessing: boolean;
  readonly isSpeaking: boolean;
  readonly isProcessing: boolean;
  readonly onStartAssessment: () => Promise<void>;
  readonly onStopAssessment: () => void;
  readonly onPreviousExercise: () => void;
  readonly onNextExercise: () => void;
  readonly getAudioData?: () => Uint8Array | null;
}

export function ExerciseControls({
  isAssessing,
  isSpeaking,
  isProcessing,
  onStartAssessment,
  onStopAssessment,
  onPreviousExercise,
  onNextExercise,
  getAudioData,
}: ExerciseControlsProps) {
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAssessing) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAssessing]);

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
      className="mb-4"
    >
      <Card className="items-center">
        {isAssessing && getAudioData && (
          <motion.div
            className="mb-6 w-full px-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Recording...
                </p>
              </div>
              <div className="font-mono text-sm text-gray-500 dark:text-gray-400">
                {formatTime(recordingTime)}
              </div>
            </div>
            <div className="relative">
              <AudioVisualizer
                getAudioData={getAudioData}
                isActive={isAssessing}
                height={60}
                barColor="#ed9392"
                backgroundColor="rgba(248, 250, 252, 0.8)"
                className="overflow-hidden rounded-lg"
              />
              <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
            </div>
          </motion.div>
        )}

        <div className="flex w-full max-w-lg items-center justify-center gap-4 px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key="previous-button"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex w-full justify-center sm:w-auto"
            >
              <Button
                onClick={onPreviousExercise}
                variant="secondary"
                className="w-full"
              >
                <div className="flex items-center gap-2">
                  <SkipBack className="h-5 w-5" />
                  <span className="ml-2 hidden md:block">Trước đó</span>
                </div>
              </Button>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isAssessing ? (
              <motion.div
                key="stop-recording"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex w-full justify-center sm:w-auto"
              >
                <Button
                  onClick={onStopAssessment}
                  variant="destructive"
                  disabled={isProcessing}
                  className="w-full"
                >
                  <VolumeX className="mr-2 h-5 w-5" />
                  <span className="font-medium">
                    {isProcessing ? 'Processing...' : 'Stop'}
                  </span>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="start-recording"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex w-full justify-center sm:w-auto"
              >
                <Button
                  onClick={onStartAssessment}
                  disabled={isProcessing}
                  className="from-primary to-primary/90 w-full bg-gradient-to-r"
                >
                  <Mic className="h-5 w-5" />
                  <span className="ml-2 hidden md:block">Start Assessment</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex w-full justify-center sm:mt-0 sm:w-auto"
          >
            <Button
              onClick={onNextExercise}
              variant="secondary"
              className="w-full"
            >
              <SkipForward className="h-5 w-5" />
              <span className="ml-2 hidden md:block">Next</span>
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
