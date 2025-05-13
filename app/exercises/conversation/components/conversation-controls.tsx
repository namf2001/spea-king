"use client"

import { Button } from "@/components/ui/button"
import { Mic, Volume2 } from "lucide-react"

interface ConversationControlsProps {
    readonly isListening: boolean
    readonly isSpeaking: boolean
    readonly isRecognizing: boolean
    readonly hasConversation: boolean
    readonly onStartListening: () => Promise<void>
    readonly onStopListening: () => void
    readonly onRepeatLast: () => Promise<void>
}

export function ConversationControls({
    isListening,
    isSpeaking,
    isRecognizing,
    hasConversation,
    onStartListening,
    onStopListening,
    onRepeatLast,
}: ConversationControlsProps) {
    return (
        <div className="w-full flex justify-center gap-4">
            {isListening ? (
                <Button onClick={onStopListening} variant="destructive" className="flex items-center gap-2">
                    Stop Recording
                </Button>
            ) : (
                <Button
                    onClick={onStartListening}
                    variant="default"
                    className="flex items-center gap-2"
                    disabled={isRecognizing || isSpeaking}
                >
                    <Mic className="h-4 w-4" />
                    {isRecognizing ? "Listening..." : "Speak Now"}
                </Button>
            )}

            {hasConversation && (
                <Button onClick={onRepeatLast} variant="outline" className="flex items-center gap-2" disabled={isSpeaking}>
                    <Volume2 className="h-4 w-4" />
                    Repeat Last
                </Button>
            )}
        </div>
    )
}
