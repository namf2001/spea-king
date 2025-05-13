"use server"

import { cookies } from "next/headers"

// Server Action to get a speech token
export async function getSpeechToken() {
    try {
        const speechKey = process.env.AZURE_SPEECH_KEY
        const speechRegion = process.env.AZURE_SPEECH_REGION

        if (!speechKey || !speechRegion) {
            throw new Error("Speech service credentials are not configured")
        }

        // Get token from Azure Speech Service
        const tokenResponse = await fetch(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
            method: "POST",
            headers: {
                "Ocp-Apim-Subscription-Key": speechKey,
                "Content-Type": "application/json",
            },
        })

        if (!tokenResponse.ok) {
            throw new Error(`Failed to get token: ${tokenResponse.status} ${tokenResponse.statusText}`)
        }

        // Get the token as text
        const token = await tokenResponse.text()

        // Store token in a cookie with expiration (10 minutes - Azure token lifetime)
        const tokenExpiry = new Date()
        tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 9) // Set to 9 minutes to refresh before expiration

        const cookieStore = await cookies()
        cookieStore.set("speech_token", token, {
            expires: tokenExpiry,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        })

        // Return the token and region
        return {
            success: true,
            token,
            region: speechRegion,
        }
    } catch (error) {
        console.error("Error generating speech token:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to generate speech token",
        }
    }
}

// Server Action to evaluate pronunciation
export async function evaluatePronunciation(spokenText: string, targetText: string, focusSound: string) {
    try {
        // This is a simplified scoring algorithm
        // In a real app, you would use Azure's pronunciation assessment API
        const normalizedTarget = targetText.toLowerCase().replace(/[.,?!]/g, "")
        const normalizedSpoken = spokenText.toLowerCase().replace(/[.,?!]/g, "")

        // Simple word match ratio
        const targetWords = normalizedTarget.split(" ")
        const spokenWords = normalizedSpoken.split(" ")

        let matchedWords = 0
        for (const targetWord of targetWords) {
            if (spokenWords.includes(targetWord)) {
                matchedWords++
            }
        }

        const matchRatio = targetWords.length > 0 ? (matchedWords / targetWords.length) * 100 : 0
        const calculatedScore = Math.round(matchRatio)

        // Generate feedback based on score
        let feedback = ""
        if (calculatedScore >= 90) {
            feedback = "Excellent pronunciation! You've mastered this phrase."
        } else if (calculatedScore >= 70) {
            feedback = `Good job! Try to focus more on the '${focusSound}' sound.`
        } else if (calculatedScore >= 50) {
            feedback = `Keep practicing. Pay special attention to the '${focusSound}' sound.`
        } else {
            feedback = "Let's try again. Listen to the example and focus on each word carefully."
        }

        return {
            success: true,
            score: calculatedScore,
            feedback,
        }
    } catch (error) {
        console.error("Error evaluating pronunciation:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to evaluate pronunciation",
        }
    }
}

// Server Action to generate conversation response
export async function generateConversationResponse(userInput: string, scenarioId: string) {
    try {
        let response = ""
        const lowerInput = userInput.toLowerCase()

        // Restaurant scenario responses
        if (scenarioId === "restaurant") {
            if (lowerInput.includes("reservation") || lowerInput.includes("book")) {
                response = "I see. What time would you like to dine with us today?"
            } else if (lowerInput.includes("menu") || lowerInput.includes("recommend")) {
                response = "Our chef's special today is grilled salmon with seasonal vegetables. Would you like to try that?"
            } else if (lowerInput.includes("order") || lowerInput.includes("like")) {
                response = "Excellent choice! Would you like any appetizers or drinks with that?"
            } else {
                response = "Of course. Let me show you to your table. Would you prefer a window seat?"
            }
        }
        // Interview scenario responses
        else if (scenarioId === "interview") {
            if (lowerInput.includes("experience") || lowerInput.includes("work")) {
                response = "That's impressive experience. What would you say is your greatest professional achievement?"
            } else if (lowerInput.includes("strength") || lowerInput.includes("good at")) {
                response = "Those are valuable strengths. How about challenges or areas you're working to improve?"
            } else if (lowerInput.includes("question") || lowerInput.includes("ask")) {
                response =
                    "Great question. Our company culture emphasizes collaboration and innovation. How do you feel about working in team environments?"
            } else {
                response =
                    "Thank you for sharing that. Could you tell me about a time when you faced a difficult challenge at work and how you handled it?"
            }
        }
        // Shopping scenario responses
        else if (scenarioId === "shopping") {
            if (lowerInput.includes("looking") || lowerInput.includes("find")) {
                response = "I can help you find that. What size and color are you looking for?"
            } else if (lowerInput.includes("price") || lowerInput.includes("cost") || lowerInput.includes("expensive")) {
                response = "That item is $49.99. We also have a sale on similar items if you're interested."
            } else if (lowerInput.includes("try") || lowerInput.includes("fitting")) {
                response = "The fitting rooms are just over there to your right. Let me know if you need a different size."
            } else {
                response = "Is there anything else I can help you with today?"
            }
        }

        return {
            success: true,
            response,
        }
    } catch (error) {
        console.error("Error generating conversation response:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to generate response",
        }
    }
}
