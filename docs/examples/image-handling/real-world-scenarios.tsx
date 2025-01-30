import React, { useState } from 'react';
import Image from 'next/image';
import { useImageOptimization } from '@/hooks/useImageOptimization';
import { ImageUploader } from '@/components/ImageUploader';
import { ImageGallery } from '@/components/ImageGallery';
import { ImageEditor } from '@/components/ImageEditor';

// Example 1: Responsive Logo Display
export const ResponsiveLogoDisplay: React.FC<{ logoUrl: string }> = ({ logoUrl }) => {
  return (
    <div className="relative w-full">
      {/* Automatically handles different screen sizes */}
      <Image
        src={logoUrl}
        alt="Company Logo"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={90}
        priority={true}
        className="object-contain"
        fill
      />
    </div>
  );
};

// Example 2: Logo Upload with Preview
export const LogoUploader: React.FC = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const { optimizeImage } = useImageOptimization();

  const handleUpload = async (file: File) => {
    try {
      // Optimize before preview
      const optimizedImage = await optimizeImage(file, {
        maxWidth: 800,
        quality: 90,
        format: 'webp'
      });

      setPreview(URL.createObjectURL(optimizedImage));
    } catch (error) {
      console.error('Error optimizing image:', error);
    }
  };

  return (
    <div className="space-y-4">
      <ImageUploader onUpload={handleUpload} />
      {preview && (
        <div className="relative h-64 w-64">
          <Image
            src={preview}
            alt="Upload Preview"
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
};

// Example 3: Logo Gallery with Lazy Loading
export const LazyLoadedGallery: React.FC<{ logos: Array<{ id: string; url: string }> }> = ({ 
  logos 
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {logos.map(logo => (
        <div key={logo.id} className="relative h-48">
          <Image
            src={logo.url}
            alt={`Logo ${logo.id}`}
            fill
            loading="lazy"
            className="object-contain"
            sizes="(max-width: 768px) 33vw, 25vw"
          />
        </div>
      ))}
    </div>
  );
};

// Example 4: Logo with Fallback
export const LogoWithFallback: React.FC<{ 
  primaryUrl: string;
  fallbackUrl: string;
}> = ({ primaryUrl, fallbackUrl }) => {
  const [error, setError] = useState(false);

  return (
    <div className="relative h-32 w-32">
      <Image
        src={error ? fallbackUrl : primaryUrl}
        alt="Logo with Fallback"
        fill
        className="object-contain"
        onError={() => setError(true)}
      />
    </div>
  );
};

// Example 5: Progressive Logo Loading
export const ProgressiveLogoLoad: React.FC<{ 
  thumbnailUrl: string;
  fullUrl: string;
}> = ({ thumbnailUrl, fullUrl }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative h-64 w-64">
      {/* Low-quality placeholder */}
      <Image
        src={thumbnailUrl}
        alt="Logo Placeholder"
        fill
        className={`object-contain transition-opacity duration-300 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {/* High-quality image */}
      <Image
        src={fullUrl}
        alt="Full Logo"
        fill
        className={`object-contain transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoadingComplete={() => setIsLoaded(true)}
      />
    </div>
  );
}; 