import { Metadata } from 'next';

interface OpenGraphImageOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

// Get base URL with proper error handling
const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  throw new Error('NEXT_PUBLIC_APP_URL must be set for production');
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