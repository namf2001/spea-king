import { Suspense } from 'react';
import { getVocabularyExercises } from '@/app/actions/vocabulary';
import { VocabularyClinet } from './components/vocabulary-clinet';
import { PageLoading } from '@/components/animations/page-loading';

export default async function VocabularyPage() {
  const exercises = await getVocabularyExercises();
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
        <VocabularyClinet exercises={exercises} />
      </Suspense>
    </div>
  );
}

