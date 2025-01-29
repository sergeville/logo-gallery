'use client';

import { useState } from 'react';
import Image from 'next/image';

interface LogoImageProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  onError?: () => void;
}

export default function LogoImage({
  src = '',
  alt = 'Logo',
  width = 300,
  height = 300,
  className = '',
  priority = false,
  onError
}: LogoImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        data-testid="logo-image-error"
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 min-h-[200px] ${className}`}
      >
        <span className="text-gray-400">Image not available</span>
      </div>
    );
  }

  const imageUrl = src && (src.startsWith('http') || src.startsWith('/')) ? src : `/${src}`;

  const handleError = () => {
    setError(true);
    onError?.();
  };

  return (
    <div 
      data-testid="logo-image"
      className={`relative w-full aspect-square ${className}`}
    >
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        className="object-contain"
        priority={priority ? "true" : undefined}
        onError={handleError}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
} 
