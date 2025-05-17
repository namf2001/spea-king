'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart2 } from 'lucide-react'

export default function ReflexError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Lỗi tính năng luyện tập
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Đã có lỗi xảy ra khi tải tính năng luyện tập phản xạ. Có thể do vấn đề với dữ liệu bài tập hoặc kết nối mạng.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={reset}
            className="w-full"
          >
            Thử lại
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}