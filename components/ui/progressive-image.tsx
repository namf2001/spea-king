"use client"

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface ProgressiveImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallback?: string
  containerClassName?: string
  showSkeleton?: boolean
}

export function ProgressiveImage({
  src,
  alt,
  className,
  containerClassName,
  fallback = '/placeholder.svg',
  showSkeleton = true,
  ...props
}: Readonly<ProgressiveImageProps>) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {/* Skeleton loader */}
      {showSkeleton && imageStatus === 'loading' && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {/* Main image */}
      <Image
        src={imageStatus === 'error' ? fallback : src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setImageStatus('loaded')}
        onError={() => setImageStatus('error')}
        {...props}
      />
      
      {/* Error state */}
      {imageStatus === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-sm">Failed to load</span>
        </div>
      )}
    </div>
  )
}