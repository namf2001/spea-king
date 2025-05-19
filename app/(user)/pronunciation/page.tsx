"use client"

import { Suspense } from "react"
import PronunciationLessonsContent from "./components/pronunciation-lessons-content"
import LessonsSkeleton from "./loading"
import { auth } from "@/lib/auth"
import { getPronunciationLessonsByUserId } from "@/app/actions/pronunciation"
import { notFound } from "next/navigation"
import { Mic } from "lucide-react"


export default async function PronunciationPage() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        notFound();
    }

    const lessons = await getPronunciationLessonsByUserId({ userId })

    return (
        <Suspense fallback={<LessonsSkeleton />}>
            <div className="container mx-auto py-12 px-4">
                <div
                    className="max-w-4xl mx-auto animate-fadeIn"
                >
                    <div
                        className="flex items-center gap-3 mb-8 animate-slideInLeft"
                    >
                        <div className="bg-primary p-2 rounded-full relative overflow-hidden">
                            <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-white relative z-10" />
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Pronunciation Practice</h1>
                    </div>
                    <PronunciationLessonsContent lessons={lessons} userId={userId} />
                </div>
            </div>
        </Suspense>
    )
}

