import sharp from 'sharp';
import { readFile } from 'fs/promises';
import path from 'path';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
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
    format: 'webp',
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
   * Optimizes an image buffer with the given options
   */
  async optimizeBuffer(
    buffer: Buffer,
    options: ImageOptimizationOptions = {}
  ): Promise<{ buffer: Buffer; metadata: ImageMetadata }> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    let image = sharp(buffer);

    // Get original metadata
    const originalMetadata = await image.metadata();

    // Resize if dimensions are provided
    if (mergedOptions.width || mergedOptions.height) {
      image = image.resize(mergedOptions.width, mergedOptions.height, {
        fit: mergedOptions.fit,
        position: mergedOptions.position,
        background: mergedOptions.background,
        withoutEnlargement: true,
      });
    }

    // Convert format if specified
    if (mergedOptions.format) {
      image = image.toFormat(mergedOptions.format, {
        quality: mergedOptions.quality,
        effort: 6, // Higher compression effort
      });
    }

    const outputBuffer = await image.toBuffer();
    const outputMetadata = await image.metadata();

    return {
      buffer: outputBuffer,
      metadata: {
        width: outputMetadata.width || 0,
        height: outputMetadata.height || 0,
        format: outputMetadata.format || '',
        size: outputBuffer.length,
      },
    };
  }

  /**
   * Generates responsive image sizes for different breakpoints
   */
  async generateResponsiveSizes(
    buffer: Buffer,
    baseOptions: ImageOptimizationOptions = {}
  ): Promise<Map<string, Buffer>> {
    const outputs = new Map<string, Buffer>();
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;

    for (const [breakpoint, width] of Object.entries(this.breakpoints)) {
      // Skip if original is smaller than breakpoint
      if (originalWidth <= width) continue;

      const optimized = await this.optimizeBuffer(buffer, {
        ...baseOptions,
        width,
      });
      outputs.set(breakpoint, optimized.buffer);
    }

    return outputs;
  }

  /**
   * Analyzes an image and returns optimal quality settings
   */
  async analyzeImage(buffer: Buffer): Promise<ImageOptimizationOptions> {
    const metadata = await sharp(buffer).metadata();
    const stats = await sharp(buffer).stats();

    // Determine optimal format
    const format = this.getOptimalFormat(metadata.format);

    // Calculate optimal quality based on image characteristics
    const quality = this.calculateOptimalQuality(stats);

    return {
      format,
      quality,
      width: metadata.width,
      height: metadata.height,
    };
  }

  private getOptimalFormat(currentFormat?: string): 'webp' | 'avif' | 'jpeg' | 'png' {
    // Prefer WebP for best compatibility/performance ratio
    // AVIF offers better compression but has less browser support
    return 'webp';
  }

  private calculateOptimalQuality(stats: sharp.Stats): number {
    // Calculate optimal quality based on image entropy and standard deviation
    const entropy = stats.entropy;
    const stdDev = stats.channels[0].stddev;

    if (entropy < 0.5) {
      // Low complexity images can use lower quality
      return 65;
    } else if (entropy < 0.7) {
      // Medium complexity
      return 75;
    } else {
      // High complexity images need higher quality
      return 85;
    }
  }

  /**
   * Creates optimized variants of an image for different use cases
   */
  async createImageVariants(
    buffer: Buffer,
    options: ImageOptimizationOptions = {}
  ): Promise<{
    original: Buffer;
    thumbnail: Buffer;
    optimized: Buffer;
    responsive: Map<string, Buffer>;
  }> {
    // Analyze image for optimal settings
    const analysis = await this.analyzeImage(buffer);
    const baseOptions = { ...analysis, ...options };

    // Generate variants
    const [optimized, thumbnail, responsive] = await Promise.all([
      // Main optimized version
      this.optimizeBuffer(buffer, baseOptions),
      // Thumbnail version
      this.optimizeBuffer(buffer, {
        ...baseOptions,
        width: 300,
        height: 300,
        fit: 'cover',
      }),
      // Responsive versions
      this.generateResponsiveSizes(buffer, baseOptions),
    ]);

    return {
      original: buffer,
      thumbnail: thumbnail.buffer,
      optimized: optimized.buffer,
      responsive,
    };
  }
} 