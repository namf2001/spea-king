import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function ConversationLoading() {
  return (
    <div className="container mx-auto my-8 space-y-6">
      {/* Tiêu đề cuộc hội thoại */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-3/4 max-w-md" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Khung hội thoại */}
      <Card className="min-h-[500px]">
        <CardContent className="space-y-4">
          {/* Tin nhắn người dùng và bot */}
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] ${index % 2 === 0 ? 'mr-auto' : 'ml-auto'}`}
              >
                <Skeleton className="mb-2 h-10 w-10 rounded-full" />
                <Skeleton className={`h-20 w-full rounded-lg`} />
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <div className="flex w-full gap-2">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-12" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
