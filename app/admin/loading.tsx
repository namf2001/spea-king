import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AdminLoading() {
  return (
    <div className="container mx-auto space-y-8 py-8">
      {/* Tiêu đề trang */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Thống kê tổng quan */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bảng quản trị */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-full divide-y">
              {/* Header */}
              <div className="bg-muted/50 p-4">
                <div className="grid grid-cols-6 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>

              {/* Rows */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="hover:bg-muted/50 p-4">
                  <div className="grid grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phân trang */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-48" />
      </div>
    </div>
  );
}
