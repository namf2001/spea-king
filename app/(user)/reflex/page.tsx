import { Suspense } from "react"
import ReflexContent from "./components/reflex-content"
import LessonsSkeleton from "./loading"
import { auth } from "@/lib/auth"
import { getPronunciationLessonsByUserId } from "@/app/actions/pronunciation"
import { notFound } from "next/navigation"


export default async function PronunciationPage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        notFound();
    }


    return (
        <Suspense fallback={<LessonsSkeleton />}>
            <div className="container mx-auto py-12 px-4">
                <div className="max-w-4xl mx-auto animate-fadeIn">
                    <ReflexContent />
                </div>
            </div>
        </Suspense>
    )
}

