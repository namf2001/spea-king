"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import Link from "next/link"
import { SpeechFallback } from "@/components/speech-fallback"
import { scenarios } from "./data/scenarios"
import { ScenarioTabs } from "./components/scenario-tabs"
import { ConversationDisplay } from "./components/conversation-display"
import { ConversationControls } from "./components/conversation-controls"
import { generateConversationResponse } from "@/app/actions/speech"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { ReplayButton } from "@/components/replay-button"
import { toast } from "sonner"

interface Message {
    role: "user" | "assistant"
    content: string
}

export default function ConversationPage() {
  const [activeScenario, setActiveScenario] = useState(scenarios[0])
  const [conversation, setConversation] = useState<Message[]>(activeScenario.conversation)
  const [isListening, setIsListening] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null)
  const [audioVisualizerEnabled, setAudioVisualizerEnabled] = useState(true)
  const {
    startRecognition,
    stopRecognition,
    recognizedText,
    isRecognizing,
    error: recognitionError,
  } = useSpeechRecognition()
  const { speak, isSpeaking, error: synthesisError } = useSpeechSynthesis()
  const {
    isRecording,
    audioUrl,
    startRecording,
    stopRecording,
    playRecording,
    getAudioData,
    error: recordingError,
  } = useAudioRecorder()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Check for errors and enable fallback if needed
  useEffect(() => {
    if (recognitionError || synthesisError) {
      setUseFallback(true)
      toast.error("Speech Service Error", {
        description: "Using text input as a fallback. Check your internet connection.",
      })
    }
  }, [recognitionError, synthesisError, toast])

  useEffect(() => {
    if (recordingError) {
      toast.error("Recording Error", {
        description: recordingError,
      })
      setAudioVisualizerEnabled(false)
    }
  }, [recordingError, toast])

  useEffect(() => {
    // Reset conversation when scenario changes
    setConversation(activeScenario.conversation)
  }, [activeScenario])

  useEffect(() => {
    // Scroll to bottom when conversation updates
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [conversation])

  useEffect(() => {
    if (recognizedText && !isListening) {
      // Store the user message for replay
      setLastUserMessage(recognizedText)

      // Add user message to conversation
      const updatedConversation = [...conversation, { role: "user" as const, content: recognizedText }]
      setConversation(updatedConversation)

      // Generate AI response after a short delay
      setTimeout(() => {
        handleGenerateResponse(recognizedText)
      }, 1000)
    }
  }, [recognizedText, isListening])

  const handleStartListening = async () => {
    setIsListening(true)
    try {
      // Start speech recognition
      await startRecognition()

      // Try to start audio recording for visualization and replay
      try {
        await startRecording()
      } catch (err) {
        console.error("Failed to start audio recording:", err)
        setAudioVisualizerEnabled(false)
        // Don't show error toast here, just disable the visualizer
        // We can still continue with speech recognition
      }
    } catch (err) {
      setIsListening(false)
      setUseFallback(true)
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to start speech recognition. Using text input instead.",
      })
    }
  }

  const handleStopListening = () => {
    setIsListening(false)
    stopRecognition()

    // Try to stop recording, but don't fail if it errors
    try {
      stopRecording()
    } catch (err) {
      console.error("Error stopping recording:", err)
    }
  }

  const handleScenarioChange = (scenarioId: string) => {
    const newScenario = scenarios.find((s) => s.id === scenarioId) || scenarios[0]
    setActiveScenario(newScenario)
    setLastUserMessage(null)
  }

  const handleResetConversation = () => {
    setConversation(activeScenario.conversation)
    setLastUserMessage(null)
    toast.success("Conversation Reset", {
      description: "Starting a new conversation for this scenario.",
    })
  }

  const handleFallbackSubmit = (text: string) => {
    // Store the user message for display
    setLastUserMessage(text)

    // Add user message to conversation
    const updatedConversation = [...conversation, { role: "user" as const, content: text }]
    setConversation(updatedConversation)

    // Generate AI response after a short delay
    setTimeout(() => {
      handleGenerateResponse(text)
    }, 1000)
  }

  const handleRepeatLast = async () => {
    if (conversation.length > 1) {
      try {
        await speak(conversation[conversation.length - 1].content)
      } catch (err) {
        setUseFallback(true)
        toast.error("Speech Synthesis Error", {
          description: err instanceof Error ? err.message : "Unable to play audio. Text will be displayed instead.",
        })
      }
    }
  }

  const handleReplayRecording = () => {
    if (audioUrl) {
      try {
        playRecording()
      } catch (err) {
        console.error("Error playing recording:", err)
        toast.error("Replay Error", {
          description: "Failed to play recording",
        })
      }
    } else {
      toast.error("Replay Error", {
        description: "No recording available to replay",
      })
    }
  }

  // Safe wrapper for getAudioData to prevent errors from propagating
  const safeGetAudioData = () => {
    if (!audioVisualizerEnabled) return null

    try {
      return getAudioData()
    } catch (err) {
      console.error("Error getting audio data:", err)
      setAudioVisualizerEnabled(false)
      return null
    }
  }

  const handleGenerateResponse = async (userInput: string) => {
    // Use the Server Action to generate a response
    const result = await generateConversationResponse(userInput, activeScenario.id)

    if (result.success && result.response) {
      // Add AI response to conversation
      const updatedConversation = [...conversation, { role: "assistant" as const, content: result.response }]
      setConversation(updatedConversation)

      // Speak the response if not using fallback
      if (!useFallback) {
        try {
          await speak(result.response)
        } catch (err) {
          setUseFallback(true)
          toast.error("Speech Synthesis Error", {
            description: err instanceof Error ? err.message : "Unable to play audio. Text will be displayed instead.",
          })
        }
      }
    } else {
      toast.error("Response Generation Error", {
        description: result.error || "Failed to generate response",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Conversation Practice</h1>
          <p className="text-gray-600 dark:text-gray-300">Practice your English in realistic conversation scenarios</p>
        </div>

        <ScenarioTabs scenarios={scenarios} activeScenario={activeScenario} onScenarioChange={handleScenarioChange} />

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Conversation</CardTitle>
              <Button variant="outline" size="sm" onClick={handleResetConversation} className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ConversationDisplay conversation={conversation} isListening={isListening} scrollAreaRef={scrollAreaRef as React.RefObject<HTMLDivElement>} />

            {isListening && !useFallback && audioVisualizerEnabled && (
              <div className="mt-4">
                <AudioVisualizer
                  getAudioData={safeGetAudioData}
                  isActive={isListening}
                  height={60}
                  barColor="#3b82f6"
                  backgroundColor="#f8fafc"
                />
              </div>
            )}

            {audioUrl && lastUserMessage && (
              <div className="flex justify-end mt-4">
                <ReplayButton onReplay={handleReplayRecording} disabled={isSpeaking || isListening} />
              </div>
            )}
          </CardContent>
          <CardFooter>
            {useFallback ? (
              <div className="w-full">
                <SpeechFallback onTextSubmit={handleFallbackSubmit} type="recognition" />
              </div>
            ) : (
              <ConversationControls
                isListening={isListening}
                isSpeaking={isSpeaking}
                isRecognizing={isRecognizing}
                hasConversation={conversation.length > 1}
                onStartListening={handleStartListening}
                onStopListening={handleStopListening}
                onRepeatLast={handleRepeatLast}
                getAudioData={audioVisualizerEnabled ? safeGetAudioData : undefined}
              />
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
