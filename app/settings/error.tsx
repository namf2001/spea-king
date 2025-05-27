'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Lỗi tải cài đặt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Đã có lỗi xảy ra khi tải dữ liệu cài đặt. Vui lòng thử lại sau hoặc
            liên hệ với quản trị viên.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={reset} className="w-full">
            Thử lại
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
