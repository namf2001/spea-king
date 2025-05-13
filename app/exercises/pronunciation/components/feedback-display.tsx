import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface FeedbackDisplayProps {
    readonly score: number
    readonly feedback: string
}

export function FeedbackDisplay({ score, feedback }: FeedbackDisplayProps) {
    return (
        <div className="space-y-4">
            <div>
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Accuracy Score</span>
                    <span className="text-sm font-medium">{score}%</span>
                </div>
                <Progress value={score} className="h-2" />
            </div>

            <Alert>
                <AlertDescription>{feedback}</AlertDescription>
            </Alert>
        </div>
    )
}
