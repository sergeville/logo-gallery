'use client';

import { useState } from 'react';
import Image from 'next/image';

interface LogoImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function LogoImage({ src, alt, className = '' }: LogoImageProps) {
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

  const imageUrl = src.startsWith('http') || src.startsWith('/') ? src : `/${src}`;

  return (
    <div 
      data-testid="logo-image"
      className="relative w-full aspect-square"
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className={`object-contain ${className}`}
        onError={() => setError(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={true}
      />
    </div>
  );
} 
