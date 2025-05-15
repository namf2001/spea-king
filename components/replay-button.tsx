"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Repeat, Loader2 } from "lucide-react"

interface ReplayButtonProps {
    readonly onReplay: () => void
    readonly disabled?: boolean
    readonly label?: string
}

export function ReplayButton({ onReplay, disabled = false, label = "Replay My Voice" }: ReplayButtonProps) {
    const [isPlaying, setIsPlaying] = useState(false)

    const handleReplay = () => {
        setIsPlaying(true)

        try {
            // Create and immediately play silent audio to unlock audio context on mobile
            const silentAudio = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABGwD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwA8MAAAAAAAAAABQgJAi4QAAB4AAABRsgyDfkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sUZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUZCgP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUZEwP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sUZHIP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
            silentAudio.play().catch(err => console.log("Silent audio play failed:", err));

            // Then trigger the actual replay after a short delay
            setTimeout(() => {
                onReplay()
            }, 50);
        } catch (err) {
            console.error("Error in replay handler:", err);
            onReplay()
        }

        // Reset playing state after a short delay
        setTimeout(() => {
            setIsPlaying(false)
        }, 2000) // Assuming most recordings are short
    }

    return (
        <Button
            onClick={handleReplay}
            variant="ghost"
            size="sm"
            disabled={disabled || isPlaying}
            className="flex items-center gap-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-900"
        >
            {isPlaying ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Playing...</span>
                </>
            ) : (
                <>
                    <Repeat className="h-4 w-4" />
                    <span>{label}</span>
                </>
            )}
        </Button>
    )
}
