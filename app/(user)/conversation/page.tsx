import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { getConversationTopicsByUserId } from "@/app/actions/conversation"
import { defaultTopics } from "./data/topics"
import ConversationClient from "./components/conversation-client"
import ConversationLoading from "./loading"

export default async function ConversationPage() {
  const session = await auth()
  const userId = session?.user?.id

  let topics = [...defaultTopics]
  if (userId) {
    const response = await getConversationTopicsByUserId()
    if (response.success && response.data && response.data.length > 0) {
      const userTopics = response.data.map((topic: any) => ({
        id: topic.id,
        title: topic.title,
        description: topic.description || ""
      }))
      topics = [...topics, ...userTopics]
    }
  }

  return (
    <Suspense fallback={<ConversationLoading />}>
      <ConversationClient topics={topics} />
    </Suspense>
  )
}
