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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Luyện từ vựng
        </h1>
        <p className="text-gray-600">
          Học và thực hành từ vựng tiếng Anh thông qua các bài tập ghép cặp
        </p>
      </div>
      
      <Suspense fallback={<PageLoading />}>
        <VocabularyDashboard exercises={exercises} error={errorMessage} />
      </Suspense>
    </div>
  );
}

