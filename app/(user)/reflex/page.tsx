import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { getReflexQuestions } from '@/app/actions/reflex';
import { notFound } from 'next/navigation';
import ReflexClient from './components/reflex-client';

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic';

export default async function ReflexPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  // Fetch user questions from the database
  const response = await getReflexQuestions();
  const userQuestions = response.success && response.data ? response.data : [];
  const error = response.success ? undefined : response.error?.message;

  return (
    <div className="container mx-auto px-4 py-12">
      <Suspense
        fallback={
          <div className="flex h-32 items-center justify-center">
            <div className="border-primary h-12 w-12 animate-spin rounded-full border-t-2 border-b-2"></div>
            <p className="text-muted-foreground ml-2">Loading questions...</p>
          </div>
        }
      >
        {error ? (
          <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-md border p-4">
            <p>Error loading questions: {error}</p>
            <p>Using default questions instead.</p>
          </div>
        ) : null}

        <ReflexClient userQuestions={userQuestions} />
      </Suspense>
    </div>
  );
}
