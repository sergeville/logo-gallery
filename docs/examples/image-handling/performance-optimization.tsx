import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useImageOptimization } from '@/hooks/useImageOptimization';
import { useImagePreload } from '@/hooks/useImagePreload';

// Example 1: Virtualized Image Grid
export const VirtualizedImageGrid: React.FC<{
  images: Array<{ id: string; url: string }>;
}> = ({ images }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(images.length / 3),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5
  });

  return (
    <div
      ref={parentRef}
      className="h-screen overflow-auto"
      style={{
        contain: 'strict'
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const start = virtualRow.index * 3;
          const rowImages = images.slice(start, start + 3);

          return (
            <div
              key={virtualRow.index}
              className="grid grid-cols-3 gap-4 absolute top-0 left-0 w-full"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              {rowImages.map(image => (
                <div key={image.id} className="relative h-48">
                  <Image
                    src={image.url}
                    alt={`Image ${image.id}`}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 33vw, 25vw"
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Example 2: Intersection Observer for Lazy Loading
export const LazyLoadedImage: React.FC<{
  src: string;
  alt: string;
}> = ({ src, alt }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '50px 0px'
  });

  return (
    <div ref={ref} className="relative h-48">
      {inView && (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      )}
    </div>
  );
};

// Example 3: Responsive Image with Art Direction
export const ResponsiveImage: React.FC<{
  images: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  alt: string;
}> = ({ images, alt }) => {
  return (
    <div className="relative w-full">
      {/* Mobile */}
      <div className="block md:hidden relative h-64">
        <Image
          src={images.mobile}
          alt={alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority={true}
        />
      </div>
      
      {/* Tablet */}
      <div className="hidden md:block lg:hidden relative h-80">
        <Image
          src={images.tablet}
          alt={alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority={true}
        />
      </div>
      
      {/* Desktop */}
      <div className="hidden lg:block relative h-96">
        <Image
          src={images.desktop}
          alt={alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority={true}
        />
      </div>
    </div>
  );
};

// Example 4: Image Preloading Strategy
export const PreloadedGallery: React.FC<{
  images: Array<{ id: string; url: string }>;
}> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { preloadImage } = useImagePreload();

  // Preload next image
  const preloadNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % images.length;
    preloadImage(images[nextIndex].url);
  }, [currentIndex, images, preloadImage]);

  return (
    <div className="space-y-4">
      <div className="relative h-96">
        <Image
          src={images[currentIndex].url}
          alt={`Image ${currentIndex + 1}`}
          fill
          className="object-contain"
          onLoadingComplete={preloadNext}
          priority={currentIndex === 0}
        />
      </div>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Next Image
      </button>
    </div>
  );
};

// Example 5: Optimized Image Processing Pipeline
export const OptimizedImageProcessor: React.FC<{
  file: File;
  onComplete: (optimizedBlob: Blob) => void;
}> = ({ file, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const { optimizeImage } = useImageOptimization();
  const workerRef = useRef<Worker>();

  const processImage = useCallback(async () => {
    try {
      // Step 1: Basic Validation
      if (!file.type.startsWith('image/')) {
        throw new Error('Invalid file type');
      }

      // Step 2: Create WebWorker for heavy processing
      workerRef.current = new Worker('/workers/image-processor.js');
      
      // Step 3: Optimize image in chunks
      const chunks = 4;
      const chunkSize = Math.ceil(file.size / chunks);
      
      for (let i = 0; i < chunks; i++) {
        const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
        await new Promise<void>((resolve) => {
          workerRef.current!.postMessage({ chunk, index: i });
          workerRef.current!.onmessage = () => {
            setProgress((prev) => prev + (100 / chunks));
            resolve();
          };
        });
      }

      // Step 4: Final optimization
      const optimized = await optimizeImage(file, {
        maxWidth: 1920,
        quality: 85,
        format: 'webp'
      });

      onComplete(optimized);
    } catch (error) {
      console.error('Image processing error:', error);
    } finally {
      workerRef.current?.terminate();
    }
  }, [file, onComplete, optimizeImage]);

  return (
    <div className="space-y-2">
      <div className="h-2 bg-gray-200 rounded">
        <div
          className="h-full bg-blue-500 rounded transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <button
        onClick={processImage}
        className="px-4 py-2 bg-blue-500 text-white rounded"
        disabled={progress > 0}
      >
        Process Image
      </button>
    </div>
  );
}; 