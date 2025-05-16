"use client";

import Link from "next/link";
import Image from "next/image";
import { logo } from "@/assets/image";
import { notfound } from "@/assets/animations";
import { Button } from "@/components/ui/button";
import { LottieAnimation } from "@/components/animations/lottie-animation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Tách Stars background thành component riêng
const StarsBackground = () => {
  const [stars, setStars] = useState<Array<{ key: number; size: number; top: number; left: number }>>([]);

  useEffect(() => {
    // Tạo các ngôi sao chỉ ở phía client
    const generatedStars = Array.from({ length: 50 }).map((_, i) => ({
      key: i,
      size: Math.random() * 3 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
    }));

    setStars(generatedStars);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.key}
          className="absolute bg-white dark:bg-gray-400 rounded-full opacity-30"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: `${star.top}%`,
            left: `${star.left}%`,
          }}
        />
      ))}
    </div>
  );
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
      {/* Stars background effect */}
      <StarsBackground />

      <div className="container mx-auto px-4 py-8 z-10 text-center">
        {/* Header with logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={logo}
              alt="SpeaKing Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-primary text-2xl font-bold">SPEA-KING</span>
          </Link>
        </div>

        {/* Animation container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto mb-8"
        >
          <LottieAnimation
            src={notfound}
            size="full"
            className="w-full max-w-sm mx-auto"
            loop={true}
            autoplay={true}
          />
        </motion.div>

        {/* Error message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Oops! Trang không tìm thấy
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển sang địa chỉ khác.
          </p>
          <Link href="/">
            <Button size="lg" className="px-8">
              Trở về trang chủ
            </Button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}