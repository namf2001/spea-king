"use server"

import { cookies } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ApiResponse, createSuccessResponse, createErrorResponse } from "@/types/response"

// Server Action to get a speech token
export async function getSpeechToken(): Promise<ApiResponse<{ token: string, region: string }>> {
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

        // Return the token and region using standardized response format
        return createSuccessResponse({ token, region: speechRegion })
    } catch (error) {
        console.error("Error generating speech token:", error)
        return createErrorResponse(
            "SPEECH_TOKEN_ERROR",
            error instanceof Error ? error.message : "Failed to generate speech token"
        )
    }
}

// Server Action to evaluate pronunciation
export async function evaluatePronunciation(spokenText: string, targetText: string): Promise<ApiResponse<{
    score: number,
    feedback: string,
    details: {
        pronunciationScore: number,
        fluencyScore: number,
        completenessScore: number,
        words: Array<{
            word: string,
            score: number,
            errorType: string | null
        }>
    }
}>> {
    try {
        const speechKey = process.env.AZURE_SPEECH_KEY
        const speechRegion = process.env.AZURE_SPEECH_REGION

        if (!speechKey || !speechRegion) {
            throw new Error("Speech service credentials are not configured")
        }

        // Create audio data from the spokenText
        // In a real implementation, this should be audio data from the client
        // Here we're simulating with a placeholder
        // This is where you would process audio data from the client
        if (!spokenText) {
            throw new Error("No spoken text was provided")
        }

        // For demonstration, fall back to text comparison if we don't have audio
        // In a real implementation, you would use real audio data

        // This is a simplified scoring algorithm for the example
        // In a production app, you would process actual audio data
        const normalizedTarget = targetText.toLowerCase().replace(/[.,?!]/g, "")
        const normalizedSpoken = spokenText.toLowerCase().replace(/[.,?!]/g, "")

        // Simple word match ratio
        const targetWords = normalizedTarget.split(" ")
        const spokenWords = normalizedSpoken.split(" ")

        let matchedWords = 0
        let mispronunciations = []

        // Check each target word against spoken words
        for (let i = 0; i < targetWords.length; i++) {
            const targetWord = targetWords[i]
            if (spokenWords.includes(targetWord)) {
                matchedWords++
            } else {
                // Track mispronounced words
                mispronunciations.push({
                    word: targetWord,
                    position: i,
                    suggestion: "Pay attention to this word"
                })
            }
        }

        const matchRatio = targetWords.length > 0 ? (matchedWords / targetWords.length) * 100 : 0
        const calculatedScore = Math.round(matchRatio)

        // Calculate fluency and completeness scores
        // In a real implementation, these would come from the API
        const pronunciationScore = calculatedScore
        const fluencyScore = calculatedScore > 80 ? calculatedScore - 10 : calculatedScore
        const completenessScore = (spokenWords.length / targetWords.length) * 100

        // Generate detailed feedback based on score
        let feedback = ""
        if (calculatedScore >= 90) {
            feedback = "Excellent pronunciation! You've mastered this phrase."
        } else if (calculatedScore >= 70) {
            feedback = `Good job! Try to focus more`
        } else if (calculatedScore >= 50) {
            feedback = `Keep practicing.`
        } else {
            feedback = "Let's try again. Listen to the example and focus on each word carefully."
        }

        // Create detailed feedback that simulates the Pronunciation Assessment API response
        // In a real implementation, this would come from the API
        return createSuccessResponse({
            score: calculatedScore,
            feedback,
            details: {
                pronunciationScore,
                fluencyScore,
                completenessScore,
                words: targetWords.map((word, index) => {
                    const mispronounced = mispronunciations.some(m => m.position === index)
                    return {
                        word,
                        score: mispronounced ? Math.floor(Math.random() * 50) + 30 : Math.floor(Math.random() * 30) + 70,
                        errorType: mispronounced ? "Mispronunciation" : null
                    }
                }),
            }
        })
    } catch (error) {
        console.error("Error evaluating pronunciation:", error)
        return createErrorResponse(
            "PRONUNCIATION_EVALUATION_ERROR",
            error instanceof Error ? error.message : "Failed to evaluate pronunciation"
        )
    }
}

