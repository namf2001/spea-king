'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RefreshCw, Mic, ListPlus } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { SpeechFallback } from '@/components/speech-fallback';
import { TopicTabs } from './topic-tabs';
import { ConversationDisplay } from './conversation-display';
import { ConversationControls } from './conversation-controls';
import {
  generateAIResponse,
  suggestUserResponse,
  saveSpeakingRecord,
} from '@/app/actions/speech';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
}

// Client component
export default function ConversationClient({ topics }: { topics: Topic[] }) {
  const [availableTopics] = useState<Topic[]>(topics);
  const [activeTopic, setActiveTopic] = useState<Topic>(topics[0]);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [audioVisualizerEnabled, setAudioVisualizerEnabled] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [resetUIState, setResetUIState] = useState(false);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(false);
  const [suggestionText, setSuggestionText] = useState<string | undefined>(
    undefined,
  );
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [ieltsLevel, setIeltsLevel] = useState('6.0');

  const {
    startRecognition,
    stopRecognition,
    recognizedText,
    error: recognitionError,
  } = useSpeechRecognition();
  const { speak, isSpeaking, error: synthesisError } = useSpeechSynthesis();
  const {
    audioUrl,
    startRecording,
    stopRecording,
    playRecording,
    getAudioData,
    error: recordingError,
  } = useAudioRecorder();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Check for errors and enable fallback if needed
  useEffect(() => {
    if (recognitionError || synthesisError) {
      setUseFallback(true);
      toast.error('Lỗi Dịch Vụ Giọng Nói', {
        description:
          'Đang sử dụng nhập văn bản thay thế. Vui lòng kiểm tra kết nối internet của bạn.',
      });
    }
  }, [recognitionError, synthesisError]);

  useEffect(() => {
    if (recordingError) {
      toast.error('Lỗi Ghi Âm', {
        description: recordingError,
      });
      setAudioVisualizerEnabled(false);
    }
  }, [recordingError]);

  useEffect(() => {
    // Reset conversation when topic changes
    if (hasStarted && activeTopic) {
      handleResetConversation();
    } else {
      // Clear conversation when topic changes and hasn't started yet
      setConversation([]);
      setHasStarted(false);
    }
  }, [activeTopic]);

  useEffect(() => {
    // Scroll to bottom when conversation updates
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [conversation]);

  useEffect(() => {
    if (recognizedText && isListening) {
      const lastMessage = conversation[conversation.length - 1];
      if (lastMessage && lastMessage.role === 'user') {
        const updatedConversation = [
          ...conversation.slice(0, -1),
          {
            role: 'user' as const,
            content: recognizedText,
          },
        ];
        setConversation(updatedConversation);
      } else {
        setConversation([
          ...conversation,
          {
            role: 'user' as const,
            content: recognizedText,
          },
        ]);
      }
    }
  }, [recognizedText, isListening]);

  // Handler for the start conversation button
  const handleStartConversation = async () => {
    try {
      const result = await generateAIResponse('', activeTopic.title, true);

      if (result.success && result.data?.response) {
        setConversation([
          {
            role: 'assistant' as const,
            content: result.data.response,
          },
        ]);

        setHasStarted(true);
        if (!useFallback) {
          try {
            await speak(result.data.response);
          } catch (err) {
            setUseFallback(true);
            toast.error('Lỗi Tổng Hợp Giọng Nói', {
              description:
                err instanceof Error
                  ? err.message
                  : 'Không thể phát âm thanh. Văn bản sẽ được hiển thị thay thế.',
            });
          }
        }
      } else {
        toast.error('Không thể bắt đầu cuộc hội thoại', {
          description: result.error?.message || 'Vui lòng thử lại',
        });
      }
    } catch (err) {
      toast.error('Lỗi khi bắt đầu cuộc hội thoại', {
        description:
          err instanceof Error ? err.message : 'Đã xảy ra lỗi không mong muốn',
      });
    }
  };

  // Handler for submitting recognized speech
  const handleSubmitResponse = () => {
    if (!recognizedText) return;
    const currentText = recognizedText;
    handleStopListening();
    const updatedConversation = [
      ...conversation,
      {
        role: 'user' as const,
        content: currentText,
      },
    ];
    setConversation(updatedConversation);
    setIsWaitingForResponse(true);
    setResetUIState(true);
    handleGenerateResponse(currentText);
  };

  const handleStartListening = async () => {
    setIsListening(true);
    try {
      await startRecognition();
      try {
        await startRecording();
      } catch (err) {
        console.error('Failed to start audio recording:', err);
        setAudioVisualizerEnabled(false);
        toast.error('Lỗi Ghi Âm', {
          description:
            'Không thể bắt đầu ghi âm. Vui lòng kiểm tra cài đặt micro của bạn.',
        });
      }
    } catch (err) {
      setIsListening(false);
      setUseFallback(true);
      toast.error('Lỗi', {
        description:
          err instanceof Error
            ? err.message
            : 'Không thể bắt đầu nhận dạng giọng nói. Sử dụng nhập văn bản thay thế.',
      });
    }
  };

  const handleStopListening = () => {
    setIsListening(false);
    stopRecognition();

    try {
      stopRecording();
    } catch (err) {
      console.error('Error stopping recording:', err);
    }

    // Save speaking record for conversation practice
    const estimatedDuration = recognizedText
      ? Math.max(Math.floor(recognizedText.length / 5), 3)
      : 3; // Estimate ~5 chars per second

    // Only pass conversationTopicId if it's a user-created topic (not a default topic)
    // Default topics have hardcoded IDs that don't exist in the database
    const isUserTopic = !['restaurant', 'interview', 'shopping'].includes(
      activeTopic.id,
    );
    const conversationTopicId = isUserTopic ? activeTopic.id : undefined;

    saveSpeakingRecord(
      'conversation',
      estimatedDuration,
      conversationTopicId,
    ).catch((err) => {
      console.error('Error saving speaking record:', err);
    });
  };

  const handleTopicChange = (topicId: string) => {
    const newTopic =
      availableTopics.find((t) => t.id === topicId) || availableTopics[0];
    setActiveTopic(newTopic);
  };

  const handleResetConversation = () => {
    setConversation([]);
    setHasStarted(false);
    toast.success('Đã Đặt Lại Cuộc Hội Thoại', {
      description: 'Bắt đầu một cuộc hội thoại mới cho chủ đề này.',
    });
  };

  const handleFallbackSubmit = (text: string) => {
    if (!hasStarted) {
      handleStartConversation().then(() => {
        const updatedConversation = [
          ...conversation,
          { role: 'user' as const, content: text },
        ];
        setConversation(updatedConversation);
        setIsWaitingForResponse(true);
        handleGenerateResponse(text);
      });
    } else {
      const updatedConversation = [
        ...conversation,
        { role: 'user' as const, content: text },
      ];
      setConversation(updatedConversation);
      setIsWaitingForResponse(true);
      handleGenerateResponse(text);
    }
  };

  const handleReplayRecording = () => {
    if (audioUrl) {
      try {
        playRecording();
      } catch (err) {
        console.error('Error playing recording:', err);
        toast.error('Lỗi Phát Lại', {
          description: 'Không thể phát lại bản ghi âm',
        });
      }
    } else {
      toast.error('Lỗi Phát Lại', {
        description: 'Không có bản ghi âm để phát lại',
      });
    }
  };

  // Safe wrapper for getAudioData to prevent errors from propagating
  const safeGetAudioData = () => {
    if (!audioVisualizerEnabled) return null;

    try {
      return getAudioData();
    } catch (err) {
      console.error('Error getting audio data:', err);
      setAudioVisualizerEnabled(false);
      return null;
    }
  };

  const handleGenerateResponse = async (userInput: string) => {
    const result = await generateAIResponse(
      userInput,
      activeTopic.title,
      false,
    );
    setIsWaitingForResponse(false);

    if (result.success && result.data?.response) {
      const updatedConversation = [
        ...conversation,
        { role: 'assistant' as const, content: result.data.response },
      ];
      setConversation(updatedConversation);
      setResetUIState(false);

      // Generate suggestion if enabled
      if (suggestionsEnabled) {
        getSuggestionForLastMessage(result.data.response);
      }

      if (!useFallback) {
        try {
          await speak(result.data.response);
        } catch (err) {
          setUseFallback(true);
          toast.error('Lỗi Tổng Hợp Giọng Nói', {
            description:
              err instanceof Error
                ? err.message
                : 'Không thể phát âm thanh. Văn bản sẽ được hiển thị thay thế.',
          });
        }
      }
    } else {
      toast.error('Lỗi Tạo Phản Hồi', {
        description:
          typeof result.error === 'string'
            ? result.error
            : 'Không thể tạo phản hồi',
      });
    }
  };

  // Handler for toggling suggestions
  const handleToggleSuggestions = async (enabled: boolean) => {
    setSuggestionsEnabled(enabled);

    // If enabling suggestions and we have conversation content, get suggestions
    if (enabled && conversation.length > 0) {
      const lastMessage = conversation[conversation.length - 1];
      if (lastMessage.role === 'assistant') {
        await getSuggestionForLastMessage(lastMessage.content);
      } else {
        setSuggestionText(undefined);
      }
    } else {
      // Clear suggestions if disabled
      setSuggestionText(undefined);
    }
  };

  // Get suggestion based on the last assistant message
  const getSuggestionForLastMessage = async (assistantMessage: string) => {
    if (!assistantMessage) return;

    setIsLoadingSuggestion(true);
    try {
      const result = await suggestUserResponse(
        assistantMessage,
        activeTopic.title,
        ieltsLevel,
      );

      if (result.success && result.data?.response) {
        setSuggestionText(result.data.response);
      } else {
        toast.error('Không thể nhận gợi ý', {
          description:
            typeof result.error === 'string'
              ? result.error
              : 'Vui lòng thử lại',
        });
      }
    } catch (err) {
      toast.error('Lỗi khi nhận gợi ý', {
        description:
          err instanceof Error ? err.message : 'Đã xảy ra lỗi không mong muốn',
      });
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  // Handler for changing IELTS level
  const handleIeltsLevelChange = (level: string) => {
    setIeltsLevel(level);

    // If suggestions are enabled and there's conversation, regenerate suggestion with new IELTS level
    if (suggestionsEnabled && conversation.length > 0) {
      const lastMessage = conversation[conversation.length - 1];
      if (lastMessage.role === 'assistant') {
        getSuggestionForLastMessage(lastMessage.content);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        className="mx-auto max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mb-8 flex items-center justify-between"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary relative overflow-hidden rounded-full p-2">
              <Mic className="relative z-10 h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">
              Luyện Tập Hội Thoại
            </h1>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="outline"
                className="flex items-center gap-2"
              >
                <Link href="/conversation/topics">
                  <ListPlus className="h-4 w-4" /> Chủ Đề Của Tôi
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Quản lý chủ đề hội thoại tùy chỉnh của bạn
            </TooltipContent>
          </Tooltip>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <TopicTabs
            topics={availableTopics}
            activeTopic={activeTopic}
            onTopicChange={handleTopicChange}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Hội Thoại</CardTitle>
                {hasStarted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetConversation}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Đặt lại
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
                    <SpeechFallback
                      onTextSubmit={handleFallbackSubmit}
                      type="recognition"
                    />
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
                      suggestionsEnabled={suggestionsEnabled}
                      suggestionText={suggestionText}
                      isLoadingSuggestion={isLoadingSuggestion}
                      ieltsLevel={ieltsLevel}
                      onStartListening={handleStartListening}
                      onStopListening={handleStopListening}
                      onStartConversation={handleStartConversation}
                      onSubmitResponse={handleSubmitResponse}
                      onReplayRecording={handleReplayRecording}
                      onToggleSuggestions={handleToggleSuggestions}
                      onIeltsLevelChange={handleIeltsLevelChange}
                      getAudioData={
                        audioVisualizerEnabled ? safeGetAudioData : undefined
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
