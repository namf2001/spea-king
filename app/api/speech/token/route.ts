import { NextResponse } from "next/server"

export async function GET() {
    try {
        const speechKey = process.env.AZURE_SPEECH_KEY
        const speechRegion = process.env.AZURE_SPEECH_REGION

        if (!speechKey || !speechRegion) {
            return NextResponse.json({ error: "Speech service credentials are not configured" }, { status: 500 })
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

        // Return the token and region
        return NextResponse.json({
            token,
            region: speechRegion,
        })
    } catch (error) {
        console.error("Error generating speech token:", error)
        return NextResponse.json({ error: "Failed to generate speech token" }, { status: 500 })
    }
}
