import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { getConversationTopicsByUserId } from "@/app/actions/conversation"
import { defaultTopics } from "./data/topics"
import ConversationClient from "./components/conversation-client"

export default async function ConversationPage() {
  // Get the current authenticated user
  const session = await auth()
  const userId = session?.user?.id
  
  // Fetch user's conversation topics if they're authenticated
  let topics = [...defaultTopics] // Create a copy of default topics
  
  if (userId) {
    const response = await getConversationTopicsByUserId({ userId })
    
    // If successful and user has topics, add them to defaults
    if (response.success && response.data && response.data.length > 0) {
      const userTopics = response.data.map((topic: any) => ({
        id: topic.id,
        title: topic.title,
        description: topic.description || ""
      }))
      
      // Combine default topics with user topics
      topics = [...topics, ...userTopics]
    }
  }
  
  return (
    <Suspense fallback={<div>Loading conversation...</div>}>
      <ConversationClient topics={topics} />
    </Suspense>
  )
}
