import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ReflexLoading() {
  return (
    <div className="container mx-auto my-8 space-y-6">
      {/* Tiêu đề */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-3/4 max-w-md" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Khu vực luyện tập phản xạ */}
      <Card>
        <CardHeader>
          <Skeleton className="mb-2 h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Các bài tập đang tải */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Thông kê */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
