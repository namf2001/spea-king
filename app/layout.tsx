import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import {logo} from '@/assets/image';

// Lấy URL cơ sở cho website
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://spea-king.vercel.app';
// URL tuyệt đối cho ảnh logo
const logoUrl = `${BASE_URL}/logo-social.png`;

// app/layout.tsx or any page.tsx file
export const metadata: Metadata = {
  title: 'SpeaKing - Language Learning App',
  description: 'Practice your language speaking skills with AI feedback',
  keywords: ['language learning', 'pronunciation', 'English practice'],
  
  // Open Graph
  openGraph: {
    title: 'SpeaKing - Language Learning App',
    description: 'Practice your language speaking skills with AI feedback',
    type: 'website',
    url: BASE_URL,
    siteName: 'SpeaKing',
    locale: 'vi_VN',
    images: [
      {
        url: logoUrl,
        width: 1200,
        height: 630,
        alt: 'SpeaKing - Language Learning App',
      }
    ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'SpeaKing - Language Learning App',
    description: 'Practice your language speaking skills with AI feedback',
    images: [logoUrl],
    creator: '@speakingapp',
  },

  // Các metadata khác
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: '/favicon.ico',
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
