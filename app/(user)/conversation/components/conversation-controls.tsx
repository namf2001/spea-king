'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Mic,
  VolumeX,
  Send,
  PlayCircle,
  RefreshCw,
  Volume2,
} from 'lucide-react';
import { AudioVisualizer } from '@/components/audio-visualizer';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ConversationControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  hasStarted: boolean;
  recognizedText?: string;
  resetUIState?: boolean;
  suggestionsEnabled: boolean;
  suggestionText?: string;
  isLoadingSuggestion: boolean;
  ieltsLevel: string;
  onStartListening: () => void;
  onStopListening: () => void;
  onStartConversation: () => void;
  onSubmitResponse?: () => void;
  onReplayRecording?: () => void;
  onToggleSuggestions: (enabled: boolean) => void;
  onIeltsLevelChange: (level: string) => void;
  getAudioData?: () => Uint8Array | null;
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
  const [internalRecognizedText, setInternalRecognizedText] = React.useState<
    string | undefined
  >(recognizedText);
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
          className="flex w-full justify-center"
        >
          <Button
            onClick={onStartConversation}
            className="from-primary to-primary/90 bg-gradient-to-r"
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            <span className="font-medium text-white">Bắt đầu hội thoại</span>
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
            className="from-primary to-primary/90 h-14 w-14 rounded-full bg-gradient-to-r"
            size="lg"
          >
            <Mic className="h-10 w-10 text-white transition-transform group-hover:scale-110" />
            <span className="sr-only">Bắt đầu nghe</span>
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
            className="h-14 w-14 rounded-full"
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
          className="h-12 w-12 rounded-full"
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
                setInternalRecognizedText(undefined);
              }
            }}
            className="from-primary to-primary/90 h-14 w-14 rounded-full bg-gradient-to-r"
            disabled={isSpeaking}
          >
            <Send className="h-8 w-8 text-white transition-transform group-hover:scale-110" />
            <span className="sr-only">Gửi</span>
          </Button>
        )}

        {/* Nút nghe lại */}
        {onReplayRecording && (
          <Button
            onClick={onReplayRecording}
            variant="outline"
            className="h-12 w-12 rounded-full"
            size="icon"
            disabled={isSpeaking}
          >
            <Volume2 className="h-6 w-6 transition-transform group-hover:scale-110" />
            <span className="sr-only">Phát lại</span>
          </Button>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Hiển thị audio visualizer khi đang lắng nghe */}
      {getAudioData && isListening && (
        <motion.div
          className="relative w-full"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative h-16 overflow-hidden rounded-lg border-2 border-gray-200 shadow-lg dark:border-gray-600">
            <AudioVisualizer
              getAudioData={getAudioData}
              isActive={isListening}
              height={60}
              barColor="#ed9392"
              backgroundColor="rgba(248, 250, 252, 0.8)"
              className="overflow-hidden rounded-lg"
            />
            <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
          </div>
        </motion.div>
      )}

      {/* Hiển thị UI theo trạng thái */}
      <AnimatePresence mode="wait">{renderStateContent()}</AnimatePresence>

      {/* Phần gợi ý */}
      {hasStarted && (
        <div className="flex w-full flex-col items-center">
          <div className="mb-2 flex items-center rounded-lg border-2 border-gray-200 py-2 px-6 shadow-sm dark:border-gray-600">
            <Label className="mr-2 font-medium">Gợi ý:</Label>
            <Switch
              checked={suggestionsEnabled}
              onCheckedChange={onToggleSuggestions}
              className="h-6 w-10"
            />
          </div>

          {suggestionsEnabled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="w-full rounded-lg border-2 border-gray-200 p-4 dark:border-gray-600"
            >
              {isLoadingSuggestion ? (
                <div className="flex items-center justify-center py-4">
                  <div className="mr-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Đang tạo gợi ý...
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-primary text-xs font-medium uppercase">
                      Câu trả lời gợi ý{' '}
                    </p>
                    {suggestionsEnabled && (
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">IELTS:</Label>
                        <Select
                          value={ieltsLevel}
                          onValueChange={onIeltsLevelChange}
                        >
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
                            <SelectItem value="8.5">8.5</SelectItem>
                            <SelectItem value="9.0">9.0</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
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
