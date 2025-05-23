import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getReflexQuestions } from "@/app/actions/reflex";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import ReflexQuestionsContent from "../components/reflex-questions-content";

export default async function QuestionPage() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        notFound();
    }

    // Fetch user's reflex questions
    const response = await getReflexQuestions();
    const questions = response.data || [];
    const errorMessage = response.success ? undefined : response.error?.message;

    return (
        <Suspense fallback={<QuestionsLoading />}>
            <div className="container mx-auto py-12 px-4">
                <div className="max-w-4xl mx-auto animate-fadeIn">
                    <ReflexQuestionsContent 
                        questions={questions} 
                        userId={userId} 
                        error={errorMessage} 
                    />
                </div>
            </div>
        </Suspense>
    );
}

function QuestionsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
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
  );
}