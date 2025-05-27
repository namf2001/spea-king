'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  LottieAnimation,
  LottieSize,
} from '@/components/animations/lottie-animation';
import { cn } from '@/lib/utils';

// Định nghĩa type cho LottieButtonProps bằng cách mở rộng từ props của Button
export interface LottieButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Button>, 'asChild'> {
  /**
   * Đường dẫn đến file animation Lottie
   */
  lottieAnimation: string;

  /**
   * Kích thước của animation
   * @default "sm"
   */
  animationSize?: LottieSize;

  /**
   * Vị trí của animation (trái hoặc phải)
   * @default "left"
   */
  animationPosition?: 'left' | 'right';

  /**
   * Có hiển thị animation chỉ khi hover không
   * @default false
   */
  animateOnHover?: boolean;

  /**
   * Có lặp lại animation không
   * @default true
   */
  loop?: boolean;

  /**
   * Tốc độ của animation
   * @default 1
   */
  speed?: number;
}

export function LottieButton({
  children,
  lottieAnimation,
  animationSize = 'sm',
  animationPosition = 'left',
  animateOnHover = false,
  className,
  loop = true,
  speed = 1,
  variant,
  size,
  ...props
}: LottieButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Button
      className={cn(
        'flex items-center gap-2',
        animationPosition === 'right' && 'flex-row-reverse',
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      variant={variant}
      size={size}
      {...props}
    >
      {(!animateOnHover || isHovered) && (
        <LottieAnimation
          src={lottieAnimation}
          size={animationSize}
          loop={loop}
          autoplay={true}
          speed={speed}
          className={cn(
            'shrink-0',
            animateOnHover && 'transition-opacity',
            animateOnHover && !isHovered && 'opacity-0',
          )}
        />
      )}
      {children}
    </Button>
  );
}
