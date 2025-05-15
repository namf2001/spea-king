"use client"

import { useEffect, useState } from "react"


const MOBILE_MAX_WIDTH = 768
const IPAD_MIN_WIDTH = 768
const IPAD_MAX_WIDTH = 1024
const DESKTOP_MIN_WIDTH = 1024

export function useDevice() {
  const [isMobile, setIsMobile] = useState(false)
  const [isIpad, setIsIpad] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth

      setIsMobile(width < MOBILE_MAX_WIDTH)
      setIsIpad(width >= IPAD_MIN_WIDTH && width <= IPAD_MAX_WIDTH)
      setIsDesktop(width > DESKTOP_MIN_WIDTH)
    }

    // Initial check
    checkDeviceType()

    // Add event listener for window resize
    window.addEventListener("resize", checkDeviceType)

    // Clean up event listener
    return () => {
      window.removeEventListener("resize", checkDeviceType)
    }
  }, [])

  return { isMobile, isIpad, isDesktop }
}
