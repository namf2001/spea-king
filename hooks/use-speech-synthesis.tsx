"use client"

import { useState, useEffect, useCallback } from "react"
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk"

export function useSpeechSynthesis() {
    const [synthesizer, setSynthesizer] = useState<SpeechSDK.SpeechSynthesizer | null>(null)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Clean up the synthesizer on unmount
        return () => {
            if (synthesizer) {
                synthesizer.close()
            }
        }
    }, [synthesizer])

    const initializeSynthesizer = useCallback(async () => {
        try {
            // Check if we're in a browser environment
            if (typeof window === "undefined") {
                throw new Error("Speech synthesis is only available in browser environments")
            }

            // Fetch speech token from our secure API endpoint
            const response = await fetch("/api/speech/token")
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to get speech token")
            }

            const { token, region } = await response.json()

            if (!token || !region) {
                throw new Error("Invalid speech token response")
            }

            // Create the speech config with the token
            const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region)
            speechConfig.speechSynthesisLanguage = "en-US"
            speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural"

            // Create the audio config for the browser
            const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput()

            // Create the speech synthesizer
            const newSynthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig)

            setSynthesizer(newSynthesizer)
            return newSynthesizer
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to initialize speech synthesis")
            return null
        }
    }, [])

    const speak = useCallback(
        async (text: string) => {
            setError(null)

            try {
                let currentSynthesizer = synthesizer

                if (!currentSynthesizer) {
                    currentSynthesizer = await initializeSynthesizer()
                    if (!currentSynthesizer) return
                }

                setIsSpeaking(true)

                currentSynthesizer.speakTextAsync(
                    text,
                    (result) => {
                        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                            setIsSpeaking(false)
                        } else {
                            setError(`Speech synthesis failed: ${result.errorDetails}`)
                            setIsSpeaking(false)
                        }
                    },
                    (err) => {
                        setError(`Speech synthesis error: ${err}`)
                        setIsSpeaking(false)
                    },
                )
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to synthesize speech")
                setIsSpeaking(false)
            }
        },
        [synthesizer, initializeSynthesizer],
    )

    return {
        speak,
        isSpeaking,
        error,
    }
}
