import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { getReflexQuestions } from '@/app/actions/reflex';
import { notFound } from 'next/navigation';
import ReflexClient from './components/reflex-client';
import { generateMetadata as generateOGMetadata } from '@/lib/og-metadata';

export const metadata = generateOGMetadata({
  title: 'Reflex Speaking - SpeaKing',
  description:
    'Practice quick thinking and speaking reflexes with random questions and AI feedback',
  url: '/reflex',
});

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic';

export default async function ReflexPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  // Fetch user questions from the database
  const response = await getReflexQuestions();
  const userQuestions = response.success && response.data ? response.data : [];
  const error = response.success ? undefined : response.error?.message;

  return (
    <div className="container mx-auto px-2 py-8 sm:px-4 sm:py-12">
      <Suspense
        fallback={
          <div className="flex h-32 items-center justify-center">
            <div className="border-primary h-12 w-12 animate-spin rounded-full border-t-2 border-b-2"></div>
            <p className="text-muted-foreground ml-2 text-sm">
              Đang tải câu hỏi...
            </p>
          </div>
        }
      >
        {error ? (
          <div className="bg-destructive/10 border-destructive/20 text-destructive mb-6 rounded-md border p-4">
            <p className="text-sm font-medium">Lỗi khi tải câu hỏi: {error}</p>
            <p className="mt-1 text-xs">Sử dụng câu hỏi mặc định thay thế.</p>
          </div>
        ) : null}

        <ReflexClient userQuestions={userQuestions} />
      </Suspense>
    </div>
  );
}
