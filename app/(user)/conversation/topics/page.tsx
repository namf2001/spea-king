import { Suspense } from 'react';
import ConversationTopicsContent from '../components/conversation-topics-content';
import { auth } from '@/lib/auth';
import { getConversationTopicsByUserId } from '@/app/actions/conversation';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic';

export default async function TopicsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  // Fetch user's conversation topics
  const response = await getConversationTopicsByUserId();
  const topics = response.data || [];
  const errorMessage = response.success ? undefined : response.error?.message;

  return (
    <Suspense fallback={<TopicsLoading />}>
      <div className="container mx-auto px-4 py-12">
        <div className="animate-fadeIn mx-auto max-w-4xl">
          <ConversationTopicsContent
            topics={topics}
            userId={userId}
            error={errorMessage}
          />
        </div>
      </div>
    </Suspense>
  );
}

function TopicsLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6">
              <Skeleton className="mb-4 h-6 w-3/4" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="bg-muted flex items-center justify-between p-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
