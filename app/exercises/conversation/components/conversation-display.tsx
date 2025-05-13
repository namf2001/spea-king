import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { RefObject } from "react"
import type { Message } from "../data/scenarios"

interface ConversationDisplayProps {
    readonly conversation: Message[]
    readonly isListening: boolean
    readonly scrollAreaRef: RefObject<HTMLDivElement>
}

export function ConversationDisplay({ conversation, isListening, scrollAreaRef }: ConversationDisplayProps) {
    return (
        <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef as any}>
            <div className="space-y-4">
                {conversation.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            <Avatar>
                                <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
                            </Avatar>
                            <div
                                className={`rounded-lg px-4 py-2 ${message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"
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
    )
}
