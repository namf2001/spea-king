"use client"

import { VoiceResponsiveButton } from "@/components/voice-responsive-button"
import { Mic, Volume2 } from "lucide-react"

interface ConversationControlsProps {
    readonly isListening: boolean
    readonly isSpeaking: boolean
    readonly isRecognizing: boolean
    readonly hasConversation: boolean
    readonly onStartListening: () => Promise<void>
    readonly onStopListening: () => void
    readonly onRepeatLast: () => Promise<void>
    readonly getAudioData?: () => Uint8Array | null
}

export function ConversationControls({
    isListening,
    isSpeaking,
    isRecognizing,
    hasConversation,
    onStartListening,
    onStopListening,
    onRepeatLast,
    getAudioData,
}: ConversationControlsProps) {
    return (
        <div className="w-full flex justify-center gap-4">
            {isListening ? (
                <VoiceResponsiveButton
                    onClick={onStopListening}
                    variant="destructive"
                    isListening={isListening}
                    getAudioData={getAudioData}
                >
                    Stop Recording
                </VoiceResponsiveButton>
            ) : (
                <VoiceResponsiveButton
                    onClick={onStartListening}
                    variant="default"
                    disabled={isRecognizing || isSpeaking}
                    icon={<Mic className="h-4 w-4" />}
                >
                    {isRecognizing ? "Listening..." : "Speak Now"}
                </VoiceResponsiveButton>
            )}

            {hasConversation && (
                <VoiceResponsiveButton
                    onClick={onRepeatLast}
                    variant="outline"
                    disabled={isSpeaking}
                    icon={<Volume2 className="h-4 w-4" />}
                >
                    Repeat Last
                </VoiceResponsiveButton>
            )}
        </div>
    )
}
