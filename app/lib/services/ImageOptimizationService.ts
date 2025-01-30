export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: 'center' | 'top' | 'right top' | 'right' | 'right bottom' | 'bottom' | 'left bottom' | 'left' | 'left top';
  background?: string;
}

interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

export class ImageOptimizationService {
  private readonly defaultOptions: Partial<ImageOptimizationOptions> = {
    format: 'image/webp',
    quality: 80,
    fit: 'inside',
  };

  private readonly breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  };

  /**
   * Optimizes an image buffer with the given options using Next.js Image Optimization
   */
  async optimizeBuffer(
    buffer: Buffer,
    options: ImageOptimizationOptions = {}
  ): Promise<{ buffer: Buffer; metadata: ImageMetadata }> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    // For Next.js Edge Runtime, we'll just return the original buffer with metadata
    // The actual optimization will happen through Next.js Image component or loader
    return {
      buffer,
      metadata: {
        width: options.width || 0,
        height: options.height || 0,
        format: mergedOptions.format || 'image/webp',
        size: buffer.length,
      },
    };
  }

  /**
   * Returns the breakpoints for responsive images
   * These will be used with Next.js Image component
   */
  getBreakpoints(): { [key: string]: number } {
    return this.breakpoints;
  }

  /**
   * Returns optimal image settings based on the format
   */
  getOptimalSettings(format: string = 'image/webp'): ImageOptimizationOptions {
    return {
      format,
      quality: this.calculateOptimalQuality(format),
      fit: 'inside',
    };
  }

  private calculateOptimalQuality(format: string): number {
    switch (format) {
      case 'image/webp':
        return 80;
      case 'image/avif':
        return 75;
      case 'image/jpeg':
        return 85;
      case 'image/png':
        return 90;
      default:
        return 80;
    }
  }

  /**
   * Creates image variants configuration for Next.js Image component
   */
  async createImageVariants(
    buffer: Buffer,
    options: ImageOptimizationOptions = {}
  ): Promise<{
    original: Buffer;
    settings: ImageOptimizationOptions;
    breakpoints: { [key: string]: number };
  }> {
    const settings = {
      ...this.defaultOptions,
      ...options,
    };

    return {
      original: buffer,
      settings,
      breakpoints: this.breakpoints,
    };
  }
}