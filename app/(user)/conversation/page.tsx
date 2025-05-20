"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Mic, ListPlus } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { SpeechFallback } from "@/components/speech-fallback"
import { defaultTopics } from "./data/topics"
import { TopicTabs } from "./components/topic-tabs"
import { ConversationDisplay } from "./components/conversation-display"
import { ConversationControls } from "./components/conversation-controls"
import { generateConversationResponse, initializeConversation } from "@/app/actions/speech"
import { getConversationTopicById } from "@/app/actions/conversation"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface Topic {
  id: string
  title: string
  description: string
}

// Helper function for adding custom topic to state
const addCustomTopicToList = (
  prevTopics: Topic[], 
  customTopic: Topic
): Topic[] => {
  const exists = prevTopics.some(t => t.id === customTopic.id);
  return exists ? prevTopics : [...prevTopics, customTopic];
};

export default function ConversationPage() {
  const [topics, setTopics] = useState<Topic[]>(defaultTopics)
  const [activeTopic, setActiveTopic] = useState<Topic>(defaultTopics[0])
  const [conversation, setConversation] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const [audioVisualizerEnabled, setAudioVisualizerEnabled] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
  // Trạng thái để biết khi nào đang chờ AI trả lời
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  // Thêm state mới để theo dõi khi nào nên reset UI về trạng thái nút microphone
  const [resetUIState, setResetUIState] = useState(false)
  const searchParams = useSearchParams()
  
  const {
    startRecognition,
    stopRecognition,
    recognizedText,
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

  // Load custom topic if specified in URL
  useEffect(() => {
    const topicId = searchParams.get('topic');
    
    if (topicId && !defaultTopics.some(t => t.id === topicId)) {
      const loadCustomTopic = async () => {
        try {
          const response = await getConversationTopicById(topicId);
          
          if (response.success && response.data) {
            // Convert the DB topic to the expected format
            const customTopic: Topic = {
              id: response.data.id,
              title: response.data.title,
              description: response.data.description || "" // Provide default empty string if null
            };
            
            // Add to topics if not already included
            setTopics(prev => addCustomTopicToList(prev, customTopic));
            
            // Set as active topic
            setActiveTopic(customTopic);
          } else {
            toast.error("Failed to load topic", {
              description: response.error || "Topic not found"
            });
          }
        } catch (err) {
          toast.error("Error loading topic", {
            description: err instanceof Error ? err.message : "An unexpected error occurred"
          });
        } 
      }
      
      loadCustomTopic()
    }
  }, [searchParams])

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
    // Reset conversation when topic changes
    if (hasStarted && activeTopic) {
      handleResetConversation();
    } else {
      // Clear conversation when topic changes and hasn't started yet
      setConversation([]);
      setHasStarted(false);
    }
  }, [activeTopic])

  useEffect(() => {
    // Scroll to bottom when conversation updates
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [conversation])

  useEffect(() => {
    if (recognizedText && isListening) {
      // When we're listening continuously, update the recognized text display
      // but don't submit automatically
      const lastMessage = conversation[conversation.length - 1];
      if (lastMessage && lastMessage.role === "user") {
        const updatedConversation = [...conversation.slice(0, -1), { 
          role: "user" as const, 
          content: recognizedText 
        }];
        setConversation(updatedConversation);
      } else {
        // Only add a new user message if there's no user message at the end
        // This is just for displaying what's being recognized
        setConversation([...conversation, { 
          role: "user" as const, 
          content: recognizedText 
        }]);
      }
    }
  }, [recognizedText, isListening]);

  // Handler for the start conversation button
  const handleStartConversation = async () => {
    try {
      const result = await initializeConversation(activeTopic.id);
      
      if (result.success && result.response) {
        // Add AI greeting to conversation
        setConversation([{ 
          role: "assistant" as const, 
          content: result.response
        }]);
        
        setHasStarted(true);
        
        // Speak the greeting if not using fallback
        if (!useFallback) {
          try {
            await speak(result.response);
          } catch (err) {
            setUseFallback(true);
            toast.error("Speech Synthesis Error", {
              description: err instanceof Error ? err.message : "Unable to play audio. Text will be displayed instead.",
            });
          }
        }
      } else {
        toast.error("Failed to start conversation", {
          description: result.error || "Please try again"
        });
      }
    } catch (err) {
      toast.error("Error starting conversation", {
        description: err instanceof Error ? err.message : "An unexpected error occurred"
      });
    }
  };

  // Handler for submitting recognized speech
  const handleSubmitResponse = () => {
    if (!recognizedText) return;
    
    // Store the user message for display
    const currentText = recognizedText;
    
    // Stop listening
    handleStopListening();
    
    // Add user message to conversation
    const updatedConversation = [...conversation, { 
      role: "user" as const, 
      content: currentText 
    }];
    setConversation(updatedConversation);
    
    // Bật trạng thái đang chờ phản hồi
    setIsWaitingForResponse(true);
    
    // Đặt resetUIState thành true
    setResetUIState(true);
    
    // Generate AI response with a small delay
    setTimeout(() => {
      handleGenerateResponse(currentText);
    }, 500);
  };

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

  const handleTopicChange = (topicId: string) => {
    const newTopic = topics.find((t) => t.id === topicId) || topics[0]
    setActiveTopic(newTopic)
  }

  const handleResetConversation = () => {
    setConversation([])
    setHasStarted(false)
    toast.success("Conversation Reset", {
      description: "Starting a new conversation for this topic.",
    })
  }

  const handleFallbackSubmit = (text: string) => {
    if (!hasStarted) {
      // If conversation hasn't started yet, initialize it first
      handleStartConversation().then(() => {
        // Then handle the user input after a delay
        setTimeout(() => {
          // Store the user message for display

          // Add user message to conversation
          const updatedConversation = [...conversation, { role: "user" as const, content: text }]
          setConversation(updatedConversation)

          // Bật trạng thái đang chờ phản hồi
          setIsWaitingForResponse(true);

          // Generate AI response
          handleGenerateResponse(text)
        }, 1000)
      })
    } else {

      // Add user message to conversation
      const updatedConversation = [...conversation, { role: "user" as const, content: text }]
      setConversation(updatedConversation)

      // Bật trạng thái đang chờ phản hồi
      setIsWaitingForResponse(true);

      // Generate AI response
      handleGenerateResponse(text)
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
    const result = await generateConversationResponse(userInput, activeTopic.id)

    // Tắt trạng thái đang chờ phản hồi
    setIsWaitingForResponse(false);

    if (result.success && result.response) {
      // Add AI response to conversation
      const updatedConversation = [...conversation, { role: "assistant" as const, content: result.response }]
      setConversation(updatedConversation)

      // Đặt lại resetUIState về false sau khi đã reset UI
      setResetUIState(false);

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
          className="flex items-center justify-between gap-3 mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-full relative overflow-hidden">
              <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-white relative z-10" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Conversation Practice</h1>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="outline" className="flex items-center gap-2">
                <Link href="/conversation/topics">
                  <ListPlus className="h-4 w-4" /> My Topics
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Manage your custom conversation topics
            </TooltipContent>
          </Tooltip>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <TopicTabs topics={topics} activeTopic={activeTopic} onTopicChange={handleTopicChange} />
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
                {hasStarted && (
                  <Button variant="outline" size="sm" onClick={handleResetConversation} className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Reset
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ConversationDisplay
                conversation={conversation}
                isListening={isListening}
                scrollAreaRef={scrollAreaRef as React.RefObject<HTMLDivElement>}
                recognizedText={recognizedText}
                hasStarted={hasStarted}
                isWaitingForResponse={isWaitingForResponse}
              />
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
                      hasStarted={hasStarted}
                      recognizedText={recognizedText}
                      resetUIState={resetUIState}
                      onStartListening={handleStartListening}
                      onStopListening={handleStopListening}
                      onStartConversation={handleStartConversation}
                      onSubmitResponse={handleSubmitResponse}
                      onReplayRecording={handleReplayRecording}
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
