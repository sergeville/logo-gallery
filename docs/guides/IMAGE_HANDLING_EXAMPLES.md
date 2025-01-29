# Image Handling Code Examples

## Table of Contents
1. [Real-world Usage Scenarios](#real-world-usage-scenarios)
2. [Integration Examples](#integration-examples)
3. [Error Handling Patterns](#error-handling-patterns)
4. [Performance Optimization](#performance-optimization)
5. [Custom Hooks and Utilities](#custom-hooks-and-utilities)

## Real-world Usage Scenarios

### 1. Logo Upload with Preview and Optimization
```typescript
import { useState } from 'react';
import { useImageOptimization } from '@/app/hooks/useImageOptimization';
import { LogoImage } from '@/app/components/LogoImage';

export function LogoUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const { optimizeImage, isOptimizing, optimizationStats } = useImageOptimization();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show immediate preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Optimize image
    const result = await optimizeImage(file);
    if (result.success) {
      console.log('Optimization complete:', result.stats);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="logo-upload"
      />
      <label
        htmlFor="logo-upload"
        className="block p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary-blue"
      >
        {preview ? (
          <div className="relative aspect-square w-full">
            <LogoImage
              src={preview}
              alt="Logo preview"
              className="rounded-lg"
              showOptimizationStats={true}
              stats={optimizationStats}
            />
          </div>
        ) : (
          <div className="text-center">
            <p>Click to upload logo</p>
            <p className="text-sm text-gray-500">SVG, PNG, JPG or WebP</p>
          </div>
        )}
      </label>
      {isOptimizing && (
        <div className="text-center text-sm text-gray-500">
          Optimizing image...
        </div>
      )}
    </div>
  );
}
```

### 2. Batch Logo Processing
```typescript
import { useState } from 'react';
import { useImageBatchProcessor } from '@/app/hooks/useImageBatchProcessor';

export function BatchLogoProcessor() {
  const [files, setFiles] = useState<File[]>([]);
  const { processImages, progress, results } = useImageBatchProcessor();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
  };

  const handleProcess = async () => {
    await processImages(files);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="block w-full"
      />
      <button
        onClick={handleProcess}
        disabled={files.length === 0}
        className="px-4 py-2 bg-primary-blue text-white rounded-lg"
      >
        Process {files.length} images
      </button>
      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary-blue h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {results.map((result, index) => (
        <div key={index} className="text-sm">
          {result.filename}: {result.success ? '✅' : '❌'} 
          {result.optimizedSize && `(${((1 - result.optimizedSize / result.originalSize) * 100).toFixed(1)}% smaller)`}
        </div>
      ))}
    </div>
  );
}
```

## Integration Examples

### 1. Integration with Form Libraries (React Hook Form)
```typescript
import { useForm } from 'react-hook-form';
import { useImageOptimization } from '@/app/hooks/useImageOptimization';

interface LogoFormData {
  title: string;
  description: string;
  logo: FileList;
}

export function LogoSubmissionForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LogoFormData>();
  const { optimizeImage } = useImageOptimization();

  const onSubmit = async (data: LogoFormData) => {
    const file = data.logo[0];
    const optimizationResult = await optimizeImage(file);
    
    if (optimizationResult.success) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('logo', optimizationResult.optimizedFile);
      formData.append('metadata', JSON.stringify(optimizationResult.metadata));

      await fetch('/api/logos', {
        method: 'POST',
        body: formData,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input {...register('title', { required: true })} className="mt-1 block w-full" />
        {errors.title && <span className="text-red-500">Title is required</span>}
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea {...register('description')} className="mt-1 block w-full" />
      </div>

      <div>
        <label className="block text-sm font-medium">Logo</label>
        <input
          type="file"
          accept="image/*"
          {...register('logo', { required: true })}
          className="mt-1 block w-full"
        />
        {errors.logo && <span className="text-red-500">Logo is required</span>}
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-primary-blue text-white rounded-lg"
      >
        Submit
      </button>
    </form>
  );
}
```

### 2. Integration with Image Gallery
```typescript
import { useState, useEffect } from 'react';
import { LogoImage } from '@/app/components/LogoImage';
import { useInView } from 'react-intersection-observer';

interface Logo {
  id: string;
  title: string;
  imageUrl: string;
  responsiveUrls: Record<string, string>;
  optimizationStats: {
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
  };
}

export function LogoGallery() {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [page, setPage] = useState(1);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      loadMoreLogos();
    }
  }, [inView]);

  const loadMoreLogos = async () => {
    const response = await fetch(`/api/logos?page=${page}`);
    const data = await response.json();
    setLogos(prev => [...prev, ...data.logos]);
    setPage(p => p + 1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {logos.map((logo, index) => (
        <div
          key={logo.id}
          ref={index === logos.length - 1 ? ref : undefined}
          className="relative"
        >
          <LogoImage
            src={logo.imageUrl}
            alt={logo.title}
            responsiveUrls={logo.responsiveUrls}
            className="rounded-lg"
            showOptimizationStats={true}
            stats={logo.optimizationStats}
          />
        </div>
      ))}
    </div>
  );
}
```

## Error Handling Patterns

### 1. Comprehensive Error Handling
```typescript
import { useState } from 'react';
import { useToast } from '@/app/hooks/useToast';

interface ImageError {
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'OPTIMIZATION_FAILED' | 'UPLOAD_FAILED';
  message: string;
}

export function LogoUploadWithErrorHandling() {
  const [error, setError] = useState<ImageError | null>(null);
  const { showToast } = useToast();

  const validateFile = (file: File): ImageError | null => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

    if (file.size > MAX_SIZE) {
      return {
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds 10MB limit'
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        code: 'INVALID_TYPE',
        message: 'File type not supported'
      };
    }

    return null;
  };

  const handleUpload = async (file: File) => {
    try {
      // Reset previous error
      setError(null);

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        showToast({ type: 'error', message: validationError.message });
        return;
      }

      // Optimize image
      const optimizationResult = await optimizeImage(file).catch(() => {
        throw {
          code: 'OPTIMIZATION_FAILED',
          message: 'Failed to optimize image'
        };
      });

      // Upload optimized image
      const uploadResult = await uploadImage(optimizationResult.optimizedFile).catch(() => {
        throw {
          code: 'UPLOAD_FAILED',
          message: 'Failed to upload image'
        };
      });

      showToast({ type: 'success', message: 'Image uploaded successfully' });
      return uploadResult;

    } catch (err) {
      const imageError = err as ImageError;
      setError(imageError);
      showToast({ type: 'error', message: imageError.message });
    }
  };

  return (
    <div className="space-y-4">
      <FileUpload onUpload={handleUpload} />
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <h4 className="font-medium">Error: {error.code}</h4>
          <p className="text-sm">{error.message}</p>
          {error.code === 'FILE_TOO_LARGE' && (
            <p className="text-sm mt-2">
              Try compressing your image before uploading
            </p>
          )}
          {error.code === 'INVALID_TYPE' && (
            <p className="text-sm mt-2">
              Supported formats: JPEG, PNG, WebP, SVG
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

### 2. Retry Mechanism
```typescript
import { useState } from 'react';
import { useRetry } from '@/app/hooks/useRetry';

export function LogoUploaderWithRetry() {
  const [isUploading, setIsUploading] = useState(false);
  const { retry, attempts, maxAttempts } = useRetry({
    maxAttempts: 3,
    delayMs: 1000,
  });

  const uploadWithRetry = async (file: File) => {
    setIsUploading(true);

    try {
      await retry(async () => {
        const optimized = await optimizeImage(file);
        await uploadImage(optimized);
      });
    } catch (error) {
      console.error('Upload failed after', attempts, 'attempts');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileUpload
        onUpload={uploadWithRetry}
        disabled={isUploading}
      />
      {isUploading && attempts > 1 && (
        <div className="text-sm text-gray-500">
          Retry attempt {attempts}/{maxAttempts}...
        </div>
      )}
    </div>
  );
}
```

## Performance Optimization

### 1. Lazy Loading and Progressive Enhancement
```typescript
import { Suspense, lazy } from 'react';
import { useInView } from 'react-intersection-observer';

const LogoEditor = lazy(() => import('@/app/components/LogoEditor'));

export function OptimizedLogoDisplay() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '100px',
  });

  return (
    <div ref={ref}>
      {inView && (
        <Suspense fallback={<LogoSkeleton />}>
          <LogoEditor />
        </Suspense>
      )}
    </div>
  );
}
```

### 2. Image Loading Optimization
```typescript
import { useState, useEffect } from 'react';
import { useImagePreloader } from '@/app/hooks/useImagePreloader';

export function OptimizedLogoImage({ src, lowResSrc, ...props }) {
  const [loaded, setLoaded] = useState(false);
  const { preloadImage } = useImagePreloader();

  useEffect(() => {
    preloadImage(src).then(() => setLoaded(true));
  }, [src]);

  return (
    <div className="relative">
      <img
        src={lowResSrc}
        className={`transition-opacity duration-300 ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
        {...props}
      />
      {loaded && (
        <img
          src={src}
          className="absolute top-0 left-0 w-full h-full"
          {...props}
        />
      )}
    </div>
  );
}
```

## Custom Hooks and Utilities

### 1. useImageOptimization Hook
```typescript
import { useState } from 'react';
import { imageOptimizationService } from '@/app/lib/services';

interface OptimizationResult {
  success: boolean;
  optimizedFile?: File;
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
  error?: string;
}

export function useImageOptimization() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationStats, setOptimizationStats] = useState<OptimizationResult | null>(null);

  const optimizeImage = async (file: File): Promise<OptimizationResult> => {
    setIsOptimizing(true);
    try {
      const buffer = await file.arrayBuffer();
      const imageBuffer = Buffer.from(buffer);
      
      const analysis = await imageOptimizationService.analyzeImage(imageBuffer);
      const optimized = await imageOptimizationService.optimizeBuffer(imageBuffer, analysis);

      const result = {
        success: true,
        optimizedFile: new File([optimized.buffer], file.name, {
          type: `image/${optimized.metadata.format}`,
        }),
        metadata: {
          width: optimized.metadata.width,
          height: optimized.metadata.height,
          format: optimized.metadata.format,
          size: optimized.buffer.length,
        },
      };

      setOptimizationStats(result);
      return result;
    } catch (error) {
      const result = {
        success: false,
        error: error instanceof Error ? error.message : 'Optimization failed',
      };
      setOptimizationStats(result);
      return result;
    } finally {
      setIsOptimizing(false);
    }
  };

  return {
    optimizeImage,
    isOptimizing,
    optimizationStats,
  };
}
```

### 2. useImageBatchProcessor Hook
```typescript
import { useState } from 'react';
import { useImageOptimization } from './useImageOptimization';

interface BatchResult {
  filename: string;
  success: boolean;
  originalSize: number;
  optimizedSize?: number;
  error?: string;
}

export function useImageBatchProcessor() {
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchResult[]>([]);
  const { optimizeImage } = useImageOptimization();

  const processImages = async (files: File[]) => {
    const batchResults: BatchResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await optimizeImage(file);
        batchResults.push({
          filename: file.name,
          success: result.success,
          originalSize: file.size,
          optimizedSize: result.metadata?.size,
        });
      } catch (error) {
        batchResults.push({
          filename: file.name,
          success: false,
          originalSize: file.size,
          error: error instanceof Error ? error.message : 'Processing failed',
        });
      }
      setProgress(((i + 1) / files.length) * 100);
    }

    setResults(batchResults);
    return batchResults;
  };

  return {
    processImages,
    progress,
    results,
  };
} 