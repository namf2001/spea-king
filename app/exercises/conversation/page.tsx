"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, RefreshCw, Volume2 } from "lucide-react"
import { toast } from "sonner"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

// Sample conversation scenarios
const scenarios = [
  {
    id: "restaurant",
    title: "At a Restaurant",
    description: "Practice ordering food and making special requests",
    conversation: [
      {
        role: "assistant",
        content: "Hello! Welcome to our restaurant. Do you have a reservation?",
      },
    ],
  },
  {
    id: "interview",
    title: "Job Interview",
    description: "Practice answering common interview questions",
    conversation: [
      {
        role: "assistant",
        content: "Thanks for coming in today. Could you tell me a little about yourself?",
      },
    ],
  },
  {
    id: "shopping",
    title: "Shopping",
    description: "Practice asking for help and making purchases",
    conversation: [
      {
        role: "assistant",
        content: "Hi there! How can I help you today?",
      },
    ],
  },
]

export default function ConversationPage() {
  const [activeScenario, setActiveScenario] = useState(scenarios[0])
  const [conversation, setConversation] = useState(activeScenario.conversation)
  const [isListening, setIsListening] = useState(false)
  const { startRecognition, stopRecognition, recognizedText, isRecognizing } = useSpeechRecognition()
  const { speak, isSpeaking } = useSpeechSynthesis()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

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
      const updatedConversation = [...conversation, { role: "user", content: recognizedText }]
      setConversation(updatedConversation)

      // Generate AI response after a short delay
      setTimeout(() => {
        generateResponse(recognizedText)
      }, 1000)
    }
  }, [recognizedText, isListening])

  const handleStartListening = () => {
    setIsListening(true)
    startRecognition()
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

  const generateResponse = (userInput: string) => {
    // This is a simplified response generation
    // In a real app, you would use Azure AI or another LLM to generate contextual responses

    let response = ""
    const lowerInput = userInput.toLowerCase()

    // Restaurant scenario responses
    if (activeScenario.id === "restaurant") {
      if (lowerInput.includes("reservation") || lowerInput.includes("book")) {
        response = "I see. What time would you like to dine with us today?"
      } else if (lowerInput.includes("menu") || lowerInput.includes("recommend")) {
        response = "Our chef's special today is grilled salmon with seasonal vegetables. Would you like to try that?"
      } else if (lowerInput.includes("order") || lowerInput.includes("like")) {
        response = "Excellent choice! Would you like any appetizers or drinks with that?"
      } else {
        response = "Of course. Let me show you to your table. Would you prefer a window seat?"
      }
    }
    // Interview scenario responses
    else if (activeScenario.id === "interview") {
      if (lowerInput.includes("experience") || lowerInput.includes("work")) {
        response = "That's impressive experience. What would you say is your greatest professional achievement?"
      } else if (lowerInput.includes("strength") || lowerInput.includes("good at")) {
        response = "Those are valuable strengths. How about challenges or areas you're working to improve?"
      } else if (lowerInput.includes("question") || lowerInput.includes("ask")) {
        response =
          "Great question. Our company culture emphasizes collaboration and innovation. How do you feel about working in team environments?"
      } else {
        response =
          "Thank you for sharing that. Could you tell me about a time when you faced a difficult challenge at work and how you handled it?"
      }
    }
    // Shopping scenario responses
    else if (activeScenario.id === "shopping") {
      if (lowerInput.includes("looking") || lowerInput.includes("find")) {
        response = "I can help you find that. What size and color are you looking for?"
      } else if (lowerInput.includes("price") || lowerInput.includes("cost") || lowerInput.includes("expensive")) {
        response = "That item is $49.99. We also have a sale on similar items if you're interested."
      } else if (lowerInput.includes("try") || lowerInput.includes("fitting")) {
        response = "The fitting rooms are just over there to your right. Let me know if you need a different size."
      } else {
        response = "Is there anything else I can help you with today?"
      }
    }

    // Add AI response to conversation
    const updatedConversation = [...conversation, { role: "assistant", content: response }]

    setConversation(updatedConversation)

    // Speak the response
    speak(response)
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

        <Tabs defaultValue={activeScenario.id} onValueChange={handleScenarioChange} className="mb-8">
          <TabsList className="grid grid-cols-3 mb-4">
            {scenarios.map((scenario) => (
              <TabsTrigger key={scenario.id} value={scenario.id}>
                {scenario.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {scenarios.map((scenario) => (
            <TabsContent key={scenario.id} value={scenario.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{scenario.title}</CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

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
            <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef as any}>
              <div className="space-y-4">
                {conversation.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <Avatar>
                        <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <p>{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {isListening && (
                  <div className="flex justify-end">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2 text-sm">Listening...</div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <div className="w-full flex justify-center gap-4">
              {isListening ? (
                <Button onClick={handleStopListening} variant="destructive" className="flex items-center gap-2">
                  Stop Recording
                </Button>
              ) : (
                <Button
                  onClick={handleStartListening}
                  variant="default"
                  className="flex items-center gap-2"
                  disabled={isRecognizing || isSpeaking}
                >
                  <Mic className="h-4 w-4" />
                  {isRecognizing ? "Listening..." : "Speak Now"}
                </Button>
              )}

              {conversation.length > 1 && (
                <Button
                  onClick={() => speak(conversation[conversation.length - 1].content)}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={isSpeaking}
                >
                  <Volume2 className="h-4 w-4" />
                  Repeat Last
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
