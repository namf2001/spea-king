'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Topic } from '../data/topics';

interface TopicTabsProps {
  readonly topics: Topic[];
  readonly activeTopic: Topic;
  readonly onTopicChange: (topicId: string) => void;
}

export function TopicTabs({
  topics,
  activeTopic,
  onTopicChange,
}: TopicTabsProps) {
  return (
    <div className="mb-8 space-y-4">
      <Select defaultValue={activeTopic.id} onValueChange={onTopicChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a topic" />
        </SelectTrigger>
        <SelectContent>
          {topics.map((topic) => (
            <SelectItem key={topic.id} value={topic.id}>
              <span>{topic.title}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
