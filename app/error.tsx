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

export default function Error({
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
          <CardTitle className="text-destructive">Đã xảy ra lỗi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Đã có lỗi xảy ra khi tải trang này. Vui lòng thử lại sau.
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
