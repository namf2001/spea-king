"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, CheckCircle, Loader2 } from "lucide-react"
import { z } from "zod"
import { nanoid } from "nanoid"
import { lessonSchema } from "@/schemas/pronunciation"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { createPronunciationLesson } from "@/app/actions/pronunciation"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type FormValues = z.infer<typeof lessonSchema>

export default function AddLessonForm({ userId, onCancel, onSuccess }: {
    userId: string,
    onCancel: () => void,
    onSuccess?: () => void
}) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form with default values
    const form = useForm<FormValues>({
        resolver: zodResolver(lessonSchema),
        defaultValues: {
            title: "",
            words: [{ id: nanoid(), word: "" }]
        }
    })

    // Function to add a new word field
    const addWord = () => {
        const currentWords = form.getValues("words") || []
        form.setValue("words", [...currentWords, { id: nanoid(), word: "" }], {
            shouldValidate: true
        })
    }

    // Function to remove a word field
    const removeWord = (id: string) => {
        const currentWords = form.getValues("words") || []
        if (currentWords.length <= 1) return // Always keep at least one word

        form.setValue("words",
            currentWords.filter(word => word.id !== id),
            { shouldValidate: true }
        )
    }

    // Handle form submission
    const onSubmit = async (data: FormValues) => {
        try {
            setIsSubmitting(true);
            const response = await createPronunciationLesson(userId, data);

            if (response.success) {
                toast.success(response.message, {
                    description: "Redirecting to lessons page..."
                });

                // Reset the form
                form.reset();

                // Call onSuccess callback if provided
                if (onSuccess) {
                    onSuccess();
                }

                // Refresh the page data to show the new lesson
                router.refresh();
            } else {
                toast.error("Failed to create lesson", {
                    description: response.error || "An unknown error occurred"
                });
            }
        } catch (error) {
            toast.error("Error creating lesson", {
                description: error instanceof Error ? error.message : "An unknown error occurred"
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Lesson Title</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., 'Challenging Vowel Sounds'"
                                    {...field}
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <FormLabel>Words</FormLabel>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={addWord}
                            disabled={isSubmitting}
                        >
                            <Plus className="h-4 w-4 mr-1" /> Add Word
                        </Button>
                    </div>

                    {form.formState.errors.words?.message && (
                        <p className="text-sm text-destructive">
                            {form.formState.errors.words.message}
                        </p>
                    )}

                    {form.watch("words")?.map((wordItem, index) => (
                        <div key={wordItem.id} className="flex gap-2 items-start">
                            <FormField
                                control={form.control}
                                name={`words.${index}.word`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input
                                                placeholder="Enter a word"
                                                {...field}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeWord(wordItem.id)}
                                disabled={(form.watch("words")?.length || 0) <= 1 || isSubmitting}
                                className="mt-0.5"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Add Lesson
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    )
}