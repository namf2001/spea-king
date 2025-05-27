'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Mic, MicOff, AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SpeechError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Log speech-specific errors
    console.error('Speech Recognition Error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!navigator.mediaDevices?.getUserMedia,
    });
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      // Check microphone permissions before retry
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      reset();
    } catch (retryError) {
      console.error('Speech retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const isMaxRetries = retryCount >= 2;
  const isPermissionError =
    error.message.includes('permission') || error.message.includes('NotAllowedError');
  const isMicrophoneError =
    error.message.includes('microphone') || error.message.includes('MediaDeviceError');

  return (
    <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
          {isPermissionError || isMicrophoneError ? (
            <MicOff className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          ) : (
            <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          )}
        </div>
        <CardTitle className="text-orange-700 dark:text-orange-300">
          Lỗi nhận diện giọng nói
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {isPermissionError ? (
          <Alert>
            <Mic className="h-4 w-4" />
            <AlertDescription>
              Vui lòng cho phép truy cập microphone để sử dụng tính năng nhận diện
              giọng nói.
            </AlertDescription>
          </Alert>
        ) : isMicrophoneError ? (
          <Alert>
            <MicOff className="h-4 w-4" />
            <AlertDescription>
              Không thể truy cập microphone. Vui lòng kiểm tra thiết bị và thử lại.
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-center text-muted-foreground">
            Đã xảy ra lỗi với tính năng nhận diện giọng nói. Vui lòng thử lại.
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
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Chi tiết lỗi (Development)
            </summary>
            <pre className="mt-2 rounded bg-muted p-2 text-xs overflow-auto">
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
                Đang kiểm tra microphone...
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Thử lại nhận diện giọng nói
              </>
            )}
          </Button>
        ) : (
          <Alert className="w-full">
            <AlertDescription className="text-sm">
              Không thể khôi phục tính năng nhận diện giọng nói. Vui lòng tải lại
              trang hoặc liên hệ hỗ trợ.
            </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
}
