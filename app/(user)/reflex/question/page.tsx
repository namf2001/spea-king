import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { getReflexQuestions } from '@/app/actions/reflex';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import ReflexQuestionsContent from '../components/reflex-questions-content';

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic';

export default async function QuestionPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  // Fetch user's reflex questions
  const response = await getReflexQuestions();
  const questions = response.data || [];
  const errorMessage = response.success ? undefined : response.error?.message;

  return (
    <Suspense fallback={<QuestionsLoading />}>
      <div className="container mx-auto px-4 py-12">
        <div className="animate-fadeIn mx-auto max-w-4xl">
          <ReflexQuestionsContent
            questions={questions}
            userId={userId}
            error={errorMessage}
          />
        </div>
      </div>
    </Suspense>
  );
}

function QuestionsLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
