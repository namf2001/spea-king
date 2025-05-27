'use client';

import React from 'react';
import { LottieAnimation } from '@/components/animations/lottie-animation';
import { cn } from '@/lib/utils';
import { loading } from '@/assets/animations';

interface LoadingProps {
  /**
   * Kích thước của animation loading
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

  /**
   * Có hiển thị text "Đang tải..." không
   * @default false
   */
  showText?: boolean;

  /**
   * Text hiển thị dưới animation
   * @default "Đang tải..."
   */
  text?: string;

  /**
   * Text hiển thị khi hover vào animation
   */
  description?: string;

  /**
   * Class CSS bổ sung
   */
  className?: string;

  /**
   * Tốc độ animation
   * @default 1
   */
  speed?: number;

  /**
   * Màu chủ đạo (chỉ áp dụng nếu animation hỗ trợ)
   */
  color?: string;
}

/**
 * Component hiển thị loading animation sử dụng Lottie
 */
export const Loading = ({
  size = 'md',
  showText = false,
  text = 'Đang tải...',
  description,
  className,
  speed = 1,
  color,
}: LoadingProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <LottieAnimation
        src={loading}
        size={size}
        speed={speed}
        loop={true}
        className="text-primary"
        aria-label={description || text}
        title={description || text}
      />

      {showText && (
        <p className="text-muted-foreground mt-2 animate-pulse text-sm">
          {text}
        </p>
      )}
    </div>
  );
};
