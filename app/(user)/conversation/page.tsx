"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Mic } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { SpeechFallback } from "@/components/speech-fallback"
import { scenarios } from "./data/scenarios"
import { ScenarioTabs } from "./components/scenario-tabs"
import { ConversationDisplay } from "./components/conversation-display"
import { ConversationControls } from "./components/conversation-controls"
import { generateConversationResponse } from "@/app/actions/speech"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { ReplayButton } from "@/components/replay-button"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { RippleEffect } from "@/components/animations/ripple-effect"

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
  }, [recognitionError, synthesisError])

  useEffect(() => {
    if (recordingError) {
      toast.error("Recording Error", {
        description: recordingError,
      })
      setAudioVisualizerEnabled(false)
    }
  }, [recordingError])

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
    if (recognizedText) {
      const userMessage = { role: "user" as const, content: recognizedText };
      if (isListening) {
        const lastMessage = conversation[conversation.length - 1];
        if (lastMessage && lastMessage.role === "user") {
          const updatedConversation = [...conversation.slice(0, -1), userMessage];
          setConversation(updatedConversation);
        } else {
          setConversation([...conversation, userMessage]);
        }
      } else {
        setLastUserMessage(recognizedText);

        const updatedConversation = [...conversation, userMessage];
        setConversation(updatedConversation);

        setTimeout(() => {
          handleGenerateResponse(recognizedText);
        }, 500);
      }
    }
  }, [recognizedText, isListening]);

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

    // Log the response from the server action
    console.log("Server Action Result:", {
      action: "generateConversationResponse",
      input: {
        userInput,
        scenarioId: activeScenario.id
      },
      result: result,
      success: result.success,
      response: result.response,
      error: result.error
    });

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
        description: result.error ?? "Failed to generate response",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div 
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-primary p-2 rounded-full relative overflow-hidden">
            <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-white relative z-10" />
            <div className="absolute inset-0">
              <RippleEffect color="white" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Conversation Practice</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ScenarioTabs scenarios={scenarios} activeScenario={activeScenario} onScenarioChange={handleScenarioChange} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="mb-6 bg-gradient-to-t from-primary/20 to-background shadow-lg border-2">
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
              <ConversationDisplay
                conversation={conversation}
                isListening={isListening}
                scrollAreaRef={scrollAreaRef as React.RefObject<HTMLDivElement>}
                recognizedText={recognizedText}
              />

              <AnimatePresence>
                {isListening && !useFallback && audioVisualizerEnabled && (
                  <motion.div 
                    className="mt-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AudioVisualizer
                      getAudioData={safeGetAudioData}
                      isActive={isListening}
                      height={60}
                      barColor="#3b82f6"
                      backgroundColor="rgba(248, 250, 252, 0.8)"
                      className="rounded-lg overflow-hidden"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg pointer-events-none"></div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {audioUrl && lastUserMessage && (
                  <motion.div 
                    className="flex justify-end mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ReplayButton onReplay={handleReplayRecording} disabled={isSpeaking || isListening} />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
            <CardFooter>
              <AnimatePresence mode="wait">
                {useFallback ? (
                  <motion.div 
                    className="w-full"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SpeechFallback onTextSubmit={handleFallbackSubmit} type="recognition" />
                  </motion.div>
                ) : (
                  <motion.div 
                    className="w-full"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
