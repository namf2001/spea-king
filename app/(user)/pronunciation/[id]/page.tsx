import { getPronunciationLessonById } from "@/app/actions/pronunciation"
import { notFound } from "next/navigation"
import PronunciationExerciseClient from "../components/pronunciation-exercise-client"
import { auth } from "@/lib/auth"

export default async function PronunciationPage({ params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user) {
        return notFound()
    }
    const response = await getPronunciationLessonById(params.id)
    if (!response.success || !response.data) {
        return notFound()
    }
    const lessons = [response.data]
    
    return <PronunciationExerciseClient lessons={lessons} />
}