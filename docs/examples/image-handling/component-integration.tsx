import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog } from '@/components/ui/Dialog';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useImageOptimization } from '@/hooks/useImageOptimization';
import { useImageCache } from '@/hooks/useImageCache';
import { ImageCropTool } from '@/components/ImageCropTool';

// Example 1: Logo Card with Actions
export const LogoCard: React.FC<{
  logo: {
    id: string;
    url: string;
    title: string;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ logo, onEdit, onDelete }) => {
  return (
    <Card className="p-4">
      <div className="relative h-48 mb-4">
        <Image
          src={logo.url}
          alt={logo.title}
          fill
          className="object-contain"
        />
      </div>
      <h3 className="text-lg font-semibold mb-2">{logo.title}</h3>
      <div className="flex space-x-2">
        <Button onClick={() => onEdit(logo.id)}>Edit</Button>
        <Button variant="destructive" onClick={() => onDelete(logo.id)}>
          Delete
        </Button>
      </div>
    </Card>
  );
};

// Example 2: Logo Preview Modal
export const LogoPreviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  logoUrl: string;
}> = ({ isOpen, onClose, logoUrl }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <Dialog.Content className="max-w-4xl">
        <div className="relative h-[80vh]">
          <Image
            src={logoUrl}
            alt="Logo Preview"
            fill
            className="object-contain"
            quality={100}
          />
        </div>
        <Dialog.Close asChild>
          <Button className="mt-4">Close</Button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog>
  );
};

// Example 3: Logo Editor with Crop Tool
export const LogoEditor: React.FC<{
  logoUrl: string;
  onSave: (croppedImage: Blob) => void;
}> = ({ logoUrl, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const { optimizeImage } = useImageOptimization();

  const handleSave = async (croppedBlob: Blob) => {
    try {
      const optimized = await optimizeImage(croppedBlob, {
        maxWidth: 800,
        quality: 90,
        format: 'webp'
      });
      onSave(optimized);
    } catch (error) {
      console.error('Error optimizing cropped image:', error);
    }
  };

  return (
    <div className="space-y-4">
      <ImageCropTool
        imageUrl={logoUrl}
        crop={crop}
        onChange={setCrop}
        onComplete={handleSave}
        aspect={1}
      />
      <div className="flex justify-end">
        <Button onClick={() => handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};

// Example 4: Logo with Loading States
export const LogoWithLoadingStates: React.FC<{
  logoUrl: string;
  fallbackUrl: string;
}> = ({ logoUrl, fallbackUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative h-48 w-48">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      )}
      <Image
        src={error ? fallbackUrl : logoUrl}
        alt="Logo"
        fill
        className={`object-contain transition-opacity duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoadingComplete={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </div>
  );
};

// Example 5: Logo with Cache Integration
export const CachedLogo: React.FC<{
  logoUrl: string;
  cacheKey: string;
}> = ({ logoUrl, cacheKey }) => {
  const { getCachedImage, cacheImage } = useImageCache();
  const [imageUrl, setImageUrl] = useState<string>(logoUrl);

  React.useEffect(() => {
    const loadImage = async () => {
      // Try to get from cache first
      const cached = await getCachedImage(cacheKey);
      if (cached) {
        setImageUrl(URL.createObjectURL(cached));
        return;
      }

      // If not in cache, fetch and cache
      try {
        const response = await fetch(logoUrl);
        const blob = await response.blob();
        await cacheImage(cacheKey, blob);
        setImageUrl(URL.createObjectURL(blob));
      } catch (error) {
        console.error('Error caching image:', error);
      }
    };

    loadImage();
  }, [logoUrl, cacheKey]);

  return (
    <div className="relative h-48 w-48">
      <Image
        src={imageUrl}
        alt="Cached Logo"
        fill
        className="object-contain"
      />
    </div>
  );
}; 