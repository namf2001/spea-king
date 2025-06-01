'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

type SpeakingStats = {
  totalSpeakingCount: number;
  practiceStreak: number;
  exercisesThisMonth: number;
  pronunciationCount: number;
  conversationCount: number;
  reflexCount: number;
};

const SpeakingStatsContext = createContext<
  [
    SpeakingStats | null,
    React.Dispatch<React.SetStateAction<SpeakingStats | null>>,
  ] | undefined
>(undefined);

export function SpeakingStatsProvider({
  children,
  initialStats,
}: {
  readonly children: React.ReactNode;
  readonly initialStats: SpeakingStats | null;
}) {
  const [optimisticStats, setOptimisticStats] = useState<SpeakingStats | null>(
    null,
  );

  const stats = optimisticStats ?? initialStats;

  // Wrap context value in useMemo to prevent unnecessary re-renders
  const contextValue = useMemo((): [
    SpeakingStats | null,
    React.Dispatch<React.SetStateAction<SpeakingStats | null>>
  ] => [stats, setOptimisticStats], [stats]);

  return (
    <SpeakingStatsContext.Provider value={contextValue}>
      {children}
    </SpeakingStatsContext.Provider>
  );
}

export function useSpeakingStats() {
  const context = useContext(SpeakingStatsContext);
  if (context === undefined) {
    throw new Error(
      'useSpeakingStats must be used within a SpeakingStatsProvider',
    );
  }
  return context;
}

// Helper functions for optimistic updates
export function useOptimisticSpeakingUpdate() {
  const [, setOptimisticStats] = useSpeakingStats();

  return {
    incrementCount: (type: 'pronunciation' | 'conversation' | 'reflex') => {
      setOptimisticStats((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          totalSpeakingCount: prev.totalSpeakingCount + 1,
          exercisesThisMonth: prev.exercisesThisMonth + 1,
          [`${type}Count`]: (prev as any)[`${type}Count`] + 1,
        };
      });
    },
    resetOptimistic: () => setOptimisticStats(null),
  };
}
