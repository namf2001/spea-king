'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

interface ErrorPageProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function GlobalError({
  error,
  reset,
}: ErrorPageProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Enhanced error logging with context
    console.error('Global error boundary triggered:', {
      error: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Report to error tracking service (e.g., Sentry)
    // reportError(error, { level: 'error', extra: { digest: error.digest } });
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      reset();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const isMaxRetries = retryCount >= 3;

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-red-700 dark:text-red-300">
            Oops! Đã xảy ra lỗi
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Ứng dụng gặp sự cố không mong muốn. Chúng tôi đã ghi nhận lỗi này và sẽ khắc phục sớm nhất.
          </p>

          {error.digest && (
            <Alert>
              <AlertDescription className="text-xs font-mono">
                Error ID: {error.digest}
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

        <CardFooter className="flex flex-col gap-2">
          {!isMaxRetries ? (
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="w-full"
              variant="destructive"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Đang thử lại...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Thử lại {retryCount > 0 && `(${retryCount}/3)`}
                </>
              )}
            </Button>
          ) : (
            <Alert className="mb-2">
              <AlertDescription className="text-sm">
                Đã thử lại nhiều lần không thành công. Vui lòng quay về trang chủ.
              </AlertDescription>
            </Alert>
          )}

          <Button variant="outline" className="w-full" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
