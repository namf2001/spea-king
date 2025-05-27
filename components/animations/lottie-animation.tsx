'use client';

import React, { useEffect, useRef, useState, memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

// Dynamically import Lottie with no SSR
const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
  ),
});

export type LottieSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | 'full'
  | number;

export interface LottieAnimationProps
  extends Omit<React.ComponentProps<typeof Lottie>, 'animationData' | 'size'> {
  /**
   * Đường dẫn đến file JSON Lottie animation HOẶC đối tượng animation data
   * (ví dụ: "/animations/loading.json" hoặc imported JSON object)
   */
  src: string | any;

  /**
   * Kích thước của animation
   */
  size?: LottieSize;

  /**
   * Có lặp lại animation không
   * @default true
   */
  loop?: boolean;

  /**
   * Có tự động chạy animation không
   * @default true
   */
  autoplay?: boolean;

  /**
   * Tốc độ của animation (1 = bình thường, 0.5 = chậm một nửa, 2 = nhanh gấp đôi)
   * @default 1
   */
  speed?: number;

  /**
   * Sự kiện xảy ra khi animation hoàn thành
   */
  onComplete?: () => void;

  /**
   * Class CSS bổ sung
   */
  className?: string;

  /**
   * Có hiển thị placeholder khi đang tải animation không
   * @default true
   */
  showPlaceholder?: boolean;
}

// Tạo một component memoized để tránh re-render không cần thiết
const MemoizedLottie = memo(
  ({
    lottieRef,
    animationData,
    loop,
    autoplay,
    onComplete,
    rendererSettings,
    ...props
  }: any) => (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      onComplete={onComplete}
      rendererSettings={rendererSettings}
      {...props}
    />
  ),
);
MemoizedLottie.displayName = 'MemoizedLottie';

export const LottieAnimation = ({
  src,
  size = 'md',
  loop = true,
  autoplay = true,
  speed = 1,
  onComplete,
  className,
  showPlaceholder = true,
  ...props
}: LottieAnimationProps) => {
  const lottieRef = useRef<any>(null);
  const [animationData, setAnimationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kích thước animation dựa trên prop size - Memoize để tránh tính toán lại
  const sizeMap = useMemo(
    () => ({
      xs: 'w-4 h-4',
      sm: 'w-6 h-6',
      md: 'w-10 h-10',
      lg: 'w-16 h-16',
      xl: 'w-24 h-24',
      '2xl': 'w-32 h-32',
      '3xl': 'w-40 h-40',
      full: 'w-full h-full',
    }),
    [],
  );

  // Xác định style kích thước - Memoize để tránh tính toán lại
  const sizeStyle = useMemo(
    () =>
      typeof size === 'number' ? { width: size, height: size } : undefined,
    [size],
  );

  const sizeClass = useMemo(
    () =>
      typeof size === 'string'
        ? sizeMap[size as keyof typeof sizeMap] || 'w-10 h-10'
        : 'w-10 h-10',
    [size, sizeMap],
  );

  // Tối ưu renderer settings
  const rendererSettings = useMemo(
    () => ({
      preserveAspectRatio: 'xMidYMid slice',
      progressiveLoad: true,
      clearCanvas: false,
      hideOnTransparent: true, // Tăng hiệu suất bằng cách ẩn nền trong suốt
    }),
    [],
  );

  // Tải animation JSON nếu src là string (đường dẫn), hoặc sử dụng trực tiếp nếu là object
  useEffect(() => {
    let isMounted = true;

    // Nếu src là object (đã import trực tiếp), sử dụng luôn
    if (typeof src !== 'string') {
      setAnimationData(src);
      setIsLoading(false);
      return;
    }

    // Nếu src là string (đường dẫn), tải file JSON
    setIsLoading(true);
    setError(null);

    // Cache mechanism to avoid refetching
    const cachedAnimation = sessionStorage.getItem(`lottie-${src}`);
    if (cachedAnimation) {
      try {
        const parsedData = JSON.parse(cachedAnimation);
        if (isMounted) {
          setAnimationData(parsedData);
          setIsLoading(false);
        }
        return;
      } catch (e) {
        // If parsing fails, fetch again
        console.warn('Failed to parse cached animation, fetching again...');
      }
    }

    fetch(src)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to load animation (${response.status} ${response.statusText})`,
          );
        }
        return response.json();
      })
      .then((data) => {
        if (isMounted) {
          // Cache the animation data
          try {
            sessionStorage.setItem(`lottie-${src}`, JSON.stringify(data));
          } catch (e) {
            console.warn('Failed to cache animation data', e);
          }

          setAnimationData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load Lottie animation:', err);
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  // Đặt tốc độ animation
  useEffect(() => {
    if (lottieRef.current && speed !== 1) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed, animationData]);

  // Xử lý sự kiện khi animation hoàn thành
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }

    // Nếu không lặp và có reference, dừng ở frame cuối
    if (!loop && lottieRef.current) {
      lottieRef.current.goToAndStop(
        lottieRef.current.getDuration(true) ?? 0,
        true,
      );
    }
  };

  // Render placeholder khi đang tải
  if (isLoading && showPlaceholder) {
    return (
      <div
        className={cn(
          'animate-pulse rounded-full bg-gray-200 dark:bg-gray-700',
          sizeClass,
          className,
        )}
        style={sizeStyle}
      />
    );
  }

  // Render thông báo lỗi
  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded border border-red-300 text-red-500',
          sizeClass,
          className,
        )}
        style={sizeStyle}
      >
        <span className="text-xs">!</span>
      </div>
    );
  }

  // Render animation
  return (
    <div className={cn(sizeClass, className)} style={sizeStyle}>
      {animationData && (
        <MemoizedLottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop={loop}
          autoplay={autoplay}
          onComplete={handleComplete}
          rendererSettings={rendererSettings}
          {...props}
        />
      )}
    </div>
  );
};

// Memoize toàn bộ component để tránh render lại không cần thiết
export default memo(LottieAnimation);
