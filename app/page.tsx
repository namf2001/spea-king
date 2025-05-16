import Link from "next/link"
import { logo } from "@/assets/image"
import { world } from "@/assets/animations"
import { Button } from "@/components/ui/button"
import { LottieAnimation } from "@/components/animations/lottie-animation"
import { RippleEffect } from "@/components/animations/ripple-effect"
import Image from "next/image"
import { MotivationalQuotesSlider } from "@/components/layout/motivational-quotes-slider"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Stars background effect */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 1000 }).map((_, i) => (
          <div
            key={i}
            className="absolute dark:bg-white bg-black  rounded-full opacity-30 animate-spin"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-12 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <Image
            src={logo}
            alt="SpeaKing Logo"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <span className="text-3xl md:text-4xl font-bold">Milo</span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 flex flex-col md:flex-row items-center justify-center md:justify-between z-10">
        {/* World animation with ripple effect */}
        <div className="w-full max-w-xs md:max-w-md mx-auto md:mx-0 relative">
          {/* Multiple layered effects behind world */}
          <div className="absolute inset-0 -m-14 scale-125">
            <RippleEffect className="w-full h-full" color="cyan" />
          </div>
          <div className="absolute inset-0 -m-14 scale-125">
            <RippleEffect className="w-full h-full" color="blue" />
          </div>

          {/* World animation */}
          <LottieAnimation
            src={world}
            size="full"
            className="w-full relative z-10"
            loop={true}
            autoplay={true}
          />
        </div>

        {/* Text and CTA */}
        <div className="mt-10 md:mt-0 text-center md:text-right max-w-xl w-full">
          <h1 className=" text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            The free, fun, and effective way to learn a language!
          </h1>

          <div className="mt-10 w-full flex flex-col items-center md:items-end space-y-4">
            <Link href="/login" className="block w-full max-w-md">
              <Button className="w-full">
                GET STARTED
              </Button>
            </Link>
            <Link href="/login" className="block w-full max-w-md">
              <Button variant="outline" className="w-full">
                I ALREADY HAVE AN ACCOUNT
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Motivational quote slider - now using the client component */}
      <div className="mt-auto">
        <MotivationalQuotesSlider />
      </div>
    </main>
  )
}
