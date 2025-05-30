import { notFound } from 'next/navigation';
import { getVocabularyExercise } from '@/app/actions/vocabulary';
import { VocabularyExercisePlayer } from '../components/vocabulary-exercise-player';

interface VocabularyExercisePageProps {
  params: {
    id: string;
  };
}

export default async function VocabularyExercisePage({ params }: VocabularyExercisePageProps) {
  const exercise = await getVocabularyExercise(params.id);
  
  if (!exercise) {
    notFound();
  }

  return <VocabularyExercisePlayer exercise={exercise} />;
}