'use client';

import React, { useState, useContext, createContext } from 'react';

type SpeakingStats = {
  totalSpeakingCount: number;
  practiceStreak: number;
  exercisesThisMonth: number;
  pronunciationCount: number;
  conversationCount: number;
  reflexCount: number;
};

const SpeakingStatsContext = createContext<
  | [
      SpeakingStats | null,
      React.Dispatch<React.SetStateAction<SpeakingStats | null>>,
    ]
  | undefined
>(undefined);

export function SpeakingStatsProvider({
  children,
  initialStats,
}: {
  children: React.ReactNode;
  initialStats: SpeakingStats | null;
}) {
  const [optimisticStats, setOptimisticStats] = useState<SpeakingStats | null>(
    null,
  );

  const stats = optimisticStats !== null ? optimisticStats : initialStats;

  return (
    <SpeakingStatsContext.Provider value={[stats, setOptimisticStats]}>
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
