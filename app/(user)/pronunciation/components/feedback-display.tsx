'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle,
  Volume,
  Music,
  PenTool,
  Pause,
  Award,
  Target,
  TrendingUp,
  Volume2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useState, useRef, useEffect } from 'react';
import { PronunciationAssessmentResult } from '@/types/speech';
import { convertPhonemeToIPA } from '@/lib/utils';
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';

interface FeedbackDisplayProps {
  results: PronunciationAssessmentResult;
  audioUrl?: string | null;
  onReplayRecording?: () => void;
  targetText: string;
}

// Helper function to get badge variant
const getBadgeVariant = (score: number) => {
  if (score >= 80) return 'default';
  if (score >= 60) return 'secondary';
  return 'destructive';
};

// Chart label component
const ChartLabel = ({ viewBox, score }: { viewBox: any; score: number }) => {
  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
    return (
      <text
        x={viewBox.cx}
        y={viewBox.cy}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        <tspan
          x={viewBox.cx}
          y={viewBox.cy}
          className="fill-foreground text-4xl font-bold"
        >
          {Math.round(score)}
        </tspan>
        <tspan
          x={viewBox.cx}
          y={(viewBox.cy || 0) + 24}
          className="fill-muted-foreground text-sm"
        >
          out of 100
        </tspan>
      </text>
    );
  }
  return null;
};

