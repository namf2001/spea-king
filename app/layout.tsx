import type { Metadata } from 'next';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

// Get base URL with proper environment handling for builds
const getBaseUrl = (): string => {
  // If NEXT_PUBLIC_APP_URL is set and valid, use it
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && (envUrl.startsWith('http://') || envUrl.startsWith('https://'))) {
    return envUrl;
  }
  
  // For development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // For production builds without valid NEXT_PUBLIC_APP_URL, use a complete placeholder
  return 'https://speaking-app.vercel.app'; // More realistic placeholder
};

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  title: 'SpeaKing - Language Learning App',
  description: 'Practice your language speaking skills with AI feedback',
  keywords: ['language learning', 'pronunciation', 'English practice'],
  authors: [{ name: 'SpeaKing Team' }],
  creator: 'SpeaKing Team',
  publisher: 'SpeaKing',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: baseUrl,
    title: 'SpeaKing - Language Learning App',
    description: 'Practice your language speaking skills with AI feedback',
    siteName: 'SpeaKing',
    images: [
      {
        url: '/images/logo-social.png',
        width: 1200,
        height: 630,
        alt: 'SpeaKing - Language Learning App',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpeaKing - Language Learning App',
    description: 'Practice your language speaking skills with AI feedback',
    images: ['/images/logo-social.png'],
    creator: '@speaking_app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
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
