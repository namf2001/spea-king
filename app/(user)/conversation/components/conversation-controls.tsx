"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Mic, VolumeX, Repeat, Volume } from "lucide-react"
import { AudioVisualizer } from "@/components/audio-visualizer"
import { motion, AnimatePresence } from "framer-motion"

interface ConversationControlsProps {
  isListening: boolean
  isSpeaking: boolean
  isRecognizing: boolean
  hasConversation: boolean
  onStartListening: () => void
  onStopListening: () => void
  onRepeatLast: () => void
  getAudioData?: () => Uint8Array | null
}

export function ConversationControls({
  isListening,
  isSpeaking,
  isRecognizing,
  hasConversation,
  onStartListening,
  onStopListening,
  onRepeatLast,
  getAudioData,
}: ConversationControlsProps) {
  return (
    <div className="flex flex-col space-y-4">
      {getAudioData && isListening && (
        <motion.div
          className="relative"
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key="listen-button"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex justify-center w-full sm:w-auto"
          >
            <Button
              onClick={isListening ? onStopListening : onStartListening}
              disabled={isSpeaking}
              className="w-full relative overflow-hidden"
              size="lg"
            >
              {isListening ? (
                <>
                  <VolumeX className="h-5 w-5" />
                  <span className="font-medium ml-2">Stop Listening</span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  <span className="font-medium ml-2">{isRecognizing ? "Listening..." : "Start Listening"}</span>
                </>
              )}
              {!isListening && !isSpeaking && (
                <motion.div 
                  className="absolute -z-10 inset-0 bg-green-300 dark:bg-green-700 rounded-xl opacity-20"
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
        </AnimatePresence>

        <AnimatePresence>
          {hasConversation && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="flex justify-center w-full sm:w-auto"
            >
              <Button
                onClick={onRepeatLast}
                variant="outline"
                className="w-full"
                disabled={isListening || isSpeaking}
              >
                <Volume className="h-5 w-5" />
                <span className="ml-2">Repeat Last</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