export function FeedbackDisplay({
  results,
  audioUrl,
  onReplayRecording,
  targetText,
}: FeedbackDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Audio controls
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    }
  };

  // Add event listeners for audio events
  useEffect(() => {
    const audioElement = audioRef.current;

    if (!audioElement) return;

    const handleAudioEnded = () => {
      setIsPlaying(false);
    };

    const handleAudioPause = () => {
      setIsPlaying(false);
    };

    const handleAudioPlay = () => {
      setIsPlaying(true);
    };

    const handleAudioError = (error: Event) => {
      console.error('Audio error:', error);
      setIsPlaying(false);
    };

    // Add event listeners
    audioElement.addEventListener('ended', handleAudioEnded);
    audioElement.addEventListener('pause', handleAudioPause);
    audioElement.addEventListener('play', handleAudioPlay);
    audioElement.addEventListener('error', handleAudioError);

    // Cleanup function to remove event listeners
    return () => {
      audioElement.removeEventListener('ended', handleAudioEnded);
      audioElement.removeEventListener('pause', handleAudioPause);
      audioElement.removeEventListener('play', handleAudioPlay);
      audioElement.removeEventListener('error', handleAudioError);
    };
  }, [audioUrl]); // Add audioUrl as dependency

  // Reset playing state when audioUrl changes
  useEffect(() => {
    setIsPlaying(false);
  }, [audioUrl]);

  // Function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 dark:text-green-400';
    if (score >= 60) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  // Function to get background color based on score
  const getScoreBgColor = (score: number) => {
    if (score >= 80)
      return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
    if (score >= 60)
      return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
  };

  // Function to get chart color based on score
  const getChartColor = (score: number) => {
    if (score >= 80) return 'hsl(142, 76%, 36%)'; // Green
    if (score >= 60) return 'hsl(45, 93%, 47%)'; // Yellow
    return 'hsl(0, 84%, 60%)'; // Red
  };

  // Variants for animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  // Find the word with the lowest score (most problematic)
  // const problemWord = results?.words?.reduce(
  //     (prev: any, current: any) =>
  //         (prev?.accuracyScore < current?.accuracyScore) ? prev : current,
  //     results?.words?.[0]
  // );

  // Find phonemes with low scores across all words
  const problemPhonemes =
    results?.words?.flatMap((word: any) =>
      word.phonemes?.filter((phoneme: any) => phoneme.accuracyScore < 70),
    ) || [];

  // Chart data for RadialBarChart
  const chartData = [
    {
      score: results?.pronunciationScore || 0,
      fill: getChartColor(results?.pronunciationScore || 0),
    },
  ];

  const chartConfig = {
    visitors: {
      label: 'Score',
    },
    score: {
      label: 'Pronunciation Score',
      color: getChartColor(results?.pronunciationScore || 0),
    },
  } satisfies ChartConfig;

  return (
    <TooltipProvider>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-10"
      >
        <Card className="pt-0 shadow-lg border-2 border-gray-200 dark:border-gray-600">
          <CardHeader className="py-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="text-primary h-5 w-5" />
                Pronunciation Assessment Results
              </div>
              <motion.div
                className={`flex items-center gap-2 rounded-full px-3 py-1 ${getScoreBgColor(results?.pronunciationScore || 0)}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <span
                  className={`text-sm font-medium ${getScoreColor(results?.pronunciationScore || 0)}`}
                >
                  {results?.pronunciationScore}%
                </span>
              </motion.div>
            </CardTitle>
          </CardHeader>

          <CardContent className="pb-2">
            <motion.div variants={itemVariants} className="mb-6">
              <div className="ounded-xl bg-primary/10 rounded-lg p-4 shadow-inner">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                  {audioUrl && (
                    <motion.div
                      variants={itemVariants}
                      className="bg-primary/10 rounded-xl shadow-inner"
                    >
                      {/* Audio Controls */}
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          onClick={handlePlayPause}
                          variant="secondary"
                          size="icon"
                        >
                          {isPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Volume2Icon className="h-6 w-6" />
                          )}
                        </Button>
                      </div>
                      <audio ref={audioRef} src={audioUrl} />
                    </motion.div>
                  )}
                  Click To Play Your Pronunciation
                </h4>
                <div className="flex flex-wrap gap-1">
                  {results?.words?.map((word: any, index: number) => (
                    <Tooltip key={`word-${word.word}-${index}`}>
                      <TooltipTrigger asChild className="bg-amber-50">
                        <motion.span
                          className={`cursor-pointer rounded px-2 py-1 text-lg font-semibold transition-all duration-200 hover:scale-105 ${getScoreBgColor(word.accuracyScore)} border`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {word.word}
                        </motion.span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{word.word}</span>
                            <Badge
                              variant={getBadgeVariant(word.accuracyScore)}
                            >
                              {word.accuracyScore}%
                            </Badge>
                          </div>
                          {word.phonemes && word.phonemes.length > 0 && (
                            <div>
                              <p className="mb-1 text-xs font-medium">
                                Phonemes:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {word.phonemes.map(
                                  (phoneme: any, pi: number) => (
                                    <span
                                      key={`phoneme-${phoneme.phoneme}-${pi}`}
                                      className={`ipa-phoneme rounded px-2 py-1 text-xs ${getScoreBgColor(phoneme.accuracyScore)}`}
                                      style={{
                                        fontFamily:
                                          "'Noto Sans', 'Doulos SIL', 'Charis SIL', 'Times New Roman', serif",
                                      }}
                                    >
                                      <span className="text-primary font-bold">
                                        {convertPhonemeToIPA(phoneme.phoneme)}
                                      </span>
                                      <span className="text-muted-foreground ml-1">
                                        ({phoneme.accuracyScore}%)
                                      </span>
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                          {/* Syllables if available */}
                          {word.syllables && word.syllables.length > 0 && (
                            <div>
                              <p className="mb-2 text-xs font-medium">
                                Syllables:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {word.syllables.map(
                                  (syllable: any, si: number) => (
                                    <div
                                      key={`${syllable.syllable}-${si}`}
                                      className={`rounded px-2 py-1 text-xs ${getScoreBgColor(syllable.accuracyScore)}`}
                                    >
                                      <span className="font-medium">
                                        {syllable.grapheme}
                                      </span>{' '}
                                      <span className="opacity-70">
                                        ({syllable.syllable})
                                      </span>
                                      : {syllable.accuracyScore}%
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                          {word.errorType && word.errorType !== 'None' && (
                            <p className="text-xs text-red-600 dark:text-red-400">
                              Error: {word.errorType}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                {problemPhonemes.length > 0 ? (
                  <div className="pt-4">
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-medium text-blue-800 dark:text-blue-300">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Sounds That Need Practice
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {problemPhonemes.map((phoneme: any, i: number) => (
                        <motion.div
                          key={`problem-phoneme-${phoneme.phoneme}-${i}`}
                          variants={itemVariants}
                          className={`flex items-center gap-1 rounded-lg border-2 dark:border-gray-600 p-1 ${getScoreBgColor(phoneme.accuracyScore)}`}
                          whileHover={{ scale: 1.05 }}
                        >
                          <div
                            className="ipa-phoneme font-mono text-xs"
                            style={{
                              fontFamily:
                                "'Noto Sans', 'Doulos SIL', 'Charis SIL', 'Times New Roman', serif",
                            }}
                          >
                            {convertPhonemeToIPA(phoneme.phoneme)}
                          </div>
                          <div
                            className={`text-xs ${getScoreColor(phoneme.accuracyScore)}`}
                          >
                            {phoneme.accuracyScore}%
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-start gap-2 pt-4">
                    <Award className="h-4 w-4 text-green-500" />
                    <h3 className="text-xs text-green-700 dark:text-green-300">
                      Excellent Pronunciation!
                    </h3>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Pronunciation Score and Breakdown Section */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="flex flex-col space-y-6">
                <div className="flex flex-col gap-8 lg:flex-row">
                  {/* Pronunciation Score Circle */}
                  <div className="flex flex-shrink-0 flex-col items-center">
                    <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                      Overall Score
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="text-muted-foreground h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            Combined score based on accuracy, fluency,
                            completeness, and prosody
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </h3>

                    {/* Radial Chart */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="h-[200px] w-[200px]"
                    >
                      <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square h-full w-full"
                      >
                        <RadialBarChart
                          data={chartData}
                          width={200}
                          height={200}
                          startAngle={90}
                          endAngle={
                            90 +
                            (360 * (results?.pronunciationScore || 0)) / 100
                          }
                          innerRadius={60}
                          outerRadius={90}
                        >
                          <PolarGrid
                            gridType="circle"
                            radialLines={true}
                            stroke="none"
                            className="first:fill-muted last:fill-background"
                            polarRadius={[66, 54]}
                          />
                          <RadialBar
                            dataKey="score"
                            background
                            cornerRadius={10}
                          />
                          <PolarRadiusAxis
                            tick={false}
                            tickLine={false}
                            axisLine={false}
                          >
                            <Label
                              content={
                                <ChartLabel
                                  viewBox={{}}
                                  score={results?.pronunciationScore || 0}
                                />
                              }
                            />
                          </PolarRadiusAxis>
                        </RadialBarChart>
                      </ChartContainer>
                    </motion.div>

                    {/* Grade Display */}
                    <motion.div
                      className={`mb-4 rounded-full px-3 py-1 text-sm font-medium ${getScoreBgColor(results?.pronunciationScore || 0)}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    ></motion.div>

                    {/* Score Legend */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex flex-col items-center gap-1 rounded-lg border border-red-200 bg-red-50 p-2 dark:border-red-800 dark:bg-red-900/20">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <span className="text-red-600 dark:text-red-400">
                          0-59
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-1 rounded-lg border border-yellow-200 bg-yellow-50 p-2 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <span className="text-yellow-600 dark:text-yellow-400">
                          60-79
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-1 rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-green-600 dark:text-green-400">
                          80-100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="flex-grow">
                    <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                      Detailed Breakdown
                      <TrendingUp className="text-primary h-5 w-5" />
                    </h3>
                    <div className="space-y-6">
                      {/* Accuracy Score */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-600" />
                            <h4 className="text-lg font-semibold">Accuracy</h4>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="text-muted-foreground h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>
                                  How correctly you pronounced each sound and
                                  word
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xl font-bold ${getScoreColor(results?.accuracyScore || 0)}`}
                            >
                              {results?.accuracyScore || 0}
                            </span>
                            <span className="text-muted-foreground">/100</span>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress
                            value={results?.accuracyScore}
                            className="h-3 bg-blue-100 dark:bg-blue-900"
                          />
                          <motion.div
                            className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${results?.accuracyScore || 0}%`,
                            }}
                            transition={{ duration: 1.5, delay: 0.7 }}
                          />
                        </div>
                      </motion.div>
                      {/* Fluency Score */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Music className="h-5 w-5 text-green-600" />
                            <h4 className="text-lg font-semibold">Fluency</h4>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="text-muted-foreground h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>
                                  How smoothly and naturally you spoke without
                                  pauses or hesitations
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xl font-bold ${getScoreColor(results?.fluencyScore || 0)}`}
                            >
                              {results?.fluencyScore || 0}
                            </span>
                            <span className="text-muted-foreground">/100</span>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress
                            value={results?.fluencyScore}
                            className="h-3 bg-green-100 dark:bg-green-900"
                          />
                          <motion.div
                            className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${results?.fluencyScore || 0}%`,
                            }}
                            transition={{ duration: 1.5, delay: 0.9 }}
                          />
                        </div>
                      </motion.div>

                      {/* Completeness Score */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0 }}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <PenTool className="h-5 w-5 text-purple-600" />
                            <h4 className="text-lg font-semibold">
                              Completeness
                            </h4>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="text-muted-foreground h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>
                                  How much of the target text you actually spoke
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xl font-bold ${getScoreColor(results?.completenessScore || 0)}`}
                            >
                              {results?.completenessScore || 0}
                            </span>
                            <span className="text-muted-foreground">/100</span>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress
                            value={results?.completenessScore}
                            className="h-3 bg-purple-100 dark:bg-purple-900"
                          />
                          <motion.div
                            className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${results?.completenessScore || 0}%`,
                            }}
                            transition={{ duration: 1.5, delay: 1.1 }}
                          />
                        </div>
                      </motion.div>
                      {/* Prosody Score */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 }}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Volume className="h-5 w-5 text-orange-600" />
                            <h4 className="text-lg font-semibold">Prosody</h4>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="text-muted-foreground h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>
                                  How natural your rhythm, stress, and
                                  intonation sounded
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xl font-bold ${getScoreColor(results?.prosodyScore || 0)}`}
                            >
                              {results?.prosodyScore || 0}
                            </span>
                            <span className="text-muted-foreground">/100</span>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress
                            value={results?.prosodyScore}
                            className="h-3 bg-orange-100 dark:bg-orange-900"
                          />
                          <motion.div
                            className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${results?.prosodyScore || 0}%`,
                            }}
                            transition={{ duration: 1.5, delay: 1.3 }}
                          />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}
