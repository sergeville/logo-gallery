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
  width,
  height,
  onError,
}: LogoImageProps) {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  const handleError = (e: Error) => {
    setError(e);
    setIsLoading(false);
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
        style={{ aspectRatio: '1' }}
        role="alert"
        aria-label={`Error loading image: ${alt}`}
      >
        <AlertCircle className="w-6 h-6 text-gray-400" />
        <span className="text-sm text-gray-400">Image not available</span>
      </div>
    );
  }

  // Normalize image URL
  const imageUrl = !src ? '/placeholder-logo.png' : src.startsWith('http') || src.startsWith('/') ? src : `/${src}`;

  return (
    <div className="relative w-full h-full">
      {/* Loading skeleton */}
      {isLoading && (
        <div 
          className={`absolute inset-0 flex items-center justify-center ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          } animate-pulse`}
          role="progressbar"
          aria-label={`Loading image: ${alt}`}
        >
          <ImageIcon className="w-6 h-6 text-gray-400" />
        </div>
      )}

      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`object-contain ${className} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        priority={priority}
        quality={quality}
        onError={(e) => handleError(e as Error)}
        onLoad={() => setIsLoading(false)}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
} 
