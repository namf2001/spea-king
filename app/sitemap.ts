import { MetadataRoute } from 'next'

// Get base URL with proper environment handling
const getBaseUrl = (): string => {
  // If NEXT_PUBLIC_APP_URL is set, use it
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // For development or when building locally, use localhost
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
    return 'http://localhost:3000';
  }
  
  // For production builds without NEXT_PUBLIC_APP_URL, use a placeholder
  return 'https://your-domain.com'; // Placeholder that won't break the build
};

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl()
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/pronunciation`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/vocabulary`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/conversation`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/reflex`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/progress`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]
}