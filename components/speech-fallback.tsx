"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SpeechFallbackProps {
    readonly onTextSubmit: (text: string) => void
    readonly type: "recognition" | "synthesis"
}

export function SpeechFallback({ onTextSubmit, type }: SpeechFallbackProps) {
    const [text, setText] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (text.trim()) {
            onTextSubmit(text)
            setText("")
        }
    }

    return (
        <div className="space-y-4">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Speech Service Unavailable</AlertTitle>
                <AlertDescription>
                    {type === "recognition"
                        ? "Speech recognition is currently unavailable. Please type your response instead."
                        : "Text-to-speech is currently unavailable. The text will be displayed instead."}
                </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={type === "recognition" ? "Type what you would say..." : "Text to be spoken"}
                    className="flex-1"
                />
                <Button type="submit">Submit</Button>
            </form>
        </div>
    )
}
