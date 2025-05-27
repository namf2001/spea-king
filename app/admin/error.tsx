'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Shield, ShieldAlert, Database, Settings } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Log admin-specific errors with enhanced context
    console.error('Admin Panel Error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      adminPath: window.location.pathname,
      localStorage: Object.keys(localStorage).length,
    });
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      // Clear any cached admin data
      sessionStorage.removeItem('admin-cache');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      reset();
    } catch (retryError) {
      console.error('Admin retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const isMaxRetries = retryCount >= 2;
  const isAuthError = error.message.includes('auth') || error.message.includes('permission') || error.message.includes('unauthorized');
  const isDataError = error.message.includes('database') || error.message.includes('prisma') || error.message.includes('sql');

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            {isAuthError ? (
              <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
            ) : isDataError ? (
              <Database className="h-6 w-6 text-red-600 dark:text-red-400" />
            ) : (
              <Settings className="h-6 w-6 text-red-600 dark:text-red-400" />
            )}
          </div>
          <CardTitle className="text-red-700 dark:text-red-300">
            Lỗi Admin Panel
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isAuthError ? (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Phiên đăng nhập admin đã hết hạn hoặc không có quyền truy cập. Vui lòng đăng nhập lại.
              </AlertDescription>
            </Alert>
          ) : isDataError ? (
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                Không thể kết nối tới cơ sở dữ liệu. Vui lòng kiểm tra kết nối và thử lại.
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-center text-muted-foreground">
              Đã xảy ra lỗi trong admin panel. Vui lòng thử lại hoặc liên hệ support.
            </p>
          )}

          {error.digest && (
            <Alert>
              <AlertDescription className="text-xs font-mono">
                Admin Error ID: {error.digest}
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
                Chi tiết lỗi Admin (Development)
              </summary>
              <pre className="mt-2 rounded bg-muted p-2 text-xs overflow-auto">
                {error.stack || error.message}
              </pre>
            </details>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {!isMaxRetries && !isAuthError ? (
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="w-full"
              variant="destructive"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Đang khôi phục admin panel...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Thử lại admin panel
                </>
              )}
            </Button>
          ) : (
            <Alert className="mb-2">
              <AlertDescription className="text-sm">
                {isAuthError 
                  ? 'Cần đăng nhập lại để tiếp tục sử dụng admin panel.'
                  : 'Không thể khôi phục admin panel. Vui lòng liên hệ support.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/login">
                <Shield className="mr-2 h-4 w-4" />
                Đăng nhập lại
              </Link>
            </Button>
            <Button variant="ghost" className="flex-1" asChild>
              <Link href="/">
                <Settings className="mr-2 h-4 w-4" />
                Về trang chủ
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