export async function generateAIResponse(userInput: string, topicName: string, isInitializing: boolean): Promise<ApiResponse<{ response: string }>> {
    const API_KEY = process.env.GROQ_API_KEY;
    const API_ENDPOINT = process.env.GROQ_API_ENDPOINT;

    if (!API_KEY || !API_ENDPOINT) {
        return createErrorResponse(
            "AI_CONFIG_ERROR",
            "AI service credentials are not configured"
        );
    }

    const topicTitle = topicName || "General Topics";

    const prompt = isInitializing
        ? `Act like an IELTS Speaking examiner. Start the interview with a natural IELTS-style question related to the topic: "${topicTitle}". Keep the question clear, relevant, and similar in style to Part 1 or Part 3 of the IELTS Speaking test.`
        : userInput;

    const systemContent = isInitializing
        ? `You are acting as an IELTS Speaking examiner. Your job is to begin an IELTS Speaking conversation with the candidate. 
Ask 1 clear, natural, and relevant IELTS-style question related to the topic "${topicTitle}". 
Do not add greetings or explanations — just ask the question like in a real IELTS interview.`
        : `You are continuing an IELTS-style conversation with a candidate about "${topicTitle}". 
Give natural, relevant follow-ups. Avoid long responses. Ask short, clear IELTS-style questions when appropriate.`;

    const messages = [
        {
            role: "system",
            content: systemContent
        },
        {
            role: "user",
            content: prompt
        }
    ];

    try {
        console.log("Sending request to AI API with messages:", messages);
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                messages: messages,
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`AI API error: ${response.status} ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        console.log(`${isInitializing ? "Initial" : ""} AI Response:`, aiResponse);

        return createSuccessResponse({ response: aiResponse });
    } catch (error) {
        console.error(`Error ${isInitializing ? "initializing" : "generating"} conversation:`, error);

        const fallbackResponse = isInitializing
            ? "Let's start with a simple question: What do you usually do in your free time?"
            : "I'm sorry, I'm having trouble connecting. Could you please repeat that?";

        const operationType = isInitializing ? "initialize" : "generate";

        return createErrorResponse(
            `AI_${operationType.toUpperCase()}_ERROR`,
            error instanceof Error ? error.message : `Failed to ${operationType} conversation`,
            { response: fallbackResponse }
        );
    }
}

// suggestUserResponse is used to generate a user response suggestion based on the AI's question
export async function suggestUserResponse(AIquestion: string, topicName: string, ieltsLevel: string = "4.0"): Promise<ApiResponse<{ response: string }>> {
    const API_KEY = process.env.GROQ_API_KEY;
    const API_ENDPOINT = process.env.GROQ_API_ENDPOINT;

    if (!API_KEY || !API_ENDPOINT) {
        return createErrorResponse(
            "AI_CONFIG_ERROR",
            "AI service credentials are not configured"
        );
    }

    // Validate IELTS level input
    const validLevels = ["4.0", "5.0", "6.0", "6.5", "7.0", "7.5", "8.0", "9.0"];
    const level = validLevels.includes(ieltsLevel) ? ieltsLevel : "6.0";

    const topicTitle = topicName || "English Conversation";
    const prompt = AIquestion;

    const systemPrompt = `You are helping a learner improve their English speaking. 
Respond with a short and natural sentence that this learner could say in a conversation. 
Make sure the language, grammar, and vocabulary match an IELTS level of ${level}. 
Keep it under 3 sentences, and do not respond with another question.`;

    const topicContext = `The conversation topic is: "${topicTitle}".`;

    const systemContent = `${systemPrompt} ${topicContext}`;

    const messages = [
        {
            role: "system",
            content: systemContent
        },
        {
            role: "user",
            content: prompt
        }
    ];

    try {
        console.log("Sending request to AI API with messages:", messages);
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                messages: messages,
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`AI API error: ${response.status} ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        console.log(`User Response Suggestion:`, aiResponse);

        return createSuccessResponse({ response: aiResponse });
    } catch (error) {
        console.error(`Error generating user response suggestion:`, error);
        
        return createErrorResponse(
            "AI_SUGGESTION_ERROR",
            error instanceof Error ? error.message : "Failed to generate user response suggestion",
            { response: "I'm sorry, I'm having trouble connecting. Could you please repeat that?" }
        );
    }
}

