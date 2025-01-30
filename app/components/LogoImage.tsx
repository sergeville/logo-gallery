'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

interface LogoImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  responsiveUrls?: Record<string, string>;
  width?: number;
  height?: number;
}

export default function LogoImage({
  src,
  alt,
  className = '',
  priority = false,
  quality = 75,
  responsiveUrls,
  width,
  height,
}: LogoImageProps) {
  const [error, setError] = useState(false);
  const { theme } = useTheme();

  // Error fallback
  if (error) {
    return (
      <div 
        className={`flex items-center justify-center ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        } ${className}`}
        style={{ aspectRatio: width && height ? width / height : '1' }}
      >
        <span className="text-gray-400">Image not available</span>
      </div>
    );
  }

  // Normalize image URL
  const imageUrl = !src ? '' : src.startsWith('http') || src.startsWith('/') ? src : `/${src}`;

  // Generate srcSet if responsive URLs are available
  const generateSrcSet = () => {
    if (!responsiveUrls) return undefined;

    const breakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    };

    return Object.entries(responsiveUrls)
      .map(([size, url]) => `${url} ${breakpoints[size as keyof typeof breakpoints]}w`)
      .join(', ');
  };

  return (
    <div className={`relative ${className}`} style={{ aspectRatio: width && height ? width / height : '1' }}>
      <Image
        src={imageUrl || '/placeholder.png'}
        alt={alt}
        style={{ objectFit: 'contain' }}
        onError={() => setError(true)}
        sizes={
          responsiveUrls
            ? "(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 50vw, 33vw"
            : undefined
        }
        {...(priority ? { priority: true } : {})}
        quality={quality}
        loading={priority ? 'eager' : 'lazy'}
        {...(width && height ? { width, height } : {})}
        {...(responsiveUrls ? { srcSet: generateSrcSet() } : {})}
      />
    </div>
  );
} 
