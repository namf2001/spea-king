import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { getReflexQuestions } from "@/app/actions/reflex"
import { notFound } from "next/navigation"
import ReflexClient from "./components/reflex-client"

export default async function ReflexPage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        notFound();
    }

    // Fetch user questions from the database
    const response = await getReflexQuestions()
    const userQuestions = response.success && response.data ? response.data : []
    const error = response.success ? undefined : response.error?.message

    return (
        <div className="container mx-auto px-4 py-12">
            <Suspense fallback={
                <div className="h-32 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="ml-2 text-muted-foreground">Loading questions...</p>
                </div>
            }>
                {error ? (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
                        <p>Error loading questions: {error}</p>
                        <p>Using default questions instead.</p>
                    </div>
                ) : null}
                
                <ReflexClient userQuestions={userQuestions} />
            </Suspense>
        </div>
    )
}