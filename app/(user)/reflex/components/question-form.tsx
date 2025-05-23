"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Sparkles, Loader2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { createReflexQuestion, updateReflexQuestion } from "@/app/actions/reflex"
import { suggestUserAnswer } from "@/app/actions/speech"
import { ReflexQuestion } from "@prisma/client"
import { reflexSchema } from "@/schemas/reflex"
interface QuestionFormProps {
    userId: string
    onSuccess: () => void
    onCancel: () => void
    question?: ReflexQuestion
    mode: 'create' | 'edit'
}

export default function QuestionForm({
    userId,
    onSuccess,
    onCancel,
    question,
    mode
}: QuestionFormProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [questionText, setQuestionText] = useState(question?.question || "")
    const [wordLimit, setWordLimit] = useState(75)

    const form = useForm<z.infer<typeof reflexSchema>>({
        resolver: zodResolver(reflexSchema),
        defaultValues: {
            question: question?.question || "",
            answer: question?.answer || "",
        },
    })

    // Function to handle AI-generated answer
    const handleGenerateAnswer = async () => {
        const currentQuestion = form.getValues("question")

        if (!currentQuestion || currentQuestion.length < 5) {
            form.setError("question", {
                type: "manual",
                message: "Please enter a valid question (at least 5 characters)"
            })
            return
        }

        setIsGenerating(true)
        try {
            const response = await suggestUserAnswer(currentQuestion, wordLimit)

            if (response.success && response.data) {
                form.setValue("answer", response.data.response)
            } else {
                setError("Failed to generate an answer. Please try again or write your own.")
            }
        } catch (error) {
            console.error("Error generating answer:", error)
            setError("An error occurred while generating an answer. Please try again.")
        } finally {
            setIsGenerating(false)
        }
    }

    // Validate word limit input
    const handleWordLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            // Keep value between 70-100
            const limitedValue = Math.min(Math.max(value, 70), 100);
            setWordLimit(limitedValue);
        }
    };

    const onSubmit = (values: z.infer<typeof reflexSchema>) => {
        setError("")

        startTransition(async () => {
            try {
                if (mode === 'create') {
                    const response = await createReflexQuestion({
                        question: values.question,
                        answer: values.answer
                    })

                    if (!response.success) {
                        throw new Error(response.error?.message || "Failed to create question")
                    }
                } else if (mode === 'edit' && question) {
                    const response = await updateReflexQuestion(question.id, {
                        question: values.question,
                        answer: values.answer
                    })

                    if (!response.success) {
                        throw new Error(response.error?.message || "Failed to update question")
                    }
                }

                onSuccess()
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message)
                } else {
                    setError("An unexpected error occurred")
                }
            }
        })
    }

    return (
        <div className="space-y-4 pt-4">
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="question"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Question</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter a question you want to practice answering"
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setQuestionText(e.target.value);
                                        }}
                                        disabled={isPending || isGenerating}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-3 ">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={handleGenerateAnswer}
                                    disabled={isPending || isGenerating || !questionText.trim()}
                                    title={!questionText.trim() ? "Please enter a question first" : "Generate an answer using AI"}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            <span>Generating {wordLimit}-word answer...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-3 w-3" />
                                            <span>Generate {wordLimit}-word answer with AI</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                            <Slider
                                value={[wordLimit]}
                                min={70}
                                max={100}
                                step={5}
                                onValueChange={(value) => setWordLimit(value[0])}
                                disabled={isPending || isGenerating || !questionText.trim()}
                            />
                        </div>

                    </div>

                    <FormField
                        control={form.control}
                        name="answer"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Answer</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Click 'Generate with AI' or write your own answer"
                                        className="min-h-[150px]"
                                        {...field}
                                        disabled={isPending || isGenerating}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isPending || isGenerating}
                            className="gap-1"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || isGenerating}
                            className="gap-1"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save Question
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}