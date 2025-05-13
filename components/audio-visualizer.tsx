"use client"

import { useRef, useEffect } from "react"

interface AudioVisualizerProps {
    readonly getAudioData: () => Uint8Array | null
    readonly isActive: boolean
    readonly height?: number
    readonly barColor?: string
    readonly backgroundColor?: string
    readonly className?: string
}

export function AudioVisualizer({
    getAudioData,
    isActive,
    height = 100,
    barColor = "#3b82f6",
    backgroundColor = "#f3f4f6",
    className = "",
}: AudioVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number | undefined>(undefined)
    const errorRef = useRef<boolean>(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas dimensions
        const dpr = window.devicePixelRatio || 1
        canvas.width = canvas.offsetWidth * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        const draw = () => {
            if (!isActive) {
                // Clear canvas when not active
                ctx.fillStyle = backgroundColor
                ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr)
                return
            }

            // Try to get audio data, but handle errors gracefully
            let audioData: Uint8Array | null = null
            try {
                audioData = getAudioData()
            } catch (err) {
                console.error("Error getting audio data for visualization:", err)
                errorRef.current = true

                // Draw error state
                ctx.fillStyle = backgroundColor
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                // Draw error message
                ctx.fillStyle = "#ef4444"
                ctx.font = "14px sans-serif"
                ctx.textAlign = "center"
                ctx.fillText("Audio visualization unavailable", canvas.width / (2 * dpr), canvas.height / (2 * dpr))

                return
            }

            if (!audioData) {
                // If no data but no error, just draw empty visualization
                ctx.fillStyle = backgroundColor
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                // Draw some default bars to show it's working
                ctx.fillStyle = barColor
                const barCount = 20
                const barWidth = canvas.width / barCount / dpr

                for (let i = 0; i < barCount; i++) {
                    // Create a simple wave pattern
                    const barHeight = Math.sin(Date.now() / 500 + i / 2) * 10 + 15
                    const x = i * barWidth
                    const y = canvas.height / dpr / 2 - barHeight / 2
                    ctx.fillRect(x, y, barWidth - 1, barHeight)
                }
            } else {
                // Clear canvas
                ctx.fillStyle = backgroundColor
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                // Draw visualization
                const barWidth = canvas.width / audioData.length / dpr
                const canvasHeight = height

                ctx.fillStyle = barColor

                for (let i = 0; i < audioData.length; i++) {
                    const barHeight = (audioData[i] / 255) * canvasHeight
                    const x = i * barWidth
                    const y = canvasHeight - barHeight

                    ctx.fillRect(x, y, barWidth - 1, barHeight)
                }
            }

            if (!errorRef.current) {
                animationRef.current = requestAnimationFrame(draw)
            }
        }

        // Reset error state when active state changes
        errorRef.current = false

        if (isActive) {
            animationRef.current = requestAnimationFrame(draw)
        } else {
            draw() // Draw once to clear
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [isActive, getAudioData, height, barColor, backgroundColor])

    return <canvas ref={canvasRef} className={`w-full rounded-md ${className}`} style={{ height: `${height}px` }} />
}
