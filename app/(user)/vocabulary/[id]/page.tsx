import { notFound } from 'next/navigation';
import { getVocabularyExercise } from '@/app/actions/vocabulary';
import { VocabularyExercisePlayer } from '../components/vocabulary-exercise-player';

export default async function VocabularyExercisePage(props: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await props.params;
  const response = await getVocabularyExercise(resolvedParams.id);

  if (!response.success || !response.data) {
    notFound();
  }

  return <VocabularyExercisePlayer exercise={response.data} />;
}
