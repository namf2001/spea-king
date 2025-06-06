import { Suspense } from 'react';
import { getConversationTopicsByUserId } from '@/app/actions/conversation';
import { defaultTopics } from './data/topics';
import ConversationClient from './components/conversation-client';
import ConversationLoading from './loading';
import { generateMetadata as generateOGMetadata } from '@/lib/og-metadata';

export const metadata = generateOGMetadata({
  title: 'Conversation Practice - SpeaKing',
  description: 'Practice real-world conversations with AI partners on various topics',
  url: '/conversation',
});

// Force dynamic rendering since we use authentication
export const dynamic = 'force-dynamic';

export default async function ConversationPage() {
  let topics = [...defaultTopics];
  const response = await getConversationTopicsByUserId();
  if (response.success && response.data && response.data.length > 0) {
    const userTopics = response.data.map((topic: any) => ({
      id: topic.id,
      title: topic.title,
      description: topic.description || '',
    }));
    topics = [...topics, ...userTopics];
  }

  return (
    <Suspense fallback={<ConversationLoading />}>
      <ConversationClient topics={topics} />
    </Suspense>
  );
}
