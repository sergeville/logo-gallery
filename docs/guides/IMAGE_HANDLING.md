# Image Handling System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Components](#components)
4. [Usage](#usage)
5. [Configuration](#configuration)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)
8. [API Reference](#api-reference)

## Overview

The Logo Gallery's image handling system is a comprehensive solution for processing, optimizing, and serving images. It provides automatic optimization, responsive image generation, and detailed analytics about image processing.

### Key Benefits
- Automatic image optimization
- Responsive image variants
- Format conversion (WebP support)
- Detailed optimization statistics
- Progressive loading
- Error handling and fallbacks

## Features

### 1. Image Optimization
- Automatic quality adjustment
- Format conversion to WebP
- Metadata preservation
- Size reduction while maintaining quality
- Content-aware compression

### 2. Responsive Images
- Automatic generation of multiple sizes
- Responsive image srcSet generation
- Adaptive serving based on device capabilities
- Lazy loading support
- Placeholder generation

### 3. Analytics & Monitoring
- File size tracking
- Compression ratio calculation
- Format conversion statistics
- Loading performance metrics
- Error rate monitoring

## Components

### 1. ImageOptimizationService
```typescript
import { imageOptimizationService } from '@/app/lib/services';

// Analyze image
const analysis = await imageOptimizationService.analyzeImage(buffer);

// Optimize image
const optimized = await imageOptimizationService.optimizeBuffer(buffer, analysis);
```

### 2. LogoImage Component
```typescript
import LogoImage from '@/app/components/LogoImage';

<LogoImage
  src={imageUrl}
  alt="Logo description"
  responsiveUrls={responsiveVariants}
  quality={75}
  priority={false}
/>
```

### 3. FileUpload Component
```typescript
import FileUpload from '@/app/components/FileUpload';

<FileUpload onUploadComplete={handleUploadComplete} />
```

## Usage

### Basic Image Upload
```typescript
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.imageUrl;
};
```

### Optimization Preview
```typescript
const getOptimizationPreview = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const imageBuffer = Buffer.from(buffer);
  
  const analysis = await imageOptimizationService.analyzeImage(imageBuffer);
  const optimized = await imageOptimizationService.optimizeBuffer(imageBuffer, analysis);

  return {
    originalSize: file.size,
    optimizedSize: optimized.buffer.length,
    compressionRatio: ((file.size - optimized.buffer.length) / file.size * 100),
    dimensions: {
      width: optimized.metadata.width,
      height: optimized.metadata.height,
    },
    format: optimized.metadata.format,
  };
};
```

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_IMAGE_OPTIMIZATION_QUALITY=75
NEXT_PUBLIC_MAX_IMAGE_SIZE=10485760  # 10MB
NEXT_PUBLIC_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/svg+xml
```

### Image Processing Options
```typescript
interface ImageProcessingOptions {
  quality?: number;          // 1-100
  format?: 'jpeg' | 'png' | 'webp';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill';
  position?: 'center' | 'top' | 'right' | 'bottom' | 'left';
}
```

## Best Practices

### 1. Image Upload
- Validate file types before upload
- Check file size limits
- Provide clear error messages
- Show upload progress
- Display optimization preview

### 2. Image Display
- Use responsive images
- Implement lazy loading
- Provide fallback images
- Handle loading states
- Optimize for Core Web Vitals

### 3. Error Handling
- Validate input files
- Handle processing errors
- Provide fallback displays
- Log processing failures
- Implement retry mechanisms

## Troubleshooting

### Common Issues

1. **Upload Failures**
   - Check file size limits
   - Verify allowed file types
   - Ensure proper form encoding
   - Check server logs

2. **Optimization Issues**
   - Verify input file integrity
   - Check available memory
   - Monitor processing timeouts
   - Review error logs

3. **Display Problems**
   - Check image URLs
   - Verify responsive breakpoints
   - Test fallback implementation
   - Monitor browser console

## API Reference

### ImageOptimizationService

#### `analyzeImage(buffer: Buffer)`
Analyzes an image and returns optimization recommendations.

#### `optimizeBuffer(buffer: Buffer, analysis: ImageAnalysis)`
Optimizes an image based on analysis results.

#### `generateResponsiveVersions(buffer: Buffer, options: ResponsiveOptions)`
Generates multiple sizes of an image for responsive display.

### LogoImage Component

#### Props
- `src: string` - Image source URL
- `alt: string` - Alt text for accessibility
- `responsiveUrls?: Record<string, string>` - Responsive image variants
- `quality?: number` - Image quality (1-100)
- `priority?: boolean` - Loading priority
- `width?: number` - Image width
- `height?: number` - Image height

### FileUpload Component

#### Props
- `onUploadComplete?: (url: string) => void` - Upload completion callback
- `maxSize?: number` - Maximum file size
- `allowedTypes?: string[]` - Allowed file types
- `showPreview?: boolean` - Show optimization preview 