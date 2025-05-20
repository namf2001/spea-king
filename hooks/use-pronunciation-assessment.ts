"use client"

import { useState, useRef, useCallback } from "react"
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk"

export function usePronunciationAssessment() {
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null) // Added ref to store MediaStream separately
  const audioChunksRef = useRef<Blob[]>([])
  const wordsRef = useRef<any[]>([])
  const phonemesRef = useRef<any[]>([])

  // Start recording audio
  const startRecording = async () => {
    try {
      audioChunksRef.current = []
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream // Store stream in separate ref
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.start()
      setError(null)
    } catch (err) {
      console.error("Error starting recording:", err)
      setError("Could not access microphone. Please check permissions.")
    }
  }

  // Stop recording and return the audio blob
  const stopRecording = async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        setError("No recording in progress")
        resolve(null)
        return
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })

        // Stop all tracks using the stored mediaStream reference
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop())
          mediaStreamRef.current = null // Clean up reference
        }

        resolve(audioBlob)
      }

      mediaRecorderRef.current.stop()
    })
  }

  // Assess pronunciation using Microsoft's Speech SDK
  const assessPronunciation = useCallback(async (audioBlob: Blob, referenceText: string) => {
    try {
      setError(null)

      // Convert blob to array buffer for processing
      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioData = new Uint8Array(arrayBuffer)

      // Get subscription key and region from environment variables
      // Note: In a real application, these would be securely stored server-side
      const subscriptionKey = process.env.NEXT_PUBLIC_SPEECH_KEY ?? "YOUR_SPEECH_KEY"
      const region = process.env.NEXT_PUBLIC_SPEECH_REGION ?? "eastus"

      if (subscriptionKey === "YOUR_SPEECH_KEY") {
        setError("Speech service key not configured. Please set the NEXT_PUBLIC_SPEECH_KEY environment variable.")
        return null
      }

      // Create the speech config
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, region)
      speechConfig.speechRecognitionLanguage = "en-US"

      // Create the audio config from the audio data
      const pushStream = SpeechSDK.AudioInputStream.createPushStream()
      // Convert Uint8Array to ArrayBuffer for the pushStream
      pushStream.write(audioData.buffer)
      pushStream.close()
      const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(pushStream)

      // Create pronunciation assessment config
      const pronunciationAssessmentConfig = new SpeechSDK.PronunciationAssessmentConfig(
        referenceText,
        SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
        SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
      )

      // Create speech recognizer with pronunciation assessment
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig)
      pronunciationAssessmentConfig.applyTo(recognizer)

      return new Promise((resolve, reject) => {
        recognizer.recognizeOnceAsync(
          (result) => {
            if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
              try {
                // Log the raw result from Microsoft Speech SDK
                console.log("=== RAW SPEECH RECOGNITION RESULT ===")
                console.log(result)
                console.log("=== RAW JSON RESULT ===")
                console.log(JSON.stringify(result.json, null, 2))

                // Get pronunciation assessment result
                const pronunciationAssessmentResult = SpeechSDK.PronunciationAssessmentResult.fromResult(result)

                // Log the pronunciation assessment result
                console.log("=== PRONUNCIATION ASSESSMENT RESULT ===")
                console.log(pronunciationAssessmentResult)

                // Safely extract word and phoneme data with fallbacks
                // Parse the JSON string to an object if it's a string
                const jsonResult = typeof result.json === 'string' ? JSON.parse(result.json) : result.json
                const nBest = jsonResult?.NBest ?? []
                console.log("=== NBEST DATA ===")
                console.log(nBest)

                // Log detailed word data if available
                if (nBest.length > 0 && nBest[0].Words) {
                  console.log("=== DETAILED WORD DATA ===")
                  console.log(nBest[0].Words)
                  wordsRef.current = nBest[0].Words
                }

                // Log detailed phoneme data if available
                if (nBest.length > 0 && nBest[0].Words) {
                  const phonemeData = nBest[0].Words.flatMap((word: any) => word.Phonemes ?? [])
                  console.log("=== DETAILED PHONEME DATA ===")
                  console.log(phonemeData)
                  phonemesRef.current = phonemeData
                }

                // Process and format the results
                const processedResults = {
                  recognizedText: result.text || "",
                  pronunciationScore: pronunciationAssessmentResult.pronunciationScore || 0,
                  accuracyScore: pronunciationAssessmentResult.accuracyScore || 0,
                  fluencyScore: pronunciationAssessmentResult.fluencyScore || 0,
                  completenessScore: pronunciationAssessmentResult.completenessScore || 0,
                  prosodyScore: 85.5, // Example value (not directly provided by the SDK)
                  durationMs: (result.duration || 0) / 10000, // Convert from 100-nanosecond units to milliseconds
                  words: wordsRef.current,
                  phonemes: phonemesRef.current,
                  referenceText: referenceText,
                  intonationIssues: analyzeIntonation(wordsRef.current),
                  stressPatternIssues: analyzeStressPatterns(wordsRef.current),
                  overallSuggestions: generateOverallSuggestions(
                    pronunciationAssessmentResult.pronunciationScore || 0,
                    wordsRef.current,
                    phonemesRef.current,
                  ),
                  comparisonAnalysis: compareTexts(referenceText, result.text || ""),
                }

                setResults(processedResults)
                resolve(processedResults)
              } catch (err) {
                console.error("Error processing assessment result:", err)
                const errorMessage = `Error processing assessment result: ${err}`
                setError(errorMessage)
                reject(new Error(errorMessage))
              }
            } else {
              const errorMessage = `Recognition failed: ${result.reason}`
              setError(errorMessage)
              reject(new Error(errorMessage))
            }

            recognizer.close()
          },
          (err) => {
            const errorMessage = `Error during recognition: ${err}`
            setError(errorMessage)
            recognizer.close()
            reject(new Error(errorMessage))
          },
        )
      })
    } catch (err) {
      console.error("Error in pronunciation assessment:", err)
      const errorMessage = `Error in pronunciation assessment: ${err}`
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    startRecording,
    stopRecording,
    assessPronunciation,
    results,
    error,
  }
}

