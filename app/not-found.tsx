'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { logo } from '@/assets/image';
import { notfound } from '@/assets/animations';
import { LottieAnimation } from '@/components/animations/lottie-animation';
import { Button } from '@/components/ui/button';

// Tách Stars background thành component riêng
const StarsBackground = () => {
  const [stars, setStars] = useState<
    Array<{ key: number; size: number; top: number; left: number }>
  >([]);

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
          className="absolute rounded-full bg-white opacity-30 dark:bg-gray-400"
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
    <main className="from-primary/5 to-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b">
      {/* Stars background effect */}
      <StarsBackground />

      <div className="z-10 container mx-auto px-4 py-8 text-center">
        {/* Header with logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center space-x-2 rounded-lg">
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
          className="mx-auto mb-8 max-w-md"
        >
          <LottieAnimation
            src={notfound}
            size="full"
            className="mx-auto w-full max-w-sm"
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
          <h1 className="text-primary mb-4 text-4xl font-bold md:text-5xl">
            Oops! Trang không tìm thấy
          </h1>
          <p className="text-muted-foreground mx-auto mb-8 max-w-md text-lg">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển sang địa
            chỉ khác.
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
