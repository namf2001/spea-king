import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { getVocabularyExercises } from '@/app/actions/vocabulary';
import { PageLoading } from '@/components/animations/page-loading';
import { VocabularyDashboard } from './components/vocabulary-dashboard';

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic';

export default async function VocabularyPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  // Fetch vocabulary exercises
  const response = await getVocabularyExercises();
  const exercises = response.success && response.data ? response.data : [];
  const errorMessage = response.success ? undefined : response.error?.message;

  return (
    <Suspense fallback={<PageLoading />}>
      <VocabularyDashboard exercises={exercises} error={errorMessage} />
    </Suspense>
  );
}
