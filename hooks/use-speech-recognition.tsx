"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk"
import { getSpeechToken } from "@/app/actions/speech"

export function useSpeechRecognition() {
    const [recognizer, setRecognizer] = useState<SpeechSDK.SpeechRecognizer | null>(null)
    const [recognizedText, setRecognizedText] = useState("")
    const [isRecognizing, setIsRecognizing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const accumulatedTextRef = useRef("")

    useEffect(() => {
        // Clean up the recognizer on unmount
        return () => {
            if (recognizer) {
                recognizer.close()
            }
        }
    }, [recognizer])

    const initializeRecognizer = useCallback(async () => {
        try {
            // Check if we're in a browser environment
            if (typeof window === "undefined") {
                throw new Error("Speech recognition is only available in browser environments")
            }

            // Get speech token using Server Action
            const result = await getSpeechToken()

            if (!result.success || !result.token || !result.region) {
                throw new Error(result.error || "Failed to get speech token")
            }

            // Create the speech config with the token
            const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(result.token, result.region)
            speechConfig.speechRecognitionLanguage = "en-US"

            // Create the audio config using the browser's microphone
            const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput()

            // Create the speech recognizer
            const newRecognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig)

            // Set up event handlers
            newRecognizer.recognized = (_, event) => {
                if (event.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                    // Tích lũy văn bản đã nhận diện
                    const newText = event.result.text;
                    
                    // Nếu nhận diện mới có nội dung, thêm vào văn bản đã tích lũy
                    if (newText.trim()) {
                        // Thêm khoảng trắng nếu đã có nội dung trước đó
                        accumulatedTextRef.current = accumulatedTextRef.current 
                            ? accumulatedTextRef.current + " " + newText
                            : newText;
                            
                        // Cập nhật state với văn bản đã tích lũy
                        setRecognizedText(accumulatedTextRef.current);
                    }
                    
                    setIsRecognizing(false);
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

    const startRecognition = useCallback(async () => {
        // Reset accumulated text when starting a new recognition session
        accumulatedTextRef.current = "";
        setRecognizedText("");
        setError(null);

        try {
            let currentRecognizer = recognizer

            if (!currentRecognizer) {
                currentRecognizer = await initializeRecognizer()
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
