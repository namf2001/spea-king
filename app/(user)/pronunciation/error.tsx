'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Utility functions for speech API support checking
const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export default function PronunciationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Log pronunciation-specific errors with enhanced context
    console.error('Pronunciation Assessment Error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      speechRecognitionSupported: isSpeechRecognitionSupported(),
      speechSynthesisSupported: isSpeechSynthesisSupported(),
      userAgent: navigator.userAgent,
      mediaDevices: !!navigator.mediaDevices,
    });
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      // Check for microphone permissions before retry
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      reset();
    } catch (retryError) {
      console.error('Pronunciation retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const isMaxRetries = retryCount >= 2;
  const isPermissionError = error.message.includes('NotAllowedError') || error.message.includes('permission');
  const isNetworkError = error.message.includes('network') || error.message.includes('fetch');

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          {isPermissionError ? (
            <MicOff className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          ) : isNetworkError ? (
            <VolumeX className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          ) : (
            <Volume2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          )}
        </div>
        <CardTitle className="text-blue-700 dark:text-blue-300">
          Lỗi đánh giá phát âm
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isPermissionError ? (
          <Alert>
            <Mic className="h-4 w-4" />
            <AlertDescription>
              Không thể truy cập microphone. Vui lòng cho phép quyền truy cập và thử lại.
            </AlertDescription>
          </Alert>
        ) : isNetworkError ? (
          <Alert>
            <VolumeX className="h-4 w-4" />
            <AlertDescription>
              Không thể kết nối tới dịch vụ đánh giá phát âm. Kiểm tra kết nối mạng.
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-center text-muted-foreground">
            Đã xảy ra lỗi với tính năng đánh giá phát âm. Vui lòng thử lại.
          </p>
        )}

        {!isSpeechRecognitionSupported() && (
          <Alert>
            <AlertDescription>
              Trình duyệt không hỗ trợ nhận diện giọng nói. Hãy sử dụng Chrome hoặc Edge.
            </AlertDescription>
          </Alert>
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
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Chi tiết lỗi (Development)
            </summary>
            <pre className="mt-2 rounded bg-muted p-2 text-xs overflow-auto">
              {error.stack ?? error.message}
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
                <Volume2 className="mr-2 h-4 w-4" />
                Thử lại đánh giá phát âm
              </>
            )}
          </Button>
        ) : (
          <Alert className="w-full">
            <AlertDescription className="text-sm">
              Không thể khôi phục tính năng đánh giá phát âm. Vui lòng tải lại trang.
            </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
}
