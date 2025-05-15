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
    // Handler for repeat button to play silent audio first
    const handleRepeatLast = async () => {
        try {
            // Create and immediately play silent audio to unlock audio context on mobile
            const silentAudio = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABGwD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwA8MAAAAAAAAAABQgJAi4QAAB4AAABRsgyDfkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sUZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUZCgP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUZEwP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUZHIP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
            silentAudio.play().catch(err => console.log("Silent audio play failed:", err));
            
            // Then play the actual speech
            setTimeout(() => {
                onRepeatLast();
            }, 50);
        } catch (err) {
            console.error("Error in repeat last handler:", err);
            onRepeatLast();
        }
    };

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
                    onClick={handleRepeatLast}
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
