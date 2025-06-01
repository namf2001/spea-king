import { Suspense } from 'react';
import PronunciationContent from './components/pronunciation-content';
import LessonsSkeleton from './loading';
import { auth } from '@/lib/auth';
import { getPronunciationLessonsByUserId } from '@/app/actions/pronunciation';
import { notFound } from 'next/navigation';

export default async function PronunciationPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const response = await getPronunciationLessonsByUserId();
  const lessons = response.data || [];
  const error = response.success ? undefined : response.error?.message;

  return (
    <Suspense fallback={<LessonsSkeleton />}>
      <div className="container mx-auto mb-12 px-4 py-12 md:mb-0">
        <PronunciationContent lessons={lessons} error={error} />
      </div>
    </Suspense>
  );
}
