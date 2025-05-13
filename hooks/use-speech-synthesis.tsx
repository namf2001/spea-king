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

            if (!result.success || !result.token || !result.region) {
                throw new Error(result.error || "Failed to get speech token")
            }

            // Create the speech config with the token
            const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(result.token, result.region)
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
