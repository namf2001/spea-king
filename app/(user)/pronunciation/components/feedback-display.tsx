import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { CheckCircle2, XCircle, AlertTriangle, Volume2, Info } from "lucide-react"

interface WordAssessment {
    word: string
    score: number
    errorType: string | null
}

interface FocusSoundAssessment {
    sound: string
    accuracyScore: number
}

interface DetailedAssessment {
    pronunciationScore: number
    fluencyScore: number
    completenessScore: number
    words: WordAssessment[]
    focusSound: FocusSoundAssessment
}

interface FeedbackDisplayProps {
    readonly score: number
    readonly feedback: string
    readonly details?: DetailedAssessment
}

const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 dark:text-green-400"
    if (score >= 60) return "text-yellow-500 dark:text-yellow-400"
    return "text-red-500 dark:text-red-400"
}

const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500 dark:bg-green-400"
    if (score >= 60) return "bg-yellow-500 dark:bg-yellow-400"
    return "bg-red-500 dark:bg-red-400"
}

export function FeedbackDisplay({ score, feedback, details }: FeedbackDisplayProps) {
    const feedbackVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    }

    const getScoreEmoji = (score: number) => {
        if (score >= 80) return <CheckCircle2 className="h-5 w-5 text-green-500" />
        if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-500" />
        return <XCircle className="h-5 w-5 text-red-500" />
    }

    return (
        <motion.div 
            className="space-y-6 mt-8"
            initial="hidden"
            animate="visible"
            variants={feedbackVariants}
        >
            <motion.div variants={itemVariants} className="bg-gradient-to-t from-primary/20 to-background rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                        {score}%
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium mb-1">Overall Accuracy Score</h3>
                        <div className="relative h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                            <div 
                                className={`h-full rounded-full ${getProgressColor(score)}`}
                                style={{ width: `${score}%`, transition: 'width 1s ease-in-out' }}
                            />
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        {getScoreEmoji(score)}
                    </div>
                </div>

                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <AlertTitle className="text-blue-700 dark:text-blue-300 font-medium">Feedback</AlertTitle>
                    <AlertDescription className="text-blue-600 dark:text-blue-400">
                        {feedback}
                    </AlertDescription>
                </Alert>
            </motion.div>

            {details && (
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div 
                            variants={itemVariants}
                            className="bg-gradient-to-t from-primary/10 to-background p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                        >
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                                    Pronunciation
                                </div>
                            </h4>
                            <div className="relative h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2">
                                <div 
                                    className="h-full rounded-full bg-purple-500"
                                    style={{ width: `${details.pronunciationScore}%`, transition: 'width 1s ease-in-out' }}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Sound accuracy
                                </p>
                                <p className={`text-sm font-medium ${getScoreColor(details.pronunciationScore)}`}>
                                    {details.pronunciationScore}%
                                </p>
                            </div>
                        </motion.div>
                        <motion.div 
                            variants={itemVariants}
                            className="bg-gradient-to-t from-primary/10 to-background p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                        >
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                Fluency
                            </h4>
                            <div className="relative h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2">
                                <div 
                                    className="h-full rounded-full bg-blue-500"
                                    style={{ width: `${details.fluencyScore}%`, transition: 'width 1s ease-in-out' }}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Speech flow
                                </p>
                                <p className={`text-sm font-medium ${getScoreColor(details.fluencyScore)}`}>
                                    {details.fluencyScore}%
                                </p>
                            </div>
                        </motion.div>
                        <motion.div 
                            variants={itemVariants}
                            className="bg-gradient-to-t from-primary/10 to-background p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                        >
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                </div>
                                Completeness
                            </h4>
                            <div className="relative h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2">
                                <div 
                                    className="h-full rounded-full bg-green-500"
                                    style={{ width: `${details.completenessScore}%`, transition: 'width 1s ease-in-out' }}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Content coverage
                                </p>
                                <p className={`text-sm font-medium ${getScoreColor(details.completenessScore)}`}>
                                    {details.completenessScore.toFixed(2)}%
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div 
                        variants={itemVariants}
                        className="bg-gradient-to-t from-primary/10 to-background p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-indigo-500" />
                            Focus Sound: <span className="text-indigo-600 dark:text-indigo-400 font-bold">'{details.focusSound.sound}'</span>
                        </h4>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="relative h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-1">
                                <div 
                                    className="h-full rounded-full bg-indigo-500"
                                    style={{ width: `${details.focusSound.accuracyScore}%`, transition: 'width 1s ease-in-out' }}
                                />
                            </div>
                            <span className={`text-sm font-medium ${getScoreColor(details.focusSound.accuracyScore)}`}>
                                {details.focusSound.accuracyScore}%
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            This is how accurately you pronounced the focus sound of this exercise.
                        </p>
                    </motion.div>

                    <motion.div 
                        variants={itemVariants}
                        className="bg-gradient-to-t from-primary/10 to-background p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                        <h4 className="text-sm font-medium mb-3">Word-by-Word Assessment</h4>
                        <ScrollArea className="h-[180px] pr-4">
                            <div className="space-y-2">
                                {details.words.map((word, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`p-3 rounded-md border ${
                                            word.errorType 
                                                ? 'bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                                                : 'bg-gradient-to-t from-background to-background/80 border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className={`font-medium ${word.errorType ? 'text-red-600 dark:text-red-400' : ''}`}>
                                                {word.word}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className="relative h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 w-16 sm:w-24">
                                                    <div 
                                                        className={`h-full rounded-full ${
                                                            word.score >= 80 ? 'bg-green-500' : 
                                                            word.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                        style={{ width: `${word.score}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs ${getScoreColor(word.score)}`}>
                                                    {word.score}%
                                                </span>
                                            </div>
                                        </div>
                                        {word.errorType && (
                                            <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                {word.errorType}
                                            </p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </ScrollArea>
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    )
}
