export interface Exercise {
    id: number
    text: string
    difficulty: "easy" | "medium" | "hard"
    focusSound: string
}

export const exercises: Exercise[] = [
    {
        id: 1,
        text: "The quick brown fox jumps over the lazy dog.",
        difficulty: "easy",
        focusSound: "th",
    },
    {
        id: 2,
        text: "She sells seashells by the seashore.",
        difficulty: "medium",
        focusSound: "s",
    },
    {
        id: 3,
        text: "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
        difficulty: "hard",
        focusSound: "w",
    },
    {
        id: 4,
        text: "Thirty-three thirsty, thundering thoroughbreds.",
        difficulty: "hard",
        focusSound: "th",
    },
    {
        id: 5,
        text: "Red lorry, yellow lorry.",
        difficulty: "medium",
        focusSound: "r/l",
    },
]
