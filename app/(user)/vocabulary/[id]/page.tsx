import { notFound } from 'next/navigation';
import { getVocabularyExercise } from '@/app/actions/vocabulary';
import { VocabularyExercisePlayer } from '../components/vocabulary-exercise-player';

export default async function VocabularyExercisePage(props: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await props.params;
  const exercise = await getVocabularyExercise(resolvedParams.id);

  if (!exercise) {
    notFound();
  }

  return <VocabularyExercisePlayer exercise={exercise} />;
}