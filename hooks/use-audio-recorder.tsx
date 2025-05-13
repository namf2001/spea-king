"use client"

import { useState, useEffect, useRef } from "react"

interface AudioRecorderState {
    isRecording: boolean
    audioBlob: Blob | null
    audioUrl: string | null
    error: string | null
}

export function useAudioRecorder() {
    const [state, setState] = useState<AudioRecorderState>({
        isRecording: false,
        audioBlob: null,
        audioUrl: null,
        error: null,
    })

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const streamRef = useRef<MediaStream | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const dataArrayRef = useRef<Uint8Array | null>(null)
    const isAudioContextActiveRef = useRef<boolean>(false)

    // Cleanup function
    useEffect(() => {
        return () => {
            cleanupResources()
        }
    }, [])

    // Function to safely clean up all audio resources
    const cleanupResources = async () => {
        if (mediaRecorderRef.current && state.isRecording) {
            try {
                mediaRecorderRef.current.stop()
            } catch (err) {
                console.error("Error stopping MediaRecorder:", err)
            }
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
        }

        if (audioContextRef.current && isAudioContextActiveRef.current) {
            try {
                if (audioContextRef.current.state !== "closed") {
                    await audioContextRef.current.close()
                }
            } catch (err) {
                console.error("Error closing AudioContext:", err)
            }
            isAudioContextActiveRef.current = false
        }

        // Revoke object URL if it exists
        if (state.audioUrl) {
            URL.revokeObjectURL(state.audioUrl)
        }

        // Clear references
        analyserRef.current = null
        dataArrayRef.current = null
        mediaRecorderRef.current = null
    }

    const startRecording = async () => {
        try {
            // Clean up any existing resources first
            await cleanupResources()

            // Reset state
            audioChunksRef.current = []

            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream

            // Set up audio context for visualization
            let audioContext: AudioContext

            try {
                audioContext = new AudioContext()
                audioContextRef.current = audioContext
                isAudioContextActiveRef.current = true
            } catch (err) {
                console.error("Failed to create AudioContext:", err)
                throw new Error("Failed to initialize audio processing")
            }

            // Create audio processing pipeline
            try {
                const source = audioContext.createMediaStreamSource(stream)
                const analyser = audioContext.createAnalyser()
                analyserRef.current = analyser
                analyser.fftSize = 256
                source.connect(analyser)

                const bufferLength = analyser.frequencyBinCount
                const dataArray = new Uint8Array(bufferLength)
                dataArrayRef.current = dataArray
            } catch (err) {
                console.error("Failed to set up audio processing:", err)
                throw new Error("Failed to initialize audio visualization")
            }

            // Create media recorder
            try {
                if (!("MediaRecorder" in window)) {
                    throw new Error("Recording not supported in this browser")
                }
                const mimeType =
                    MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                        ? "audio/webm;codecs=opus"
                        : "audio/mp4"
                const mediaRecorder = new MediaRecorder(stream, { mimeType })
                mediaRecorderRef.current = mediaRecorder

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data)
                    }
                }

                mediaRecorder.onstop = () => {
                    if (audioChunksRef.current.length === 0) {
                        setState((prev) => ({
                            ...prev,
                            isRecording: false,
                        }))
                        return
                    }

                    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
                    const audioUrl = URL.createObjectURL(audioBlob)

                    setState((prev) => ({
                        ...prev,
                        isRecording: false,
                        audioBlob,
                        audioUrl,
                    }))
                }

                // Start recording
                mediaRecorder.start()

                setState((prev) => ({
                    ...prev,
                    isRecording: true,
                    audioBlob: null,
                    audioUrl: null,
                    error: null,
                }))
            } catch (err) {
                console.error("Failed to create MediaRecorder:", err)
                throw new Error("Failed to start recording")
            }
        } catch (err) {
            // Clean up any partially initialized resources
            await cleanupResources()

            setState((prev) => ({
                ...prev,
                error: err instanceof Error ? err.message : "Failed to start recording",
            }))
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && state.isRecording) {
            try {
                mediaRecorderRef.current.stop()
            } catch (err) {
                console.error("Error stopping MediaRecorder:", err)
            }
        }

        // Stop the media tracks but keep the AudioContext for visualization
        // until we're completely done with the recording
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
        }
        if (audioContextRef.current && isAudioContextActiveRef.current) {
            audioContextRef.current.close().catch(() => { })
            isAudioContextActiveRef.current = false
        }
    }

    const getAudioData = () => {
        if (analyserRef.current && dataArrayRef.current && isAudioContextActiveRef.current) {
            try {
                analyserRef.current.getByteFrequencyData(dataArrayRef.current)
                return dataArrayRef.current
            } catch (err) {
                console.error("Error getting audio data:", err)
                return null
            }
        }
        return null
    }

    const playRecording = () => {
        if (state.audioUrl) {
            const audio = new Audio(state.audioUrl)
            audio.play().catch((err) => {
                console.error("Error playing audio:", err)
                setState((prev) => ({
                    ...prev,
                    error: "Failed to play recording",
                }))
            })
        }
    }

    return {
        isRecording: state.isRecording,
        audioBlob: state.audioBlob,
        audioUrl: state.audioUrl,
        error: state.error,
        startRecording,
        stopRecording,
        playRecording,
        getAudioData,
    }
}
