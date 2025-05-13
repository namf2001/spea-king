"use client"

import { useState, useEffect, useCallback } from "react"
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk"

export function useSpeechRecognition() {
    const [recognizer, setRecognizer] = useState<SpeechSDK.SpeechRecognizer | null>(null)
    const [recognizedText, setRecognizedText] = useState("")
    const [isRecognizing, setIsRecognizing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Clean up the recognizer on unmount
        return () => {
            if (recognizer) {
                recognizer.close()
            }
        }
    }, [recognizer])

    const initializeRecognizer = useCallback(() => {
        try {
            // Check if we're in a browser environment
            if (typeof window === "undefined") {
                throw new Error("Speech recognition is only available in browser environments")
            }

            // Check if the Azure Speech key and region are available
            const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY
            const speechRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION

            if (!speechKey || !speechRegion) {
                throw new Error("Azure Speech credentials are not configured")
            }

            // Create the speech config
            const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion)
            speechConfig.speechRecognitionLanguage = "en-US"

            // Create the audio config using the browser's microphone
            const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput()

            // Create the speech recognizer
            const newRecognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig)

            // Set up event handlers
            newRecognizer.recognized = (_, event) => {
                if (event.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                    // Log the full JSON response
                    console.log('Full Speech Recognition Response:', JSON.stringify(event.result, null, 2))
                    setRecognizedText(event.result.text)
                    setIsRecognizing(false)
                }
            }

            newRecognizer.canceled = (_, event) => {
                if (event.reason === SpeechSDK.CancellationReason.Error) {
                    setError(`Speech recognition error: ${event.errorDetails}`)
                }
                setIsRecognizing(false)
            }

            setRecognizer(newRecognizer)
            return newRecognizer
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to initialize speech recognition")
            return null
        }
    }, [])

    const startRecognition = useCallback(() => {
        setRecognizedText("")
        setError(null)

        try {
            let currentRecognizer = recognizer

            if (!currentRecognizer) {
                currentRecognizer = initializeRecognizer()
                if (!currentRecognizer) return
            }

            setIsRecognizing(true)
            currentRecognizer.startContinuousRecognitionAsync(
                () => {
                    // Started successfully
                },
                (err) => {
                    setError(`Failed to start recognition: ${err}`)
                    setIsRecognizing(false)
                },
            )
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to start speech recognition")
            setIsRecognizing(false)
        }
    }, [recognizer, initializeRecognizer])

    const stopRecognition = useCallback(() => {
        if (recognizer) {
            recognizer.stopContinuousRecognitionAsync(
                () => {
                    // Stopped successfully
                },
                (err) => {
                    setError(`Failed to stop recognition: ${err}`)
                },
            )
        }
    }, [recognizer])

    return {
        startRecognition,
        stopRecognition,
        recognizedText,
        isRecognizing,
        error,
    }
}
