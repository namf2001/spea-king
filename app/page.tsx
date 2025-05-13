import { Mic, MessageSquare, Award, Settings } from "lucide-react"
import { ExerciseCard } from "@/components/exercise-card"

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
          <ExerciseCard
            title="Pronunciation Drills"
            description="Practice pronouncing words and phrases with immediate feedback"
            content="Perfect your pronunciation with targeted exercises designed to improve specific sounds and words."
            icon={Mic}
            iconColor="text-blue-500"
            href="/exercises/pronunciation"
            buttonText="Start Practice"
          />

          <ExerciseCard
            title="Conversation Simulations"
            description="Engage in realistic conversations with AI-powered scenarios"
            content="Practice everyday conversations in various scenarios like ordering food, job interviews, or casual chats."
            icon={MessageSquare}
            iconColor="text-green-500"
            href="/exercises/conversation"
            buttonText="Start Conversation"
            buttonVariant="outline"
          />

          <ExerciseCard
            title="Progress Tracker"
            description="View your improvement over time with detailed analytics"
            content="Track your speaking progress, see your strengths and areas for improvement with detailed feedback history."
            icon={Award}
            iconColor="text-amber-500"
            href="/progress"
            buttonText="View Progress"
            buttonVariant="outline"
          />
        </div>

        <div className="mt-12 text-center">
          <a
            href="/settings"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <Settings className="h-4 w-4" />
            Settings
          </a>
        </div>
      </div>
    </main>
  )
}
