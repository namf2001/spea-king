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
              Lỗi Tải Tiến Độ
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {error || 'Không thể tải thống kê'}
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-blue-500 hover:underline"
            >
              ← Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate overall level based on total speaking count
  const getOverallLevel = (count: number) => {
    if (count >= 100) return 'Nâng cao';
    if (count >= 50) return 'Trung cấp';
    if (count >= 20) return 'Sơ cấp +';
    return 'Sơ cấp';
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
          <h1 className="mb-2 text-3xl font-bold">Tiến Độ Học Tập</h1>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tổng Buổi Luyện Nói</CardTitle>
              <CardDescription>Tổng số buổi luyện tập của bạn</CardDescription>
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
                Trình độ {getOverallLevel(stats.totalSpeakingCount)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Chuỗi Luyện Tập</CardTitle>
              <CardDescription>Số ngày luyện tập liên tiếp</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-1 text-3xl font-bold">
                {stats.practiceStreak} ngày
              </div>
              <p className="text-xs text-gray-500">Hãy tiếp tục!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Buổi Học Tháng Này</CardTitle>
              <CardDescription>
                Tổng buổi luyện tập trong tháng này
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-1 text-3xl font-bold">
                {stats.exercisesThisMonth}
              </div>
              <p className="text-xs text-gray-500">
                {stats.pronunciationCount} phát âm,{' '}
                {stats.conversationCount} giao tiếp, {stats.reflexCount}{' '}
                phản xạ
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="progress" className="mb-8">
          <TabsList className="mb-4 grid grid-cols-3">
            <TabsTrigger value="progress">Tiến Độ Theo Thời Gian</TabsTrigger>
            <TabsTrigger value="skills">Phân Tích Kỹ Năng</TabsTrigger>
            <TabsTrigger value="recent">Buổi Học Gần Đây</TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Buổi Luyện Tập Theo Thời Gian</CardTitle>
                <CardDescription>
                  Số lượng buổi luyện nói hàng ngày của bạn
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
                        stroke="#EF9492"
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
                <CardTitle>Phân Tích Loại Luyện Tập</CardTitle>
                <CardDescription>
                  Buổi luyện tập của bạn theo từng danh mục
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
                      <Bar dataKey="value" fill="#EF9492" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Buổi Luyện Tập Gần Đây</CardTitle>
                <CardDescription>
                  Những buổi luyện nói gần đây nhất của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto space-y-4 pr-2">
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
                                'Buổi luyện tập'}
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
                        Chưa có buổi luyện tập nào. Hãy bắt đầu luyện tập để xem tiến độ của bạn!
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
