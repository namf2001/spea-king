export interface Question {
    id: number
    question: string
    answer: string
    difficulty: "easy" | "medium" | "hard"
    category: string
}

export const questions: Question[] = [
    {
        id: 1,
        question: "What's your name?",
        answer: "My name is...",
        difficulty: "easy",
        category: "Introduction"
    },
    {
        id: 2,
        question: "Where are you from?",
        answer: "I'm from...",
        difficulty: "easy",
        category: "Introduction"
    },
    {
        id: 3,
        question: "How old are you?",
        answer: "I'm... years old.",
        difficulty: "easy",
        category: "Introduction"
    },
    {
        id: 4,
        question: "What do you do for a living?",
        answer: "I work as a...",
        difficulty: "medium",
        category: "Professional"
    },
    {
        id: 5,
        question: "Could you describe your educational background?",
        answer: "I graduated from... with a degree in...",
        difficulty: "medium",
        category: "Professional"
    },
    {
        id: 6,
        question: "What are your hobbies and interests?",
        answer: "In my free time, I enjoy...",
        difficulty: "medium",
        category: "Personal"
    },
    {
        id: 7,
        question: "How would you describe your personality?",
        answer: "I would describe myself as...",
        difficulty: "hard",
        category: "Personal"
    },
    {
        id: 8,
        question: "What are your strengths and weaknesses?",
        answer: "My strengths include... However, I'm working on improving...",
        difficulty: "hard",
        category: "Professional"
    },
    {
        id: 9,
        question: "Where do you see yourself in five years?",
        answer: "In five years, I hope to...",
        difficulty: "hard",
        category: "Professional"
    },
    {
        id: 10,
        question: "Can you tell me about a challenging situation you've faced and how you overcame it?",
        answer: "I once faced a challenge when... I overcame it by...",
        difficulty: "hard",
        category: "Experience"
    }
]