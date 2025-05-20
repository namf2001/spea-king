"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Mic, VolumeX, Send, PlayCircle, RefreshCw, Volume } from "lucide-react"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { motion, AnimatePresence } from "framer-motion"

interface ConversationControlsProps {
  isListening: boolean
  isSpeaking: boolean
  hasStarted: boolean
  recognizedText?: string
  resetUIState?: boolean
  onStartListening: () => void
  onStopListening: () => void
  onStartConversation: () => void
  onSubmitResponse?: () => void
  onReplayRecording?: () => void
  getAudioData?: () => Uint8Array | null
}

export function ConversationControls({
  isListening,
  isSpeaking,
  hasStarted,
  recognizedText,
  resetUIState,
  onStartListening,
  onStopListening,
  onStartConversation,
  onSubmitResponse,
  onReplayRecording,
  getAudioData,
}: ConversationControlsProps) {
  // Sử dụng internal state để theo dõi văn bản đã nhận dạng
  const [internalRecognizedText, setInternalRecognizedText] = React.useState<string | undefined>(recognizedText);
  
  // Đồng bộ recognizedText từ props vào internal state
  React.useEffect(() => {
    setInternalRecognizedText(recognizedText);
  }, [recognizedText]);
  
  // Reset internal state nếu resetUIState là true
  React.useEffect(() => {
    if (resetUIState) {
      setInternalRecognizedText(undefined);
    }
  }, [resetUIState]);

  // Xử lý hiển thị trạng thái UI
  const renderStateContent = () => {
    // Nếu chưa bắt đầu cuộc trò chuyện, hiển thị nút Start
    if (!hasStarted) {
      return (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center w-full"
        >
          <Button
            onClick={onStartConversation}
            size="lg"
            className="w-full sm:max-w-md bg-gradient-to-r from-blue-500 to-blue-600"
          >
            <PlayCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Start Conversation</span>
          </Button>
        </motion.div>
      );
    }

    // Trạng thái 1: Chưa nói - hiển thị nút microphone
    if (!isListening && !internalRecognizedText) {
      return (
        <motion.div
          key="mic-button"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex justify-center"
        >
          <Button
            onClick={onStartListening}
            disabled={isSpeaking}
            className="w-20 h-20 rounded-full relative overflow-hidden"
            size="lg"
          >
            <Mic className="h-8 w-8" />
            {!isSpeaking && (
              <motion.div 
                className="absolute -z-10 inset-0 bg-green-300 dark:bg-green-700 rounded-full opacity-20"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.2, 0.3, 0.2] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </Button>
        </motion.div>
      );
    }

    // Trạng thái 2: Đang nghe - hiển thị icon tai nghe
    if (isListening) {
      return (
        <motion.div
          key="listening-button"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex justify-center"
        >
          <Button
            onClick={onStopListening}
            className="w-20 h-20 rounded-full relative overflow-hidden"
            variant="destructive"
            size="lg"
          >
            <VolumeX className="h-8 w-8" />
            <motion.div 
              className="absolute -z-10 inset-0 bg-red-300 dark:bg-red-700 rounded-full opacity-20"
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.2, 0.3, 0.2] 
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </Button>
        </motion.div>
      );
    }

    // Trạng thái 3: Đã nói xong, hiển thị các nút tương tác (nói lại, gửi, nghe lại)
    return (
      <motion.div
        key="action-buttons"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-center gap-6"
      >
        {/* Nút nói lại */}
        <Button
          onClick={onStartListening}
          variant="outline"
          className="w-16 h-16 rounded-full"
          size="icon"
          disabled={isSpeaking}
        >
          <RefreshCw className="h-6 w-6" />
        </Button>
        
        {/* Nút gửi */}
        {onSubmitResponse && (
          <Button
            onClick={() => {
              if (onSubmitResponse) {
                onSubmitResponse();
                // Reset internal state ngay khi nhấn nút gửi
                setInternalRecognizedText(undefined);
              }
            }}
            className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700"
            size="icon"
            disabled={isSpeaking}
          >
            <Send className="h-6 w-6" />
          </Button>
        )}
        
        {/* Nút nghe lại */}
        {onReplayRecording && (
          <Button
            onClick={onReplayRecording}
            variant="outline"
            className="w-16 h-16 rounded-full"
            size="icon"
            disabled={isSpeaking}
          >
            <Volume className="h-6 w-6" />
          </Button>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col space-y-6 items-center">
      {/* Hiển thị audio visualizer khi đang lắng nghe */}
      {getAudioData && isListening && (
        <motion.div
          className="relative w-full"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative h-16">
            <AudioVisualizer
              getAudioData={getAudioData}
              isActive={isListening}
              height={60}
              barColor="#3b82f6"
              backgroundColor="rgba(248, 250, 252, 0.8)"
              className="rounded-lg overflow-hidden"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg pointer-events-none"></div>
          </div>
        </motion.div>
      )}

      {/* Hiển thị UI theo trạng thái */}
      <AnimatePresence mode="wait">
        {renderStateContent()}
      </AnimatePresence>
    </div>
  );
}
