import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/useToast';
import { useImageValidation } from '@/hooks/useImageValidation';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Example 1: Comprehensive Error Handling for Image Upload
export const RobustImageUploader: React.FC<{
  onUpload: (file: File) => Promise<void>;
}> = ({ onUpload }) => {
  const { toast } = useToast();
  const { validateImage } = useImageValidation();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Invalid file type. Please upload an image.');
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 5MB.');
      }

      // Validate image dimensions and format
      const validationResult = await validateImage(file, {
        maxWidth: 2000,
        maxHeight: 2000,
        allowedFormats: ['png', 'jpg', 'webp']
      });

      if (!validationResult.valid) {
        throw new Error(validationResult.error);
      }

      await onUpload(file);
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
        type: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};

// Example 2: Error Boundary for Image Components
export class ImageErrorBoundary extends React.Component<
  { fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Image Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Example 3: Retry Logic for Image Loading
export const RetryableImage: React.FC<{
  src: string;
  alt: string;
  maxRetries?: number;
}> = ({ src, alt, maxRetries = 3 }) => {
  const [retries, setRetries] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const handleError = () => {
    if (retries < maxRetries) {
      setRetries(prev => prev + 1);
      toast({
        title: 'Retrying',
        description: `Attempt ${retries + 1} of ${maxRetries}`,
        type: 'info'
      });
    } else {
      setError(new Error('Failed to load image after multiple attempts'));
      toast({
        title: 'Error',
        description: 'Failed to load image',
        type: 'error'
      });
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-100">
        <p className="text-red-500">Failed to load image</p>
      </div>
    );
  }

  return (
    <div className="relative h-48">
      <Image
        src={`${src}?retry=${retries}`} // Force reload on retry
        alt={alt}
        fill
        className="object-contain"
        onError={handleError}
      />
    </div>
  );
};

// Example 4: Graceful Degradation
export const GracefulImage: React.FC<{
  sources: Array<{
    src: string;
    type: string;
  }>;
  fallbackSrc: string;
  alt: string;
}> = ({ sources, fallbackSrc, alt }) => {
  const [currentSource, setCurrentSource] = useState(0);
  const [error, setError] = useState(false);

  const handleError = () => {
    if (currentSource < sources.length - 1) {
      setCurrentSource(prev => prev + 1);
    } else {
      setError(true);
    }
  };

  if (error) {
    return (
      <div className="relative h-48">
        <Image
          src={fallbackSrc}
          alt={alt}
          fill
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div className="relative h-48">
      <Image
        src={sources[currentSource].src}
        alt={alt}
        fill
        className="object-contain"
        onError={handleError}
      />
    </div>
  );
};

// Example 5: Network-Aware Image Loading
export const NetworkAwareImage: React.FC<{
  highQualitySrc: string;
  lowQualitySrc: string;
  alt: string;
}> = ({ highQualitySrc, lowQualitySrc, alt }) => {
  const [connection, setConnection] = useState<string>('');

  useEffect(() => {
    if ('connection' in navigator) {
      // @ts-ignore: Newer API not in TypeScript defs
      setConnection(navigator.connection?.effectiveType || '4g');
      
      // @ts-ignore: Newer API not in TypeScript defs
      const handleChange = () => setConnection(navigator.connection?.effectiveType || '4g');
      
      // @ts-ignore: Newer API not in TypeScript defs
      navigator.connection?.addEventListener('change', handleChange);
      
      return () => {
        // @ts-ignore: Newer API not in TypeScript defs
        navigator.connection?.removeEventListener('change', handleChange);
      };
    }
  }, []);

  const shouldUseHighQuality = !connection || ['4g', '5g'].includes(connection);

  return (
    <div className="relative h-48">
      <Image
        src={shouldUseHighQuality ? highQualitySrc : lowQualitySrc}
        alt={alt}
        fill
        className="object-contain"
        quality={shouldUseHighQuality ? 90 : 60}
      />
    </div>
  );
}; 