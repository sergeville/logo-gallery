'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { ImageIcon, AlertCircle } from 'lucide-react';

interface LogoImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  responsiveUrls?: Record<string, string>;
  width?: number;
  height?: number;
  onError?: (error: Error) => void;
}

export default function LogoImage({
  src,
  alt,
  className = '',
  priority = false,
  quality = 75,
  responsiveUrls,
  width = 200,
  height = 200,
  onError,
}: LogoImageProps) {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  const handleError = (e: Error) => {
    setError(e);
    onError?.(e);
    console.error('Image loading error:', e);
  };

  // Error fallback
  if (error) {
    return (
      <div 
        className={`flex flex-col items-center justify-center gap-2 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        } ${className}`}
        style={{ aspectRatio: width && height ? width / height : '1' }}
        role="alert"
        aria-label={`Error loading image: ${alt}`}
      >
        <AlertCircle className="w-6 h-6 text-gray-400" />
        <span className="text-sm text-gray-400">Image not available</span>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center animate-pulse ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        } ${className}`}
        style={{ aspectRatio: width && height ? width / height : '1' }}
        role="progressbar"
        aria-label={`Loading image: ${alt}`}
      >
        <ImageIcon className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  // Normalize image URL
  const imageUrl = !src ? '' : src.startsWith('http') || src.startsWith('/') ? src : `/${src}`;

  // Generate srcSet if responsive URLs are available
  const generateSrcSet = () => {
    if (!responsiveUrls) return undefined;
    return Object.entries(responsiveUrls)
      .map(([size, url]) => `${url} ${size}w`)
      .join(', ');
  };

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      quality={quality}
      srcSet={generateSrcSet()}
      onError={(e) => handleError(e as Error)}
      onLoad={() => setIsLoading(false)}
      onLoadingComplete={() => setIsLoading(false)}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
} 
