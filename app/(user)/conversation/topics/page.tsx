import { Suspense } from "react"
import ConversationTopicsContent from "../components/conversation-topics-content"
import { auth } from "@/lib/auth"
import { getConversationTopicsByUserId } from "@/app/actions/conversation"
import { notFound } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default async function TopicsPage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        notFound();
    }

    // Fetch user's conversation topics
    const response = await getConversationTopicsByUserId({ userId })
    const topics = response.data || []
    const error = response.success ? undefined : response.error

    return (
        <Suspense fallback={<TopicsLoading />}>
            <div className="container mx-auto py-12 px-4">
                <div className="max-w-4xl mx-auto animate-fadeIn">
                    <ConversationTopicsContent 
                        topics={topics} 
                        userId={userId} 
                        error={error} 
                    />
                </div>
            </div>
        </Suspense>
    )
}

function TopicsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={`skeleton-${i}-${Math.random().toString(36).substring(2, 7)}`} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="bg-muted p-4 flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}