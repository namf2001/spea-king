import { NextResponse } from "next/server"

// This endpoint generates a token for the Azure Speech service
export async function GET() {
    try {
        const speechKey = process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY
        const speechRegion = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION

        if (!speechKey || !speechRegion) {
            return NextResponse.json({ error: "Speech service credentials are not configured" }, { status: 500 })
        }

        // Return the region (which is not sensitive) and a token object
        // In a production app, you would implement proper token generation here
        // using the Speech REST API
        return NextResponse.json({
            region: speechRegion,
            // For demo purposes, we're not implementing actual token exchange
            // In production, you would call the Azure token exchange API
            tokenEndpoint: `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
        })
    } catch (error) {
        console.error("Error generating speech token:", error)
        return NextResponse.json({ error: "Failed to generate speech token" }, { status: 500 })
    }
}