// suggestUserAnswer is used to generate a detailed answer suggestion based on the user's question
export async function suggestUserAnswer(question: string, wordLimit: number = 70): Promise<ApiResponse<{ response: string }>> {
    const API_KEY = process.env.GROQ_API_KEY;
    const API_ENDPOINT = process.env.GROQ_API_ENDPOINT;

    if (!API_KEY || !API_ENDPOINT) {
        return createErrorResponse(
            "AI_CONFIG_ERROR",
            "AI service credentials are not configured"
        );
    }

    // Validate word limit to be between 70 and 100
    const validatedWordLimit = Math.min(Math.max(wordLimit || 70, 70), 100);

    const systemContent = `You are an English learning assistant.
Answer the user's question clearly and concisely.
Your response must be around ${validatedWordLimit} words, suitable for an IELTS Band 6.0 to 7.0 candidate.
Use natural grammar and vocabulary, and avoid long or complex sentences.
Do not exceed ${validatedWordLimit + 5} words.`;

    const messages = [
        {
            role: "system",
            content: systemContent
        },
        {
            role: "user",
            content: question
        }
    ];

    try {
        console.log("Sending request to AI API with messages:", messages);
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                messages: messages,
                max_tokens: Math.round(validatedWordLimit * 1.7), // Estimate tokens based on wordLimit
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`AI API error: ${response.status} ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        console.log("AI Answer Response:", aiResponse);

        return createSuccessResponse({ response: aiResponse });
    } catch (error) {
        console.error("Error generating answer:", error);
        
        return createErrorResponse(
            "AI_ANSWER_ERROR",
            error instanceof Error ? error.message : "Failed to generate answer",
            { response: "I'm sorry, I couldn't generate an answer at this time. Please try again later." }
        );
    }
}

// New action to save speaking record
export async function saveSpeakingRecord(
    type: 'pronunciation' | 'conversation' | 'reflex',
    duration: number,
    conversationTopicId?: string,
    reflexQuestionId?: string
): Promise<ApiResponse<{ id: string }>> {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return createErrorResponse(
                "AUTH_ERROR",
                "Unauthorized. Please log in to save speaking record."
            )
        }

        const record = await prisma.userSpeakingRecord.create({
            data: {
                userId: session.user.id,
                duration,
                conversationTopicId,
                reflexQuestionId,
            },
        })

        return createSuccessResponse({ id: record.id })
    } catch (error) {
        console.error("Error saving speaking record:", error)
        return createErrorResponse(
            "SAVE_RECORD_ERROR",
            "Failed to save speaking record"
        )
    }
}

// New action to get user statistics
export async function getUserSpeakingStats(): Promise<ApiResponse<{
    totalSpeakingCount: number
    practiceStreak: number
    exercisesThisMonth: number
    pronunciationCount: number
    conversationCount: number
    reflexCount: number
    recentRecords: Array<{
        id: string
        type: string
        duration: number
        date: string
        topicTitle?: string
        questionText?: string
    }>
    progressOverTime: Array<{
        date: string
        count: number
    }>
    skillsBreakdown: Array<{
        name: string
        value: number
    }>
}>> {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return createErrorResponse(
                "AUTH_ERROR",
                "Unauthorized. Please log in to view statistics."
            )
        }

        const userId = session.user.id

        // Get all speaking records for the user
        const allRecords = await prisma.userSpeakingRecord.findMany({
            where: { userId },
            include: {
                conversationTopic: true,
                reflexQuestion: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        // Calculate total speaking count
        const totalSpeakingCount = allRecords.length

        // Calculate practice streak (consecutive days with practice)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        let practiceStreak = 0
        let checkDate = new Date(today)
        
        while (true) {
            const dayStart = new Date(checkDate)
            const dayEnd = new Date(checkDate)
            dayEnd.setHours(23, 59, 59, 999)
            
            const hasRecordOnDay = allRecords.some(record => {
                const recordDate = new Date(record.createdAt)
                return recordDate >= dayStart && recordDate <= dayEnd
            })
            
            if (hasRecordOnDay) {
                practiceStreak++
                checkDate.setDate(checkDate.getDate() - 1)
            } else {
                break
            }
        }

        // Calculate exercises this month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const exercisesThisMonth = allRecords.filter(record => 
            new Date(record.createdAt) >= startOfMonth
        ).length

        // Count by type
        const pronunciationCount = allRecords.filter(record => 
            !record.conversationTopicId && !record.reflexQuestionId
        ).length
        
        const conversationCount = allRecords.filter(record => 
            record.conversationTopicId
        ).length
        
        const reflexCount = allRecords.filter(record => 
            record.reflexQuestionId
        ).length

        // Recent records (last 10)
        const recentRecords = allRecords.slice(0, 10).map(record => ({
            id: record.id,
            type: record.conversationTopicId ? 'Conversation' : 
                  record.reflexQuestionId ? 'Reflex' : 'Pronunciation',
            duration: record.duration,
            date: record.createdAt.toISOString().split('T')[0],
            topicTitle: record.conversationTopic?.title,
            questionText: record.reflexQuestion?.question,
        }))

        // Progress over time (last 7 days)
        const progressOverTime = []
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            
            const dayStart = new Date(date)
            const dayEnd = new Date(date)
            dayEnd.setHours(23, 59, 59, 999)
            
            const count = allRecords.filter(record => {
                const recordDate = new Date(record.createdAt)
                return recordDate >= dayStart && recordDate <= dayEnd
            }).length
            
            progressOverTime.push({
                date: `${date.getMonth() + 1}/${date.getDate()}`,
                count
            })
        }

        // Skills breakdown based on practice frequency
        const skillsBreakdown = [
            { name: 'Pronunciation', value: pronunciationCount },
            { name: 'Conversation', value: conversationCount },
            { name: 'Reflex Training', value: reflexCount },
            { name: 'Fluency', value: Math.floor(totalSpeakingCount * 0.7) },
            { name: 'Comprehension', value: Math.floor(totalSpeakingCount * 0.8) },
        ]

        return createSuccessResponse({
            totalSpeakingCount,
            practiceStreak,
            exercisesThisMonth,
            pronunciationCount,
            conversationCount,
            reflexCount,
            recentRecords,
            progressOverTime,
            skillsBreakdown,
        })
    } catch (error) {
        console.error("Error fetching user speaking stats:", error)
        return createErrorResponse(
            "FETCH_STATS_ERROR",
            "Failed to fetch speaking statistics"
        )
    }
}

