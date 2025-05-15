"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk"
import { getSpeechToken } from "@/app/actions/speech"

export function useSpeechSynthesis() {
    const [synthesizer, setSynthesizer] = useState<SpeechSDK.SpeechSynthesizer | null>(null)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const hasUnlockedAudioRef = useRef(false)

    // Function to unlock audio on mobile - needed for iOS and some Android browsers
    const unlockAudioContext = useCallback(() => {
        if (hasUnlockedAudioRef.current) return
        
        try {
            // Create a new AudioContext if it doesn't exist
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
            }
            
            // Check if we need to resume the audio context (suspended state on mobile)
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume()
            }
            
            // Create and play a silent buffer to unlock audio
            const buffer = audioContextRef.current.createBuffer(1, 1, 22050)
            const source = audioContextRef.current.createBufferSource()
            source.buffer = buffer
            source.connect(audioContextRef.current.destination)
            source.start(0)
            
            // Mark as unlocked
            hasUnlockedAudioRef.current = true
            console.log("Audio context unlocked for mobile playback")
        } catch (err) {
            console.error("Failed to unlock audio context:", err)
        }
    }, [])

    useEffect(() => {
        // Clean up the synthesizer on unmount
        return () => {
            if (synthesizer) {
                synthesizer.close()
            }
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(() => {})
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
                region: result.region,
                hasToken: !!result.token,
                error: result.error || null
            });

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
                // First unlock audio context - critical for mobile devices
                unlockAudioContext()
                
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
        [synthesizer, initializeSynthesizer, unlockAudioContext],
    )

    return {
        speak,
        isSpeaking,
        error,
    }
}
