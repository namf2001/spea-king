'use client';

import React from 'react';
import { Loading } from '@/components/animations/loading';
import { cn } from '@/lib/utils';

interface PageLoadingProps {
  /**
   * Text hiển thị cùng với animation
   * @default "Đang tải dữ liệu..."
   */
  text?: string;

  /**
   * Có sử dụng overlay nền mờ không
   * @default true
   */
  useOverlay?: boolean;

  /**
   * Kích thước của animation
   * @default "lg"
   */
  size?: 'md' | 'lg' | 'xl' | '2xl' | number;

  /**
   * Lớp CSS bổ sung
   */
  className?: string;
}

/**
 * Hiển thị loading toàn màn hình cho trang
 */
export const PageLoading = ({
  text = 'Đang tải dữ liệu...',
  useOverlay = true,
  size = 'lg',
  className,
}: PageLoadingProps) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        useOverlay && 'bg-background/80 backdrop-blur-sm',
        className,
      )}
    >
      <Loading
        size={size}
        showText={true}
        text={text}
        speed={1}
        className="animate-in fade-in duration-500"
      />
    </div>
  );
};
