'use client';

import { useState, useEffect, useRef } from 'react';
import { usePronunciationAssessment } from '@/hooks/use-pronunciation-assessment';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { saveSpeakingRecord } from '@/app/actions/speech';
import { ExerciseDisplay } from './pronunciation-display';
import { ExerciseControls } from './pronunciation-controls';
import { FeedbackDisplay } from './feedback-display';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic } from 'lucide-react';
import type {
  PronunciationLesson,
  PronunciationWord,
  PronunciationLessonWord,
} from '@prisma/client';

interface PronunciationClientProps {
  lessons: (PronunciationLesson & {
    words: (PronunciationLessonWord & {
      word: PronunciationWord;
    })[];
  })[];
  userId: string;
  error?: string;
}

export default function PronunciationClient({
  lessons,
  userId,
  error,
}: PronunciationClientProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAssessing, setIsAssessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [audioVisualizerEnabled, setAudioVisualizerEnabled] = useState(true);

  const assessmentProcessedRef = useRef<boolean>(false);

  const {
    startRecognition,
    stopRecognition,
    results: pronunciationResults,
    error: assessmentError,
    resetResults,
    isProcessingResult,
  } = usePronunciationAssessment();

  const { isSpeaking, error: synthesisError } = useSpeechSynthesis();
  const {
    audioUrl,
    startRecording,
    stopRecording,
    playRecording,
    getAudioData,
    error: recordingError,
  } = useAudioRecorder();

  // Current exercise and its current word
  const currentExercise = lessons[currentExerciseIndex];
  const currentWord = currentExercise?.words[currentWordIndex]?.word.word || '';

  // Display errors as toasts
  useEffect(() => {
    if (assessmentError) {
      toast.error('Speech Recognition Error', {
        description:
          assessmentError.message ||
          'An error occurred with speech recognition',
      });
    }
  }, [assessmentError]);

  useEffect(() => {
    if (synthesisError) {
      toast.error('Speech Synthesis Error', {
        description: synthesisError,
      });
    }
  }, [synthesisError]);

  useEffect(() => {
    if (recordingError) {
      toast.error('Recording Error', {
        description: recordingError,
      });
      setAudioVisualizerEnabled(false);
    }
  }, [recordingError]);

  useEffect(() => {
    if (pronunciationResults && !assessmentProcessedRef.current) {
      setResults(pronunciationResults);
      assessmentProcessedRef.current = true;
    }

    return () => {
      setResults(null);
      assessmentProcessedRef.current = false;
    };
  }, [pronunciationResults]);

  const handleStartAssessment = async () => {
    setIsAssessing(true);
    setResults(null);
    resetResults();
    assessmentProcessedRef.current = false;

    try {
      await startRecognition(currentWord);

      try {
        await startRecording();
      } catch (err) {
        console.error('Failed to start audio recording:', err);
        setAudioVisualizerEnabled(false);
      }
    } catch (err) {
      setIsAssessing(false);
      toast.error('Error', {
        description:
          err instanceof Error
            ? err.message
            : 'Failed to start speech recognition',
      });
    }
  };

  const handleStopAssessment = () => {
    setIsAssessing(false);
    const startTime = Date.now();
    stopRecognition();

    try {
      stopRecording();
    } catch (err) {
      console.error('Error stopping recording:', err);
    }

    // Save speaking record for pronunciation practice
    const duration = Math.floor((Date.now() - startTime) / 1000) || 5; // Default to 5 seconds if calculation fails
    saveSpeakingRecord('pronunciation', duration).catch((err) => {
      console.error('Error saving speaking record:', err);
    });
  };

  const handlePreviousExercise = () => {
    setResults(null);
    resetResults();
    assessmentProcessedRef.current = false;

    if (currentWordIndex > 0) {
      // Go to previous word in current lesson
      setCurrentWordIndex(currentWordIndex - 1);
    } else if (currentExerciseIndex > 0) {
      // Go to previous lesson and last word
      const prevExerciseIndex = currentExerciseIndex - 1;
      const prevExercise = lessons[prevExerciseIndex];
      setCurrentExerciseIndex(prevExerciseIndex);
      setCurrentWordIndex(prevExercise.words.length - 1);
    } else {
      // Already at first word of first lesson - go to last word of last lesson (loop)
      const lastExerciseIndex = lessons.length - 1;
      const lastExercise = lessons[lastExerciseIndex];
      setCurrentExerciseIndex(lastExerciseIndex);
      setCurrentWordIndex(lastExercise.words.length - 1);
    }
  };

  const handleNextExercise = () => {
    setResults(null);
    resetResults();
    assessmentProcessedRef.current = false;
    if (currentWordIndex < currentExercise.words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setCurrentWordIndex(0);
      setCurrentExerciseIndex((prev) => (prev + 1) % lessons.length);
    }
  };

  const handleReplayRecording = () => {
    if (audioUrl) {
      try {
        playRecording();
      } catch (err) {
        console.error('Error playing recording:', err);
        toast.error('Replay Error', {
          description: 'Failed to play recording',
        });
      }
    } else {
      toast.error('Replay Error', {
        description: 'No recording available to replay',
      });
    }
  };

  // Safe wrapper for getAudioData to prevent errors
  const safeGetAudioData = () => {
    if (!audioVisualizerEnabled) return null;

    try {
      return getAudioData();
    } catch (err) {
      console.error('Error getting audio data:', err);
      setAudioVisualizerEnabled(false);
      return null;
    }
  };

  if (!currentExercise || lessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Card className="max-w-md p-6">
          <h3 className="mb-2 text-lg font-medium">No exercises available</h3>
          <p className="text-muted-foreground mb-4">
            There are no pronunciation exercises in this lesson or the lesson
            could not be found.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        className="mx-auto max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mb-8 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <div className="bg-primary relative overflow-hidden rounded-full p-2">
              <Mic className="relative z-10 h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl lg:text-3xl">
              Pronunciation Practice
            </h1>
          </div>
        </motion.div>
        <AnimatePresence mode="wait">
          <ExerciseDisplay
            exercise={currentExercise}
            currentIndex={currentExerciseIndex}
            totalExercises={lessons.length}
            currentWordIndex={currentWordIndex}
          />
        </AnimatePresence>
        <ExerciseControls
          isAssessing={isAssessing}
          isSpeaking={isSpeaking}
          isProcessing={isProcessingResult}
          onStartAssessment={handleStartAssessment}
          onStopAssessment={handleStopAssessment}
          onPreviousExercise={handlePreviousExercise}
          onNextExercise={handleNextExercise}
          getAudioData={audioVisualizerEnabled ? safeGetAudioData : undefined}
        />
        <AnimatePresence>
          {results && (
            <FeedbackDisplay
              results={results}
              audioUrl={audioUrl}
              onReplayRecording={handleReplayRecording}
              targetText={currentWord}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
