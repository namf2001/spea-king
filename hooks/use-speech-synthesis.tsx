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

    const initializeSynthesizer = useCallback(() => {
        try {
            // Check if we're in a browser environment
            if (typeof window === "undefined") {
                throw new Error("Speech synthesis is only available in browser environments")
            }

            // Check if the Azure Speech key and region are available
            const speechKey = process.env.AZURE_SPEECH_KEY
            const speechRegion = process.env.AZURE_SPEECH_REGION

            if (!speechKey || !speechRegion) {
                throw new Error("Azure Speech credentials are not configured")
            }

            // Create the speech config
            const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion)
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
        (text: string) => {
            setError(null)

            try {
                let currentSynthesizer = synthesizer

                if (!currentSynthesizer) {
                    currentSynthesizer = initializeSynthesizer()
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
