import { Suspense } from 'react';
import { getUserSpeakingStats } from '@/app/actions/speech';
import ProgressClient from './components/progress-client';

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic';

export default async function ProgressPage() {
  const response = await getUserSpeakingStats();
  const stats = response.success && response.data ? response.data : null;
  const error = response.success ? undefined : response.error?.message;

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-center py-20">
              <div className="border-primary h-12 w-12 animate-spin rounded-full border-t-2 border-b-2"></div>
              <p className="text-muted-foreground ml-2">
                Loading your progress...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <ProgressClient stats={stats} error={error} />
    </Suspense>
  );
}
