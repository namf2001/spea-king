import type { Metadata } from 'next';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

// Build-time check for required environment variable
if (!process.env.NEXT_PUBLIC_APP_URL && process.env.NODE_ENV === 'production') {
  throw new Error(
    'NEXT_PUBLIC_APP_URL environment variable is required for production builds. ' +
    'Please set it to your app\'s domain (e.g., https://yourdomain.com)'
  );
}

// Get base URL with fallback only for development
const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  throw new Error('NEXT_PUBLIC_APP_URL must be set for production');
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
