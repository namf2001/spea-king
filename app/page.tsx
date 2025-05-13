import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Mic, MessageSquare, Award, Settings } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-4">
            SpeakEasy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Improve your English speaking skills with interactive exercises and AI-powered feedback
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-blue-500" />
                Pronunciation Drills
              </CardTitle>
              <CardDescription>Practice pronouncing words and phrases with immediate feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Perfect your pronunciation with targeted exercises designed to improve specific sounds and words.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/exercises/pronunciation" className="w-full">
                <Button className="w-full">Start Practice</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                Conversation Simulations
              </CardTitle>
              <CardDescription>Engage in realistic conversations with AI-powered scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Practice everyday conversations in various scenarios like ordering food, job interviews, or casual
                chats.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/exercises/conversation" className="w-full">
                <Button className="w-full" variant="outline">
                  Start Conversation
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Progress Tracker
              </CardTitle>
              <CardDescription>View your improvement over time with detailed analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Track your speaking progress, see your strengths and areas for improvement with detailed feedback
                history.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/progress" className="w-full">
                <Button className="w-full" variant="outline">
                  View Progress
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Link href="/settings">
            <Button variant="ghost" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
