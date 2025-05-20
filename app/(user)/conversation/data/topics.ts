export interface Topic {
  id: string
  title: string
  description: string
}

export const defaultTopics: Topic[] = [
  {
    id: "restaurant",
    title: "At a Restaurant",
    description: "Practice ordering food, making reservations, and discussing menu options at a restaurant."
  },
  {
    id: "interview",
    title: "Job Interview",
    description: "Practice answering common job interview questions and discussing your qualifications and experience."
  },
  {
    id: "shopping",
    title: "Shopping",
    description: "Practice asking for help, discussing products, sizes, and prices while shopping at retail stores."
  }
]