// Helper functions for error types and suggestions
function getErrorType(errorCode: number | undefined): string {
  if (!errorCode) return "None"

  const errorTypes: Record<number, string> = {
    0: "None",
    1: "Mispronunciation",
    2: "Omission",
    3: "Insertion",
  }

  return errorTypes[errorCode] || "Unknown"
}

function getSuggestion(word: string, errorCode: number | undefined): string {
  if (!errorCode || errorCode === 0) return ""

  // This is a simplified example - in a real app, you would have more sophisticated suggestions
  const commonSuggestions: Record<string, string> = {
    the: "Try pronouncing 'the' as /ðə/ (soft 'th' sound)",
    hello: "Emphasize the 'h' sound at the beginning",
    world: "Make sure to pronounce the 'r' clearly",
    are: "Pronounce as /ɑr/ not /ɑː/",
    how: "Pronounce as /haʊ/ with clear 'h' sound",
    you: "Pronounce as /juː/ with a clear 'y' sound",
    today: "Emphasize both syllables: to-DAY",
  }

  return commonSuggestions[word.toLowerCase()] || "Focus on clearer articulation"
}

function analyzeIntonation(words: any[]): string[] {
  // This is a simplified analysis - in a real app, you would use more sophisticated analysis
  const issues: string[] = []

  // Check for potential intonation issues based on word scores
  const lowScoreWords = words.filter((word) => word.score < 70)

  if (lowScoreWords.length > 0) {
    issues.push(
      "Your intonation pattern may need improvement, particularly with: " + lowScoreWords.map((w) => w.word).join(", "),
    )
  }

  // Add general intonation advice
  if (words.length > 5) {
    issues.push("Practice varying your pitch for questions and statements")
  }

  return issues
}

function analyzeStressPatterns(words: any[]): string[] {
  // This is a simplified analysis - in a real app, you would use more sophisticated analysis
  const issues: string[] = []

  // Look for multi-syllable words that might have stress issues
  const multiSyllableWords = words.filter((word) => {
    // Simple heuristic: words with more than 5 characters might be multi-syllable
    return word.word.length > 5 && word.score < 75
  })

  if (multiSyllableWords.length > 0) {
    issues.push("Work on word stress patterns, especially in: " + multiSyllableWords.map((w) => w.word).join(", "))
  }

  return issues
}

function generateOverallSuggestions(overallScore: number, words: any[], phonemes: any[]): string[] {
  const suggestions: string[] = []

  // Overall score-based suggestions
  if (overallScore < 60) {
    suggestions.push("Focus on slowing down your speech and pronouncing each word clearly")
    suggestions.push("Practice individual sounds (phonemes) that received low scores")
  } else if (overallScore < 75) {
    suggestions.push("Work on rhythm and stress patterns in multi-syllable words")
    suggestions.push("Pay attention to ending sounds of words, which are often reduced")
  } else if (overallScore < 90) {
    suggestions.push("Fine-tune your pronunciation by focusing on the subtle sounds")
    suggestions.push("Practice connected speech and natural intonation patterns")
  }

  // Word-specific suggestions
  const problematicWords = words.filter((word) => word.score < 70).slice(0, 3) // Limit to top 3 problematic words

  if (problematicWords.length > 0) {
    suggestions.push("Practice these specific words: " + problematicWords.map((w) => `"${w.word}"`).join(", "))
  }

  // Phoneme-specific suggestions
  const problematicPhonemes = phonemes.filter((phoneme) => phoneme.score < 70).slice(0, 3) // Limit to top 3 problematic phonemes

  if (problematicPhonemes.length > 0) {
    suggestions.push("Focus on these specific sounds: " + problematicPhonemes.map((p) => `"${p.phoneme}"`).join(", "))
  }

  return suggestions
}

function compareTexts(reference: string, recognized: string): any {
  // Split texts into words
  const referenceWords = reference.toLowerCase().split(/\s+/)
  const recognizedWords = recognized.toLowerCase().split(/\s+/)

  // Find missing and extra words
  const missingWords = referenceWords.filter((word) => !recognizedWords.includes(word))
  const extraWords = recognizedWords.filter((word) => !referenceWords.includes(word))

  // Calculate match percentage
  const matchedWords = referenceWords.filter((word) => recognizedWords.includes(word))
  const matchPercentage = (matchedWords.length / referenceWords.length) * 100

  return {
    missingWords,
    extraWords,
    matchPercentage,
    referenceWordCount: referenceWords.length,
    recognizedWordCount: recognizedWords.length,
  }
}
