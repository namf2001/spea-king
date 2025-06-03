import { Metadata } from 'next';

interface OpenGraphImageOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

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

export function generateMetadata({
  title = 'SpeaKing - Language Learning App',
  description = 'Practice your language speaking skills with AI feedback',
  image = '/images/logo-social.png',
  url = '/',
}: OpenGraphImageOptions = {}): Metadata {
  const baseUrl = getBaseUrl();
  const fullUrl = url === '/' ? baseUrl : `${baseUrl}${url}`;

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      locale: 'vi_VN',
      url: fullUrl,
      title,
      description,
      siteName: 'SpeaKing',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@speaking_app',
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: fullUrl,
    },
  };
}