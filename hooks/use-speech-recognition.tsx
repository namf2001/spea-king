"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk"
import { getSpeechToken } from "@/app/actions/speech"

interface SpeechRecognitionState {
    recognizer: SpeechSDK.SpeechRecognizer | null;
    recognizedText: string;
    isRecognizing: boolean;
    error: string | null;
    audioData: Blob | null;
}

export function useSpeechRecognition() {
    const [state, setState] = useState<SpeechRecognitionState>({
        recognizer: null,
        recognizedText: "",
        isRecognizing: false,
        error: null,
        audioData: null
    });
    
    const accumulatedTextRef = useRef("")
    const audioChunksRef = useRef<Blob[]>([])
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    useEffect(() => {
        // Clean up the recognizer and media resources on unmount
        return () => {
            if (state.recognizer) {
                state.recognizer.close()
            }
            stopMediaRecording()
        }
    }, [state.recognizer])

    const stopMediaRecording = useCallback(() => {
        if (mediaRecorderRef.current) {
            try {
                mediaRecorderRef.current.stop()
            } catch (err) {
                console.error("Error stopping MediaRecorder:", err)
            }
            mediaRecorderRef.current = null
        }
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
    }, [])

    const initializeRecognizer = useCallback(async () => {
        try {
            // Check if we're in a browser environment
            if (typeof window === "undefined") {
                throw new Error("Speech recognition is only available in browser environments")
            }

            // Get speech token using Server Action
            const result = await getSpeechToken()
            
            // Log the speech token result
            console.log("Speech Token Result:", {
                action: "getSpeechToken",
                success: result.success,
                region: result.data?.region,
                hasToken: !!result.data?.token,
                error: result.error?.message || null
            });

            if (!result.success || !result.data?.token || !result.data?.region) {
                throw new Error(result.error?.message || "Failed to get speech token")
            }

            // Create the speech config with the token
            const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(result.data.token, result.data.region)
            speechConfig.speechRecognitionLanguage = "en-US"

            // Create the audio config using the browser's microphone
            const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput()

            // Create the speech recognizer
            const newRecognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig)

            // Set up event handlers
            newRecognizer.recognized = (_, event) => {
                if (event.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                    // Accumulate recognized text
                    const newText = event.result.text;
                    
                    if (newText.trim()) {
                        // Add space if there's already content
                        accumulatedTextRef.current = accumulatedTextRef.current 
                            ? accumulatedTextRef.current + " " + newText
                            : newText;
                            
                        // Update state with accumulated text
                        setState(prev => ({
                            ...prev,
                            recognizedText: accumulatedTextRef.current
                        }));
                    }
                    
                    setState(prev => ({
                        ...prev,
                        isRecognizing: false
                    }));
                }
            }

            newRecognizer.canceled = (_, event) => {
                if (event.reason === SpeechSDK.CancellationReason.Error) {
                    setState(prev => ({
                        ...prev,
                        error: `Speech recognition error: ${event.errorDetails}`,
                        isRecognizing: false
                    }));
                } else {
                    setState(prev => ({
                        ...prev,
                        isRecognizing: false
                    }));
                }
            }

            setState(prev => ({
                ...prev,
                recognizer: newRecognizer
            }));
            
            return newRecognizer
        } catch (err) {
            setState(prev => ({
                ...prev,
                error: err instanceof Error ? err.message : "Failed to initialize speech recognition"
            }));
            return null
        }
    }, [])

    const startRecognition = useCallback(async () => {
        // Reset accumulated text when starting a new recognition session
        accumulatedTextRef.current = "";
        audioChunksRef.current = [];
        
        setState(prev => ({
            ...prev,
            recognizedText: "",
            error: null,
            audioData: null
        }));

        try {
            let currentRecognizer = state.recognizer;

            if (!currentRecognizer) {
                currentRecognizer = await initializeRecognizer();
                if (!currentRecognizer) return;
            }

            // Start audio recording for pronunciation assessment
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;
                
                // Set up MediaRecorder to capture audio for assessment
                const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
                    ? 'audio/webm' 
                    : 'audio/mp4';
                
                const mediaRecorder = new MediaRecorder(stream, { mimeType });
                mediaRecorderRef.current = mediaRecorder;
                
                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };
                
                mediaRecorder.onstop = () => {
                    if (audioChunksRef.current.length > 0) {
                        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                        setState(prev => ({
                            ...prev,
                            audioData: audioBlob
                        }));
                    }
                };
                
                mediaRecorder.start();
            } catch (err) {
                console.error("Failed to start audio recording:", err);
                // Continue with recognition even if recording fails
            }

            setState(prev => ({
                ...prev,
                isRecognizing: true
            }));
            
            currentRecognizer.startContinuousRecognitionAsync(
                () => {
                    // Started successfully
                },
                (err) => {
                    setState(prev => ({
                        ...prev,
                        error: `Failed to start recognition: ${err}`,
                        isRecognizing: false
                    }));
                },
            )
        } catch (err) {
            setState(prev => ({
                ...prev,
                error: err instanceof Error ? err.message : "Failed to start speech recognition",
                isRecognizing: false
            }));
        }
    }, [state.recognizer, initializeRecognizer])

    const stopRecognition = useCallback(() => {
        if (state.recognizer) {
            state.recognizer.stopContinuousRecognitionAsync(
                () => {
                    // Stopped successfully
                    // Now stop the media recorder to finalize the audio data
                    stopMediaRecording();
                },
                (err) => {
                    setState(prev => ({
                        ...prev,
                        error: `Failed to stop recognition: ${err}`
                    }));
                    stopMediaRecording();
                },
            )
        } else {
            stopMediaRecording();
        }
    }, [state.recognizer, stopMediaRecording])

    return {
        startRecognition,
        stopRecognition,
        recognizedText: state.recognizedText,
        isRecognizing: state.isRecognizing,
        error: state.error,
        audioData: state.audioData,
    }
}
