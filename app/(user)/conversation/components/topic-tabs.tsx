"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Topic } from "../data/topics"
import { cn } from "@/lib/utils"

interface TopicTabsProps {
    readonly topics: Topic[]
    readonly activeTopic: Topic
    readonly onTopicChange: (topicId: string) => void
}

export function TopicTabs({ topics, activeTopic, onTopicChange }: TopicTabsProps) {
    // Get grid columns class based on number of topics
    const getGridColumnsClass = () => {
        const count = topics.length;
        if (count <= 3) return "grid-cols-3";
        if (count === 4) return "grid-cols-4";
        return "grid-cols-5"; // Max 5 columns to ensure readability
    };

    return (
        <Tabs defaultValue={activeTopic.id} onValueChange={onTopicChange} className="mb-8">
            <TabsList className={cn("grid mb-4", getGridColumnsClass())}>
                {topics.map((topic) => (
                    <TabsTrigger key={topic.id} value={topic.id}>
                        {topic.title}
                    </TabsTrigger>
                ))}
            </TabsList>

            {topics.map((topic) => (
                <TabsContent key={topic.id} value={topic.id}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{topic.title}</CardTitle>
                            <CardDescription>{topic.description}</CardDescription>
                        </CardHeader>
                    </Card>
                </TabsContent>
            ))}
        </Tabs>
    )
}