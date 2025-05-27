import Link from 'next/link';
import { logo } from '@/assets/image';
import { world } from '@/assets/animations';
import { Button } from '@/components/ui/button';
import { LottieAnimation } from '@/components/animations/lottie-animation';
import Image from 'next/image';
import { MotivationalQuotesSlider } from '@/components/layout/motivational-quotes-slider';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Stars background effect */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 1000 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-spin rounded-full bg-black opacity-30 dark:bg-white"
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
      <header className="md-py-12 z-10 container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center space-x-2">
          <Image
            src={logo}
            alt="SpeaKing Logo"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <span className="text-3xl font-bold md:text-4xl">Milo</span>
        </div>
      </header>

      {/* Main content */}
      <div className="z-10 container mx-auto flex flex-1 flex-col items-center justify-center px-4 md:flex-row md:justify-between">
        {/* World animation with ripple effect */}
        <div className="relative mx-auto w-full max-w-xs md:mx-0 md:max-w-md">
          {/* World animation */}
          <LottieAnimation
            src={world}
            size="full"
            className="relative z-10 w-full"
            loop={true}
            autoplay={true}
          />
        </div>

        {/* Text and CTA */}
        <div className="mb-10 w-full max-w-xl text-center md:mt-0 md:text-right">
          <h1 className="text-2xl leading-tight font-bold md:text-5xl lg:text-6xl">
            The free, fun, and effective way to learn a language!
          </h1>

          <div className="mt-10 flex w-full flex-col items-center space-y-4 md:items-end">
            <Link href="/login" className="block w-full max-w-md">
              <Button className="w-full">GET STARTED</Button>
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
  );
}
