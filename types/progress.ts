export interface StatsData {
  totalSpeakingCount: number;
  practiceStreak: number;
  exercisesThisMonth: number;
  pronunciationCount: number;
  conversationCount: number;
  reflexCount: number;
  recentRecords: Array<{
    id: string;
    type: string;
    duration: number;
    date: string;
    topicTitle?: string;
    questionText?: string;
  }>;
  progressOverTime: Array<{
    date: string;
    count: number;
  }>;
  skillsBreakdown: Array<{
    name: string;
    value: number;
  }>;
}
