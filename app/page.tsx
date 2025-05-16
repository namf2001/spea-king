import Image from "next/image"
import Link from "next/link"
import { logo, image3 } from "@/assets/image"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/layout/theme-switcher"

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Main content container */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image
              src={logo}
              alt="SpeaKing Logo"
              width={40}
              height={40}
              className="h-10 w-10 animate-float-slow"
            />
            <span className="text-pink-600 dark:text-pink-400 text-3xl md:text-4xl font-bold font-nunito">Milo</span>
          </div>
          <ThemeSwitcher />
        </header>

        {/* Main content */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center container mx-auto px-4 py-8 gap-12">
          {/* Hero image */}
          <div className="relative w-full max-w-md md:order-2">
            <Image
              src={image3}
              alt="Language learning illustration"
              width={500}
              height={500}
              className="animate-float-slow"
              priority
            />
          </div>

          {/* Text and buttons */}
          <div className="flex flex-col items-center md:items-start max-w-lg md:order-1">
            <h1 className="text-pink-700 dark:text-pink-300 text-center md:text-left text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-nunito">
              Master Your English <span className="text-rose-500 dark:text-rose-400">Pronunciation</span>
            </h1>

            <p className="mt-6 text-center md:text-left text-slate-700 dark:text-slate-300 text-lg">
              Practice speaking naturally with AI-powered feedback to improve your pronunciation, conversation skills, and confidence.
            </p>

            <div className="mt-8 w-full max-w-sm space-y-4">
              <Link href="/login" className="block w-full">
                <Button className="w-full uppercase">
                  get started
                </Button>
              </Link>
              <Link href="/login" className="block w-full">
                <Button variant="secondary" className="w-full uppercase">
                  i already have an account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
