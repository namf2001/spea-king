import { Suspense } from 'react';
import { getVocabularyExercises } from '@/app/actions/vocabulary';
import { VocabularyDashboard } from './components/vocabulary-dashboard';
import { PageLoading } from '@/components/animations/page-loading';

export default async function VocabularyPage() {
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
        <VocabularyContent />
      </Suspense>
    </div>
  );
}

async function VocabularyContent() {
  const exercises = await getVocabularyExercises();
  
  return <VocabularyDashboard exercises={exercises} />;
}