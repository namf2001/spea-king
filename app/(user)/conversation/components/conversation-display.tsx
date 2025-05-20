"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { RefObject } from "react"
import type { Message } from "../data/scenarios"
import { DotLoading } from "@/components/animations"

interface ConversationDisplayProps {
    readonly conversation: Message[]
    readonly isListening: boolean
    readonly scrollAreaRef: RefObject<HTMLDivElement>
    readonly recognizedText?: string
    readonly hasStarted?: boolean
    readonly isWaitingForResponse?: boolean // Thêm prop để biết khi nào đang chờ AI trả lời
}

export function ConversationDisplay({ 
    conversation, 
    isListening, 
    scrollAreaRef, 
    recognizedText, 
    hasStarted,
    isWaitingForResponse = false
}: ConversationDisplayProps) {
    // Kiểm tra xem tin nhắn cuối cùng trong conversation có phải của người dùng không
    const lastMessage = conversation.length > 0 ? conversation[conversation.length - 1] : null;
    const isLastMessageFromUser = lastMessage?.role === "user";

    return (
        <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef as any} data-testid="conversation-display">
            <div className="space-y-4 pb-4">
                {conversation.map((message, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                        <div
                            className={cn(
                                "flex w-fit max-w-[90%] flex-col gap-2 rounded-lg px-4 py-3 text-sm",
                                message.role === "user"
                                    ? "ml-auto bg-primary text-white"
                                    : "bg-muted"
                            )}
                            data-testid={`message-${message.role}`}
                        >
                            <div>{message.content}</div>
                        </div>
                    </motion.div>
                ))}

                {/* Hiển thị hiệu ứng loading dots khi đang chờ AI trả lời */}
                {isWaitingForResponse && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex mt-4"
                    >
                        <DotLoading 
                            dotColor="#ef9493" 
                            backgroundColor="#ffffff" 
                            className="w-fit" 
                            autoScroll={true} 
                        />
                    </motion.div>
                )}

                {/* Chỉ hiển thị văn bản tạm thời nếu đang lắng nghe và KHÔNG có tin nhắn người dùng ở cuối conversation */}
                {isListening && recognizedText && !isLastMessageFromUser && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="ml-auto w-fit max-w-[90%] rounded-lg bg-primary/70 px-4 py-3 text-sm text-white">
                            <motion.div
                                animate={{
                                    opacity: [0.7, 1, 0.7],
                                }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                {recognizedText}
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {isListening && !recognizedText && (
                    <div className="flex justify-end">
                        <div className="bg-gradient-to-t from-primary/10 to-background rounded-lg px-4 py-2 text-sm">Đang nghe...</div>
                    </div>
                )}

                {/* Trạng thái rỗng khi không có tin nhắn */}
                {conversation.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex h-32 flex-col items-center justify-center text-center"
                    >
                        <p className="text-sm text-muted-foreground">
                            {hasStarted 
                                ? "Nhấn nút microphone để bắt đầu nói."
                                : "Nhấn nút Bắt đầu Cuộc trò chuyện để bắt đầu."
                            }
                        </p>
                    </motion.div>
                )}
            </div>
        </ScrollArea>
    )
}
