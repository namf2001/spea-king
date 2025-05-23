"use client"

import { useState, useEffect, useCallback } from "react"
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk"
import { getSpeechToken } from "@/app/actions/speech"

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

            // Get speech token using Server Action
            const result = await getSpeechToken()
            
            // Log the speech token result
            console.log("Speech Synthesis Token Result:", {
                action: "getSpeechToken for synthesis",
                success: result.success,
                region: result.data?.region,
                hasToken: !!result.data?.token,
                error: result.error?.message ?? null
            });

            if (!result.success || !result.data?.token || !result.data?.region) {
                throw new Error(result.error?.message ?? "Failed to get speech token")
            }

            // Create the speech config with the token
            const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(result.data.token, result.data.region)
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
