interface TranscriptDisplayProps {
    readonly transcript: string
}

export function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
    return (
        <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Your recording:</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                <p>{transcript}</p>
            </div>
        </div>
    )
}
