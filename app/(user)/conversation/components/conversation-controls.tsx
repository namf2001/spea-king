"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Mic, VolumeX, Send, PlayCircle, RefreshCw, Volume } from "lucide-react"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { motion, AnimatePresence } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ConversationControlsProps {
  isListening: boolean
  isSpeaking: boolean
  hasStarted: boolean
  recognizedText?: string
  resetUIState?: boolean
  suggestionsEnabled: boolean
  suggestionText?: string
  isLoadingSuggestion: boolean
  ieltsLevel: string
  onStartListening: () => void
  onStopListening: () => void
  onStartConversation: () => void
  onSubmitResponse?: () => void
  onReplayRecording?: () => void
  onToggleSuggestions: (enabled: boolean) => void
  onIeltsLevelChange: (level: string) => void
  getAudioData?: () => Uint8Array | null
}

export function ConversationControls({
  isListening,
  isSpeaking,
  hasStarted,
  recognizedText,
  resetUIState,
  suggestionsEnabled,
  suggestionText,
  isLoadingSuggestion,
  ieltsLevel,
  onStartListening,
  onStopListening,
  onStartConversation,
  onSubmitResponse,
  onReplayRecording,
  onToggleSuggestions,
  onIeltsLevelChange,
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

      {/* Phần gợi ý */}
      {hasStarted && (
        <div className="w-full flex flex-col items-center">
          {/* Chuyển đổi bật tắt gợi ý */}
          <div className="flex items-center mb-2">
            <Label className="mr-2">Suggestion:</Label>
            <Switch
              checked={suggestionsEnabled}
              onCheckedChange={onToggleSuggestions}
              className="w-10 h-6"
            />
          </div>
          
          {/* Bộ chọn cấp độ IELTS */}
          {suggestionsEnabled && (
            <div className="flex items-center gap-2 mb-3">
              <Label className="text-sm text-gray-500 dark:text-gray-400">IELTS LEVEL:</Label>
              <Select value={ieltsLevel} onValueChange={onIeltsLevelChange}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue placeholder="IELTS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4.0">4.0</SelectItem>
                  <SelectItem value="5.0">5.0</SelectItem>
                  <SelectItem value="6.0">6.0</SelectItem>
                  <SelectItem value="6.5">6.5</SelectItem>
                  <SelectItem value="7.0">7.0</SelectItem>
                  <SelectItem value="7.5">7.5</SelectItem>
                  <SelectItem value="8.0">8.0</SelectItem>
                  <SelectItem value="9.0">9.0</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Danh sách gợi ý */}
          {suggestionsEnabled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
            >
              {isLoadingSuggestion ? (
                <div className="flex items-center justify-center py-2">
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Đang tạo gợi ý...</p>
                </div>
              ) : 
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {suggestionText}
                </p>
              }
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
