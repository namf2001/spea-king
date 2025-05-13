"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import Link from "next/link"
import { SpeechFallback } from "@/components/speech-fallback"
import { scenarios } from "./data/scenarios"
import { ScenarioTabs } from "./components/scenario-tabs"
import { ConversationDisplay } from "./components/conversation-display"
import { ConversationControls } from "./components/conversation-controls"
import { generateConversationResponse } from "@/app/actions/speech"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function ConversationPage() {
  const [activeScenario, setActiveScenario] = useState(scenarios[0])
  const [conversation, setConversation] = useState<Message[]>(activeScenario.conversation)
  const [isListening, setIsListening] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const {
    startRecognition,
    stopRecognition,
    recognizedText,
    isRecognizing,
    error: recognitionError,
  } = useSpeechRecognition()
  const { speak, isSpeaking, error: synthesisError } = useSpeechSynthesis()
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
      await startRecognition()
    } catch (error) {
      setIsListening(false)
      setUseFallback(true)
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to start speech recognition. Using text input instead.",
      })
    }
  }

  const handleStopListening = () => {
    setIsListening(false)
    stopRecognition()
  }

  const handleScenarioChange = (scenarioId: string) => {
    const newScenario = scenarios.find((s) => s.id === scenarioId) || scenarios[0]
    setActiveScenario(newScenario)
  }

  const handleResetConversation = () => {
    setConversation(activeScenario.conversation)
    toast.success("Conversation Reset", {
      description: "Starting a new conversation for this scenario.",
    })
  }

  const handleFallbackSubmit = (text: string) => {
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
      } catch (error) {
        setUseFallback(true)
        toast.error("Speech Synthesis Error", {
          description: error instanceof Error ? error.message : "Unable to play audio. Text will be displayed instead.",
        })
      }
    }
  }

  const handleGenerateResponse = async (userInput: string) => {
    try {
      const result = await generateConversationResponse(userInput, activeScenario.id)

      if (result.success && result.response) {
        const updatedConversation = [...conversation, { role: "assistant" as const, content: result.response }]
        setConversation(updatedConversation)

        if (!useFallback) {
          try {
            await speak(result.response)
          } catch (error) {
            setUseFallback(true)
            toast.error("Speech Synthesis Error", {
              description: error instanceof Error ? error.message : "Unable to play audio. Text will be displayed instead.",
            })
          }
        }
      } else {
        toast.error("Response Generation Error", {
          description: result.error ?? "Failed to generate response",
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to generate response",
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
              />
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
