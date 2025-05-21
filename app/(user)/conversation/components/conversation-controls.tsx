"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Mic, VolumeX, Send, PlayCircle, RefreshCw, Volume2 } from "lucide-react"
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
  const [internalRecognizedText, setInternalRecognizedText] = React.useState<string | undefined>(recognizedText);
  React.useEffect(() => {
    setInternalRecognizedText(recognizedText);
  }, [recognizedText]);

  React.useEffect(() => {
    if (resetUIState) {
      setInternalRecognizedText(undefined);
    }
  }, [resetUIState]);

  const renderStateContent = () => {
    if (!hasStarted) {
      return (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center w-full"
        >
          <Button onClick={onStartConversation} >
            <PlayCircle className="h-5 w-5 mr-2" />
            <span className="font-medium text-white">Start conversation</span>
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
            className="w-14 h-14 rounded-full"
            size="lg"
          >
            <Mic className="h-10 w-10 text-white transition-transform group-hover:scale-110" />
            <span className="sr-only">Start Listening</span>
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
            className="w-14 h-14 rounded-full"
            variant="destructive"
          >
            <VolumeX className="h-10 w-10 text-white transition-transform group-hover:scale-110" />
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
          className="w-12 h-12 rounded-full"
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
            className="w-14 h-14 rounded-full"
            disabled={isSpeaking}
          >
            <Send className="h-8 w-8 text-white transition-transform group-hover:scale-110" />
            <span className="sr-only">Send</span>
          </Button>
        )}

        {/* Nút nghe lại */}
        {onReplayRecording && (
          <Button
            onClick={onReplayRecording}
            variant="outline"
            className="w-12 h-12 rounded-full"
            size="icon"
            disabled={isSpeaking}
          >
            <Volume2 className="h-6 w-6 transition-transform group-hover:scale-110" />
            <span className="sr-only">Replay</span>
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
          <div className="relative h-16 shadow-lg rounded-lg overflow-hidden">
            <AudioVisualizer
              getAudioData={getAudioData}
              isActive={isListening}
              height={60}
              barColor="#ef9493"
              backgroundColor="rgba(248, 250, 252, 0.8)"
              className="rounded-lg overflow-hidden"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg pointer-events-none"></div>
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
          <div className="flex items-center mb-2 p-2 rounded-lg shadow-sm">
            <Label className="mr-2 font-medium">Suggest:</Label>
            <Switch
              checked={suggestionsEnabled}
              onCheckedChange={onToggleSuggestions}
              className="w-10 h-6"
            />
          </div>

          {/* Bộ chọn cấp độ IELTS */}


          {/* Danh sách gợi ý */}
          {suggestionsEnabled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="w-full p-4 bg-gradient-to-t from-primary/10 to-background rounded-lg shadow-md border border-gray-100 dark:border-gray-700"
            >
              {isLoadingSuggestion ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Generating suggestions...</p>

                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase text-primary">Suggested answers </p>
                    {suggestionsEnabled && (
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">IELTS:</Label>
                        <Select value={ieltsLevel} onValueChange={onIeltsLevelChange}>
                          <SelectTrigger className="border-none">
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

                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {suggestionText}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
