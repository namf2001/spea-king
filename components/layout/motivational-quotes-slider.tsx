'use client';

import { motion } from 'framer-motion';

const motivationalQuotes = [
  'The best way to predict your future is to create it.',
  'Learning a language is a journey, not a destination.',
  'Every word you learn is a step toward understanding a new world.',
  'Language learning is like building bridges between cultures.',
  'Speak a new language so that your world will be a new world.',
  'The limits of your language are the limits of your world.',
  'One language sets you in a corridor for life. Two languages open every door along the way.',
];

export function MotivationalQuotesSlider() {
  return (
    <div className="bg-accent/15 z-10 w-full overflow-hidden py-6">
      <div className="container mx-auto px-4">
        <motion.div
          className="flex items-center justify-center"
          initial={{ x: '100%' }}
          animate={{ x: '-100%' }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {motivationalQuotes.map((quote, index) => (
            <motion.div
              key={index}
              className="mx-8 text-xl font-bold whitespace-nowrap"
              initial={{ opacity: 0.7 }}
              whileHover={{ opacity: 1, scale: 1.05 }}
            >
              {quote}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
