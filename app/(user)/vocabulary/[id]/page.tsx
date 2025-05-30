import { notFound } from 'next/navigation';
import { getVocabularyExercise } from '@/app/actions/vocabulary';
import { VocabularyExercisePlayer } from '../components/vocabulary-exercise-player';

interface VocabularyExercisePageProps {
  params: Promise<{ id: string }>;
}

export default async function VocabularyExercisePage({ params }: VocabularyExercisePageProps) {
  const resolvedParams = await params;
  const exercise = await getVocabularyExercise(resolvedParams.id);

  if (!exercise) {
    notFound();
  }

  return <VocabularyExercisePlayer exercise={exercise} />;
}