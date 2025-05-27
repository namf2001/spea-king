import { getPronunciationLessonById } from '@/app/actions/pronunciation';
import { notFound } from 'next/navigation';
import PronunciationClient from '../components/pronunciation-client';
import { auth } from '@/lib/auth';

export default async function PronunciationPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    return notFound();
  }

  const params = await props.params;
  const id = params.id;
  const response = await getPronunciationLessonById(id);
  if (!response.success || !response.data) {
    return notFound();
  }

  const lessons = [response.data];

  return (
    <PronunciationClient
      lessons={lessons}
      userId={session.user.id}
      error={response.success ? undefined : response.error?.message}
    />
  );
}
