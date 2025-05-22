"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

// Sample progress data
const pronunciationData = [
    { date: "May 1", score: 65 },
    { date: "May 3", score: 68 },
    { date: "May 5", score: 72 },
    { date: "May 8", score: 75 },
    { date: "May 10", score: 80 },
    { date: "May 12", score: 78 },
    { date: "May 13", score: 82 },
]

const skillsData = [
    { name: "Pronunciation", value: 78 },
    { name: "Vocabulary", value: 65 },
    { name: "Grammar", value: 72 },
    { name: "Fluency", value: 68 },
    { name: "Comprehension", value: 85 },
]

const recentExercises = [
    {
        id: 1,
        type: "Pronunciation",
        exercise: "The quick brown fox jumps over the lazy dog.",
        date: "May 13, 2025",
        score: 82,
    },
    {
        id: 2,
        type: "Conversation",
        exercise: "Restaurant Scenario",
        date: "May 12, 2025",
        score: 78,
    },
    {
        id: 3,
        type: "Pronunciation",
        exercise: "She sells seashells by the seashore.",
        date: "May 10, 2025",
        score: 80,
    },
    {
        id: 4,
        type: "Conversation",
        exercise: "Job Interview Scenario",
        date: "May 8, 2025",
        score: 75,
    },
]

export default function ProgressPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
                    <p className="text-gray-600 dark:text-gray-300">Track your English speaking improvement over time</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Overall Score</CardTitle>
                            <CardDescription>Your current proficiency level</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-center mb-2">74%</div>
                            <Progress value={74} className="h-2" />
                            <p className="text-xs text-center mt-2 text-gray-500">Intermediate Level</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Practice Streak</CardTitle>
                            <CardDescription>Consecutive days practiced</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="text-3xl font-bold mb-1">7 days</div>
                            <p className="text-xs text-gray-500">Keep it up!</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Exercises Completed</CardTitle>
                            <CardDescription>Total exercises this month</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="text-3xl font-bold mb-1">24</div>
                            <p className="text-xs text-gray-500">12 pronunciation, 12 conversation</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="progress" className="mb-8">
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="progress">Progress Over Time</TabsTrigger>
                        <TabsTrigger value="skills">Skills Breakdown</TabsTrigger>
                        <TabsTrigger value="recent">Recent Exercises</TabsTrigger>
                    </TabsList>

                    <TabsContent value="progress">
                        <Card>
                            <CardHeader>
                                <CardTitle>Progress Over Time</CardTitle>
                                <CardDescription>Your speaking score improvement</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={pronunciationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="skills">
                        <Card>
                            <CardHeader>
                                <CardTitle>Skills Breakdown</CardTitle>
                                <CardDescription>Your proficiency in different areas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={skillsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis domain={[0, 100]} />
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
                                <CardTitle>Recent Exercises</CardTitle>
                                <CardDescription>Your latest practice sessions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentExercises.map((exercise) => (
                                        <div key={exercise.id} className="border-b pb-4 last:border-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-medium">{exercise.type}</h3>
                                                    <p className="text-sm text-gray-500">{exercise.exercise}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                        {exercise.score}%
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500">{exercise.date}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
