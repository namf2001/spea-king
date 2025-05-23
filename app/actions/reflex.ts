"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Get all reflex questions for a user (including default ones)
export async function getReflexQuestions() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    // First get user-created questions
    const userQuestions = await prisma.reflexQuestion.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return {
      success: true,
      data: userQuestions
    }
  }
  catch (error) {
    console.error("Error fetching reflex questions:", error)
    return { success: false, error: "Failed to fetch reflex questions", data: [] }
  }
}

// Create a new reflex question
export async function createReflexQuestion(data: {
  question: string
  answer: string
}) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const question = await prisma.reflexQuestion.create({
      data: {
        question: data.question,
        answer: data.answer,
        userId: session.user.id,
      }
    })

    revalidatePath("/reflex")
    return { success: true, question }
  } catch (error) {
    console.error("Error creating question:", error)
    return { success: false, error: "Failed to create question" }
  }
}

// Update a reflex question
export async function updateReflexQuestion(id: string, data: {
  question?: string
  answer?: string
  suggestedAnswer?: string
}) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const question = await prisma.reflexQuestion.findUnique({
      where: { id }
    })

    if (!question || question.userId !== session.user.id) {
      throw new Error("Question not found or not authorized")
    }

    const updatedQuestion = await prisma.reflexQuestion.update({
      where: { id },
      data
    })

    revalidatePath("/reflex")
    return { success: true, question: updatedQuestion }
  } catch (error) {
    console.error("Error updating question:", error)
    return { success: false, error: "Failed to update question" }
  }
}

// Delete a reflex question
export async function deleteReflexQuestion(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  try {
    const question = await prisma.reflexQuestion.findUnique({
      where: { id }
    })

    if (!question || question.userId !== session.user.id) {
      throw new Error("Question not found or not authorized")
    }

    await prisma.reflexQuestion.delete({
      where: { id }
    })

    revalidatePath("/reflex")
    return { success: true }
  } catch (error) {
    console.error("Error deleting question:", error)
    return { success: false, error: "Failed to delete question" }
  }
}

// Generate AI suggestion for an answer
export async function generateAnswerSuggestion(questionText: string) {
  try {
    // For real implementation, you'd call an AI service like OpenAI API here
    // For this example, we'll create a simple function to generate suggestions

    const generateSuggestion = (question: string) => {
      // Simple templates for different question types
      if (question.toLowerCase().includes("your name")) {
        return "My name is [Your Name]. I'm pleased to meet you."
      }
      if (question.toLowerCase().includes("from") || question.toLowerCase().includes("where")) {
        return "I'm originally from [Your Country/City], but now I live in [Current Location]."
      }
      if (question.toLowerCase().includes("hobby") || question.toLowerCase().includes("interest")) {
        return "In my free time, I enjoy [Your Hobbies]. I find it relaxing and fulfilling."
      }
      if (question.toLowerCase().includes("job") || question.toLowerCase().includes("work") ||
        question.toLowerCase().includes("profession") || question.toLowerCase().includes("living")) {
        return "I work as a [Your Profession]. I've been in this field for [Time Period]."
      }
      if (question.toLowerCase().includes("future") || question.toLowerCase().includes("goal") ||
        question.toLowerCase().includes("years")) {
        return "In the future, I hope to [Your Goals]. I'm working towards this by [Your Actions]."
      }
      if (question.toLowerCase().includes("strength") || question.toLowerCase().includes("weakness")) {
        return "My greatest strength is [Your Strength]. However, I'm still working on improving [Your Weakness]."
      }

      // Default generic response
      return "I would respond by saying [Your Personal Answer]. This is because [Your Reasoning]."
    }

    const suggestion = generateSuggestion(questionText)

    return { success: true, suggestion }
  } catch (error) {
    console.error("Error generating suggestion:", error)
    return { success: false, error: "Failed to generate answer suggestion" }
  }
}