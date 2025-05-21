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
export async function evaluatePronunciation(spokenText: string, targetText: string) {
    try {
        const speechKey = process.env.AZURE_SPEECH_KEY
        const speechRegion = process.env.AZURE_SPEECH_REGION

        if (!speechKey || !speechRegion) {
            throw new Error("Speech service credentials are not configured")
        }

        // Use the Azure Pronunciation Assessment API
        // const endpoint = `https://${speechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`

        // Create reference text object
        // const referenceText = {
        // Prepare the target text without punctuation for assessment
        //    ReferenceText: targetText.replace(/[.,?!]/g, ""),
        //}

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
        return {
            success: true,
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
        }

        // NOTE: In a complete implementation, you would:
        // 1. Receive audio data from the client (e.g., WAV or MP3 format)
        // 2. Send the audio and reference text to the Azure Pronunciation Assessment API
        // 3. Process the detailed response to provide meaningful feedback
        // 4. Highlight specific sounds or words that need improvement
        // 
        // Example API request (using actual audio data):
        //
        // const response = await fetch(endpoint, {
        //     method: "POST",
        //     headers: {
        //         "Ocp-Apim-Subscription-Key": speechKey,
        //         "Content-Type": "audio/wav",
        //         "Pronunciation-Assessment": JSON.stringify(referenceText)
        //     },
        //     body: audioData // Binary audio data
        // })
        //
        // Then process the detailed response from the API
    } catch (error) {
        console.error("Error evaluating pronunciation:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to evaluate pronunciation",
        }
    }
}

export async function generateAIResponse(userInput: string, topicName: string, isInitializing: boolean) {
    const API_KEY = process.env.GROQ_API_KEY;
    const API_ENDPOINT = process.env.GROQ_API_ENDPOINT;

    if (!API_KEY || !API_ENDPOINT) {
        throw new Error("AI service credentials are not configured");
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

        return {
            success: true,
            response: aiResponse,
        };
    } catch (error) {
        console.error(`Error ${isInitializing ? "initializing" : "generating"} conversation:`, error);

        const fallbackResponse = isInitializing
            ? "Let's start with a simple question: What do you usually do in your free time?"
            : "I'm sorry, I'm having trouble connecting. Could you please repeat that?";

        const operationType = isInitializing ? "initialize" : "generate";

        return {
            success: false,
            response: fallbackResponse,
            error: error instanceof Error ? error.message : `Failed to ${operationType} conversation`,
        };
    }
}


// suggestUserResponse is used to generate a user response suggestion based on the AI's question
export async function suggestUserResponse(AIquestion: string, topicName: string, ieltsLevel: string = "4.0") {
    const API_KEY = process.env.GROQ_API_KEY;
    const API_ENDPOINT = process.env.GROQ_API_ENDPOINT;

    if (!API_KEY || !API_ENDPOINT) {
        throw new Error("AI service credentials are not configured");
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

        return {
            success: true,
            response: aiResponse,
        };
    } catch (error) {
        console.error(`Error generating user response suggestion:`, error);
        return {
            success: false,
            response: "I'm sorry, I'm having trouble connecting. Could you please repeat that?",
            error: error instanceof Error ? error.message : "Failed to generate user response suggestion",
        };
    }
}
