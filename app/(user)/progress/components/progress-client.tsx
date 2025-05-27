'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { StatsData } from '@/types/progress';

interface ProgressClientProps {
  stats: StatsData | null;
  error?: string;
}

export default function ProgressClient({ stats, error }: ProgressClientProps) {
  if (error || !stats) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="py-20 text-center">
            <h2 className="mb-2 text-xl font-semibold">
              Error Loading Progress
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {error || 'Failed to load statistics'}
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-blue-500 hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate overall level based on total speaking count
  const getOverallLevel = (count: number) => {
    if (count >= 100) return 'Advanced';
    if (count >= 50) return 'Intermediate';
    if (count >= 20) return 'Beginner Plus';
    return 'Beginner';
  };

  // Calculate percentage for progress bar
  const getProgressPercentage = (count: number) => {
    const maxForLevel =
      count >= 100 ? 200 : count >= 50 ? 100 : count >= 20 ? 50 : 20;
    return Math.min((count / maxForLevel) * 100, 100);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-block text-blue-500 hover:underline"
          >
            ← Back to Home
          </Link>
          <h1 className="mb-2 text-3xl font-bold">Your Progress</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your English speaking improvement over time
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Speaking Sessions</CardTitle>
              <CardDescription>Your overall practice count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-center text-3xl font-bold">
                {stats.totalSpeakingCount}
              </div>
              <Progress
                value={getProgressPercentage(stats.totalSpeakingCount)}
                className="h-2"
              />
              <p className="mt-2 text-center text-xs text-gray-500">
                {getOverallLevel(stats.totalSpeakingCount)} Level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Practice Streak</CardTitle>
              <CardDescription>Consecutive days practiced</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-1 text-3xl font-bold">
                {stats.practiceStreak} days
              </div>
              <p className="text-xs text-gray-500">Keep it up!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sessions This Month</CardTitle>
              <CardDescription>
                Total practice sessions this month
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-1 text-3xl font-bold">
                {stats.exercisesThisMonth}
              </div>
              <p className="text-xs text-gray-500">
                {stats.pronunciationCount} pronunciation,{' '}
                {stats.conversationCount} conversation, {stats.reflexCount}{' '}
                reflex
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="progress" className="mb-8">
          <TabsList className="mb-4 grid grid-cols-3">
            <TabsTrigger value="progress">Practice Over Time</TabsTrigger>
            <TabsTrigger value="skills">Skills Breakdown</TabsTrigger>
            <TabsTrigger value="recent">Recent Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Practice Sessions Over Time</CardTitle>
                <CardDescription>
                  Your daily speaking practice count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stats.progressOverTime}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 'dataMax + 1']} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Practice Type Breakdown</CardTitle>
                <CardDescription>
                  Your practice sessions by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.skillsBreakdown}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 'dataMax + 1']} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Practice Sessions</CardTitle>
                <CardDescription>
                  Your latest speaking practice sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentRecords.length > 0 ? (
                    stats.recentRecords.map((record) => (
                      <div
                        key={record.id}
                        className="border-b pb-4 last:border-0"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{record.type}</h3>
                            <p className="text-sm text-gray-500">
                              {record.topicTitle ||
                                record.questionText ||
                                'Practice session'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {record.duration}s
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">
                        No practice sessions yet. Start practicing to see your
                        progress!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
