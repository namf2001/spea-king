import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import {logo} from '@/assets/image';

// app/layout.tsx or any page.tsx file
export const metadata: Metadata = {
  title: 'SpeaKing - Language Learning App',
  description: 'Practice your language speaking skills with AI feedback',
  keywords: ['language learning', 'pronunciation', 'English practice'],
  
  // Open Graph
  openGraph: {
    title: 'SpeaKing - Language Learning App',
    description: 'Practice your language speaking skills with AI feedback',
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'SpeaKing - Language Learning App',
    description: 'Practice your language speaking skills with AI feedback',
    images: [logo],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
