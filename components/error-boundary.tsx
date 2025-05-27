'use client';

import { useEffect, useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Home, Bug } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

interface ErrorBoundaryProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
  title?: string;
  description?: string;
  maxRetries?: number;
  showHomeButton?: boolean;
  variant?: 'default' | 'minimal' | 'detailed';
  color?: 'red' | 'orange' | 'blue' | 'purple' | 'gray';
}

const colorVariants = {
  red: {
    card: 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20',
    icon: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    title: 'text-red-700 dark:text-red-300',
  },
  orange: {
    card: 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20',
    icon: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    title: 'text-orange-700 dark:text-orange-300',
  },
  blue: {
    card: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20',
    icon: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-700 dark:text-blue-300',
  },
  purple: {
    card: 'border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20',
    icon: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    title: 'text-purple-700 dark:text-purple-300',
  },
  gray: {
    card: 'border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950/20',
    icon: 'bg-gray-100 dark:bg-gray-900/30',
    iconColor: 'text-gray-600 dark:text-gray-400',
    title: 'text-gray-700 dark:text-gray-300',
  },
};

export default function ErrorBoundary({
  error,
  reset,
  title = 'Đã xảy ra lỗi',
  description,
  maxRetries = 3,
  showHomeButton = true,
  variant = 'default',
  color = 'red',
}: ErrorBoundaryProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const colors = colorVariants[color];

  useEffect(() => {
    // Enhanced error logging
    console.error('Error Boundary triggered:', {
      error: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      variant,
      color,
    });

    // Report to error tracking service
    // reportError(error, { level: 'error', extra: { digest: error.digest, variant, color } });
  }, [error, variant, color]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      reset();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const isMaxRetries = retryCount >= maxRetries;

  if (variant === 'minimal') {
    return (
      <Alert className={colors.card}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{title}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRetry}
            disabled={isRetrying || isMaxRetries}
          >
            {isRetrying ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={colors.card}>
      <CardHeader className="text-center">
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${colors.icon}`}>
          <AlertTriangle className={`h-6 w-6 ${colors.iconColor}`} />
        </div>
        <CardTitle className={colors.title}>
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          {description ?? 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.'}
        </p>

        {error.digest && (
          <Alert>
            <Bug className="h-4 w-4" />
            <AlertDescription className="text-xs font-mono">
              Error ID: {error.digest}
            </AlertDescription>
          </Alert>
        )}

        {retryCount > 0 && (
          <Alert>
            <AlertDescription>
              Đã thử lại {retryCount}/{maxRetries} lần {isMaxRetries && '(đã đạt giới hạn)'}
            </AlertDescription>
          </Alert>
        )}

        {variant === 'detailed' && process.env.NODE_ENV === 'development' && (
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
            variant="outline"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Đang thử lại...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Thử lại ({retryCount}/{maxRetries})
              </>
            )}
          </Button>
        ) : (
          <Alert className="mb-2">
            <AlertDescription className="text-sm">
              Đã thử lại {maxRetries} lần không thành công. Vui lòng tải lại trang.
            </AlertDescription>
          </Alert>
        )}

        {showHomeButton && (
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundaryWrapper {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundaryWrapper>
    );
  };
}

// Error boundary wrapper component
function ErrorBoundaryWrapper({
  children,
  ...errorBoundaryProps
}: {
  children: ReactNode;
} & Partial<ErrorBoundaryProps>) {
  return (
    <div>
      {children}
    </div>
  );
}