import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { RefObject } from "react"
import type { Message } from "../data/scenarios"

interface ConversationDisplayProps {
    readonly conversation: Message[]
    readonly isListening: boolean
    readonly scrollAreaRef: RefObject<HTMLDivElement>
    readonly recognizedText?: string
}

export function ConversationDisplay({ conversation, isListening, scrollAreaRef, recognizedText }: ConversationDisplayProps) {
    // Kiểm tra xem tin nhắn cuối cùng trong conversation có phải của người dùng không
    const lastMessage = conversation.length > 0 ? conversation[conversation.length - 1] : null;
    const isLastMessageFromUser = lastMessage?.role === "user";

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
                                className={`rounded-lg px-4 py-2 ${message.role === "user"
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                    : "bg-gradient-to-t from-primary/10 to-background dark:from-primary/20 dark:to-background"
                                }`}
                            >
                                <p>{message.content}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Chỉ hiển thị văn bản tạm thời nếu đang lắng nghe và KHÔNG có tin nhắn người dùng ở cuối conversation */}
                {isListening && recognizedText && !isLastMessageFromUser && (
                    <div className="flex justify-end">
                        <div className={`flex gap-3 max-w-[80%] flex-row-reverse`}>
                            <Avatar>
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg px-4 py-2">
                                <p>{recognizedText} ...</p>
                            </div>
                        </div>
                    </div>
                )}

                {isListening && !recognizedText && (
                    <div className="flex justify-end">
                        <div className="bg-gradient-to-t from-primary/10 to-background rounded-lg px-4 py-2 text-sm">Đang nghe...</div>
                    </div>
                )}
            </div>
        </ScrollArea>
    )
}
