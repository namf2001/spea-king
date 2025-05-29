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
      {/* Enhanced stars background effect with varying opacity and animation speed */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 1000 }).map((_, i) => {
          const size = Math.random() * 3 + 1;
          const opacity = Math.random() * 0.4 + 0.1; // Varying opacity
          const animationDuration = Math.random() * 100 + 50; // Varying animation speed

          return (
            <div
              key={i}
              className="absolute rounded-full bg-black dark:bg-white"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: opacity,
                animation: `spin ${animationDuration}s linear infinite`,
              }}
            />
          );
        })}
      </div>

      {/* Enhanced Header with gradient text */}
      <header className="z-10 container mx-auto flex items-center justify-between px-4 py-6 md:py-8">
        <div className="flex items-center space-x-3">
          <div className="relative overflow-hidden">
            <Image
              src={logo}
              alt="SpeaKing Logo"
              width={48}
              height={48}
              className="h-12 w-12"
            />
          </div>
        </div>
      </header>

      {/* Main content with improved spacing and animations */}
      <div className="z-10 container mx-auto flex flex-1 flex-col items-center justify-center gap-12 px-4 md:flex-row md:justify-between md:gap-16">
        {/* World animation with enhanced visual effects */}
        <div className="relative mx-auto w-full max-w-xs md:mx-0 md:max-w-md">
          <div className="from-primary/20 to-accent/20 absolute -inset-4 rounded-full bg-gradient-to-br blur-xl"></div>
          <LottieAnimation
            src={world}
            size="full"
            className="relative z-10 w-full drop-shadow-xl"
            loop={true}
            autoplay={true}
          />
        </div>

        {/* Text and CTA with enhanced typography and button styling */}
        <div className="mb-10 w-full max-w-xl text-center md:mt-0 md:text-right">
          <h1 className="from-primary to-accent bg-gradient-to-r bg-clip-text text-3xl leading-tight font-extrabold tracking-tight text-transparent md:text-5xl lg:text-6xl">
            The free, fun, and effective way to learn a language!
          </h1>

          <div className="mt-10 flex w-full flex-col items-center space-y-4 md:items-end">
            <Link
              href="/login"
              className="block w-full max-w-md transition-transform hover:scale-105"
            >
              <Button className="w-full">
                GET STARTED
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Motivational quote slider with gradient background */}
      <div className="from-primary/10 to-accent/10 mt-auto bg-gradient-to-r">
        <MotivationalQuotesSlider />
      </div>
    </main>
  );
}
