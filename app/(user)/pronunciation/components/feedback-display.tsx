"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, ChevronDown, ChevronRight, Volume, Music, PenTool } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface FeedbackDisplayProps {
    results: any;
}

export function FeedbackDisplay({ results }: FeedbackDisplayProps) {
    const [expandedWordIndex, setExpandedWordIndex] = useState<number | null>(null);
    
    // Toggle word expansion
    const toggleWordExpansion = (index: number) => {
        if (expandedWordIndex === index) {
            setExpandedWordIndex(null);
        } else {
            setExpandedWordIndex(index);
        }
    };
    
    // Function to get color based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500 dark:text-green-400";
        if (score >= 60) return "text-yellow-500 dark:text-yellow-400";
        return "text-red-500 dark:text-red-400";
    };

    // Function to get background color based on score
    const getScoreBgColor = (score: number) => {
        if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
        if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
        return "bg-red-100 dark:bg-red-900/30";
    };
    
    // Variants for animation
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.1
            }
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 24
            }
        }
    };

    // Find the word with the lowest score (most problematic)
    const problemWord = results?.words?.reduce(
        (prev: any, current: any) => 
            (prev?.accuracyScore < current?.accuracyScore) ? prev : current, 
        results?.words?.[0]
    );

    // Find phonemes with low scores across all words
    const problemPhonemes = results?.words?.flatMap((word: any) => 
        word.phonemes?.filter((phoneme: any) => phoneme.accuracyScore < 70)
    ) || [];

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
                        <PenTool className="h-4 w-4 text-primary" />
                        Pronunciation Assessment Results
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 pb-2">
                    <Tabs defaultValue="overview" className="mb-4">
                        <TabsList className="mb-4 w-full">
                            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                            <TabsTrigger value="words" className="flex-1">Word Analysis</TabsTrigger>
                            <TabsTrigger value="tips" className="flex-1">Feedback</TabsTrigger>
                        </TabsList>
                        
                        {/* Overview Tab */}
                        <TabsContent value="overview">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <motion.div 
                                    variants={itemVariants} 
                                    className="p-4 rounded-lg border bg-gradient-to-t from-primary/5 to-background"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <PenTool className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-medium">Accuracy</h3>
                                    </div>
                                    <p className={`text-2xl font-bold ${getScoreColor(results?.accuracyScore)}`}>
                                        {results?.accuracyScore}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">How correctly you pronounced each sound</p>
                                </motion.div>
                                
                                <motion.div 
                                    variants={itemVariants} 
                                    className="p-4 rounded-lg border bg-gradient-to-t from-primary/5 to-background"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Music className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-medium">Fluency</h3>
                                    </div>
                                    <p className={`text-2xl font-bold ${getScoreColor(results?.fluencyScore)}`}>
                                        {results?.fluencyScore}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">How smooth and natural your speech sounds</p>
                                </motion.div>
                                
                                <motion.div 
                                    variants={itemVariants} 
                                    className="p-4 rounded-lg border bg-gradient-to-t from-primary/5 to-background"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Volume className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-medium">Overall</h3>
                                    </div>
                                    <p className={`text-2xl font-bold ${getScoreColor(results?.pronunciationScore)}`}>
                                        {results?.pronunciationScore}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">Combined pronunciation score</p>
                                </motion.div>
                            </div>
                            
                            {/* Prosody Score if available */}
                            {results?.prosodyScore !== undefined && (
                                <motion.div 
                                    variants={itemVariants} 
                                    className="mt-4 p-4 rounded-lg border bg-gradient-to-t from-primary/10 to-background"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Music className="h-4 w-4 text-primary" />
                                            <h3 className="text-sm font-medium">Prosody Score</h3>
                                        </div>
                                        <span className={`text-lg font-bold ${getScoreColor(results?.prosodyScore)}`}>
                                            {results?.prosodyScore}%
                                        </span>
                                    </div>
                                    <div className="relative h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2">
                                        <div 
                                            className={`h-full rounded-full ${
                                                results?.prosodyScore >= 80 ? 'bg-green-500' : 
                                                results?.prosodyScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${results?.prosodyScore}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Prosody refers to the melody of your speech - rhythm, stress, and intonation patterns
                                    </p>
                                </motion.div>
                            )}
                            
                            {/* Problematic Phonemes */}
                            {problemPhonemes.length > 0 && (
                                <motion.div 
                                    variants={itemVariants} 
                                    className="mt-4 p-4 rounded-lg border bg-gradient-to-t from-red-50 dark:from-red-950/20 to-background"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Difficult Sounds</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {problemPhonemes.slice(0, 5).map((phoneme: any, i: number) => (
                                            <div 
                                                key={i}
                                                className={`px-2 py-1 rounded text-xs ${getScoreBgColor(phoneme.accuracyScore)}`}
                                            >
                                                {phoneme.phoneme}: {phoneme.accuracyScore}%
                                            </div>
                                        ))}
                                        {problemPhonemes.length > 5 && (
                                            <div className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-800">
                                                +{problemPhonemes.length - 5} more
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </TabsContent>
                        
                        {/* Words Analysis Tab */}
                        <TabsContent value="words">
                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-3">
                                    {results?.words?.map((word: any, index: number) => (
                                        <motion.div 
                                            key={index}
                                            variants={itemVariants}
                                            className={`p-3 rounded-lg border ${
                                                word.errorType !== "None" 
                                                ? 'bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                                                : 'bg-gradient-to-t from-background to-background/80 border-gray-200 dark:border-gray-700'
                                            }`}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleWordExpansion(index)}
                                                className="w-full flex items-center justify-between p-0 h-8"
                                            >
                                                <div className="flex items-center">
                                                    <span className={`font-medium text-base ${word.errorType !== "None" ? 'text-red-600 dark:text-red-400' : ''}`}>
                                                        {word.word}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-sm font-medium ${getScoreColor(word.accuracyScore)}`}>
                                                        {word.accuracyScore}%
                                                    </span>
                                                    {expandedWordIndex === index ? (
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </Button>
                                            
                                            {expandedWordIndex === index && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="mt-3 pt-3 border-t border-dashed"
                                                >
                                                    {/* Word details when expanded */}
                                                    <div className="space-y-4">
                                                        {/* Phonemes */}
                                                        {word.phonemes && word.phonemes.length > 0 && (
                                                            <div>
                                                                <p className="text-xs font-medium mb-2">Phonemes:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {word.phonemes.map((phoneme: any, pi: number) => (
                                                                        <div 
                                                                            key={`${phoneme.phoneme}-${pi}`}
                                                                            className={`px-2 py-1 rounded text-xs ${getScoreBgColor(phoneme.accuracyScore)}`}
                                                                        >
                                                                            {phoneme.phoneme}: {phoneme.accuracyScore}%
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Syllables if available */}
                                                        {word.syllables && word.syllables.length > 0 && (
                                                            <div>
                                                                <p className="text-xs font-medium mb-2">Syllables:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {word.syllables.map((syllable: any, si: number) => (
                                                                        <div 
                                                                            key={`${syllable.syllable}-${si}`}
                                                                            className={`px-2 py-1 rounded text-xs ${getScoreBgColor(syllable.accuracyScore)}`}
                                                                        >
                                                                            <span className="font-medium">{syllable.grapheme}</span>
                                                                            {' '}
                                                                            <span className="opacity-70">({syllable.syllable})</span>
                                                                            : {syllable.accuracyScore}%
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Prosody feedback if available */}
                                                        {word.prosodyFeedback && (
                                                            <div>
                                                                <p className="text-xs font-medium mb-2">Prosody Feedback:</p>
                                                                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md text-xs">
                                                                    {word.prosodyFeedback.breakFeedback && word.prosodyFeedback.breakFeedback.breakLength > 0 && (
                                                                        <div className="flex items-center gap-1 mb-1">
                                                                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                                                            {word.prosodyFeedback.breakFeedback.unexpectedBreak?.confidence > 0.5 ? 
                                                                                "You paused unexpectedly before/after this word" : 
                                                                                "There's a short pause near this word"
                                                                            }
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {word.prosodyFeedback.intonationFeedback?.monotone?.syllablePitchDeltaConfidence > 0.5 && (
                                                                        <div className="flex items-center gap-1">
                                                                            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                                                                            Try using more varied pitch when saying this word
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        
                        {/* Tips/Feedback Tab */}
                        <TabsContent value="tips">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                <h3 className="text-lg font-medium mb-4 text-blue-700 dark:text-blue-300">Improvement Tips</h3>
                                
                                <div className="space-y-4">
                                    {problemWord && problemWord.accuracyScore < 70 && (
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                                            <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                                Focus on this problematic word:
                                            </h4>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-bold">{problemWord.word}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs ${getScoreBgColor(problemWord.accuracyScore)}`}>
                                                    {problemWord.accuracyScore}%
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Try breaking this word into syllables and practicing each part separately
                                            </p>
                                        </div>
                                    )}
                                    
                                    {results?.words?.some((word: any) => 
                                        word.prosodyFeedback?.intonationFeedback?.monotone?.syllablePitchDeltaConfidence > 0.5
                                    ) && (
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                                            <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                                                <Music className="h-4 w-4 text-amber-500" />
                                                Improve your intonation:
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Your speech sounds a bit monotone. Try varying your pitch more - 
                                                raise your voice slightly at the end of questions, and lower it 
                                                at the end of statements.
                                            </p>
                                        </div>
                                    )}
                                    
                                    {results?.words?.some((word: any) => 
                                        word.prosodyFeedback?.breakFeedback?.unexpectedBreak?.confidence > 0.5
                                    ) && (
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                                            <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                                                <Music className="h-4 w-4 text-blue-500" />
                                                Work on speech flow:
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Your speech has some unexpected pauses. Practice speaking with smoother 
                                                transitions between words. Read aloud for 5-10 minutes daily to improve fluency.
                                            </p>
                                        </div>
                                    )}
                                    
                                    {problemPhonemes.length > 0 && (
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                                            <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                                                <PenTool className="h-4 w-4 text-purple-500" />
                                                Practice these specific sounds:
                                            </h4>
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {problemPhonemes.slice(0, 5).map((phoneme: any, i: number) => (
                                                    <div 
                                                        key={i}
                                                        className={`px-2 py-1 rounded text-xs ${getScoreBgColor(phoneme.accuracyScore)}`}
                                                    >
                                                        {phoneme.phoneme}: {phoneme.accuracyScore}%
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Look up videos that demonstrate how to correctly position your mouth, tongue, and 
                                                lips to produce these specific sounds.
                                            </p>
                                        </div>
                                    )}
                                    
                                    {(!problemWord || problemWord.accuracyScore >= 70) && 
                                    !results?.words?.some((word: any) => 
                                        word.prosodyFeedback?.intonationFeedback?.monotone?.syllablePitchDeltaConfidence > 0.5 ||
                                        word.prosodyFeedback?.breakFeedback?.unexpectedBreak?.confidence > 0.5
                                    ) && 
                                    problemPhonemes.length === 0 && (
                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                                            <h4 className="text-sm font-medium mb-1 text-green-600 dark:text-green-400">
                                                Great job!
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Your pronunciation is very good. Keep practicing to maintain this level.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </motion.div>
    );
}