"use client"

import { motion } from "framer-motion"
import { logo } from "@/assets/image"
import { loading } from "@/assets/animations"
import { LottieAnimation } from "@/components/animations/lottie-animation"
import Image from "next/image"

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      <motion.div 
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative w-24 h-24 mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ 
              scale: [0.8, 1.2, 0.8],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30"
          />
          <Image
            src={logo}
            alt="SPEA-KING Logo"
            fill
            className="object-contain z-10"
            priority
          />
        </div>

        <motion.h1 
          className="text-2xl md:text-3xl font-bold text-primary mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          SPEA-KING
        </motion.h1>

        <motion.p
          className="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-xs px-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Đang tải nội dung học tập của bạn...
        </motion.p>

        <div className="flex items-center justify-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-blue-500"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatDelay: 0.2,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              repeat: Infinity,
              repeatDelay: 0.2,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-yellow-500"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              repeat: Infinity,
              repeatDelay: 0.2,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 0.8,
              delay: 0.6,
              repeat: Infinity,
              repeatDelay: 0.2,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>

      {/* Animation cố định ở góc phải dưới */}
      <motion.div 
        className="fixed bottom-4 right-4 z-20"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <LottieAnimation 
          src={loading} 
          size="xl" 
          className="w-24 h-24 drop-shadow-md"
          loop={true}
          autoplay={true}
        />
      </motion.div>
    </div>
  )
}