'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, ZapOff, Timer, TimerOff } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ReflexError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Log reflex-specific errors
    console.error('Reflex Training Error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      performanceNow: !!performance.now,
      animationFrame: !!requestAnimationFrame,
      deviceMemory: (navigator as any).deviceMemory,
    });
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    try {
      // Clear any running timers or animations - safer approach
      // Instead of trying to clear all possible timeouts, we'll just ensure cleanup
      if (typeof window !== 'undefined') {
        // Cancel any pending animation frames
        let animationId = requestAnimationFrame(() => {});
        cancelAnimationFrame(animationId);
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
      reset();
    } catch (retryError) {
      console.error('Reflex retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const isMaxRetries = retryCount >= 2;
  const isTimingError =
    error.message.includes('timer') || error.message.includes('timeout');
  const isPerformanceError =
    error.message.includes('performance') || error.message.includes('memory');

  return (
    <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
          {isTimingError ? (
            <TimerOff className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          ) : isPerformanceError ? (
            <ZapOff className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          ) : (
            <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          )}
        </div>
        <CardTitle className="text-purple-700 dark:text-purple-300">
          Lỗi luyện tập phản xạ
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {isTimingError ? (
          <Alert>
            <Timer className="h-4 w-4" />
            <AlertDescription>
              Có vấn đề với hệ thống đo thời gian phản xạ. Vui lòng thử lại.
            </AlertDescription>
          </Alert>
        ) : isPerformanceError ? (
          <Alert>
            <ZapOff className="h-4 w-4" />
            <AlertDescription>
              Thiết bị có thể đang chậm. Hãy đóng các ứng dụng khác và thử lại.
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-muted-foreground text-center">
            Đã xảy ra lỗi với bài tập luyện phản xạ. Vui lòng thử lại.
          </p>
        )}

        {retryCount > 0 && (
          <Alert>
            <AlertDescription>
              Đã thử lại {retryCount} lần {isMaxRetries && '(đã đạt giới hạn)'}
            </AlertDescription>
          </Alert>
        )}

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm">
              Chi tiết lỗi (Development)
            </summary>
            <pre className="bg-muted mt-2 overflow-auto rounded p-2 text-xs">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </CardContent>

      <CardFooter>
        {!isMaxRetries ? (
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full"
            variant="outline"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Đang khởi động lại...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Thử lại luyện tập phản xạ
              </>
            )}
          </Button>
        ) : (
          <Alert className="w-full">
            <AlertDescription className="text-sm">
              Không thể khôi phục bài tập phản xạ. Vui lòng tải lại trang.
            </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
}
