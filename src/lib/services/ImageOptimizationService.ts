import { imageConfig } from '@/config/image.config';
import { ImageCacheService } from '@/src/lib/services/cache/ImageCacheService';
import { CDNService, CDNUploadResult } from '@/src/lib/services/cdn/CDNService';
import sharp from 'sharp';
import crypto from 'crypto';

interface OptimizationResult {
  buffer: Buffer;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
  cdn?: CDNUploadResult;
}

export class ImageOptimizationService {
  private cacheService: ImageCacheService;
  private cdnService: CDNService;

  constructor() {
    this.cacheService = new ImageCacheService();
    this.cdnService = new CDNService();
  }

  private generateCacheKey(buffer: Buffer, options: any): string {
    const hash = crypto.createHash('sha256')
      .update(buffer)
      .update(JSON.stringify(options))
      .digest('hex');
    return `img:${hash}`;
  }

  async optimizeBuffer(buffer: Buffer, options: any = {}): Promise<OptimizationResult> {
    const cacheKey = this.generateCacheKey(buffer, options);
    
    // Try to get from cache first
    const cachedResult = await this.cacheService.get(cacheKey, 'optimized');
    if (cachedResult) {
      const metadata = await sharp(cachedResult).metadata();
      return {
        buffer: cachedResult,
        metadata: {
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: metadata.format || 'unknown',
          size: cachedResult.length,
        },
      };
    }

    // Process image if not in cache
    let image = sharp(buffer);

    // Apply format conversion if specified
    if (options.format) {
      image = image.toFormat(options.format, {
        quality: options.quality || imageConfig.optimization.quality[options.format],
      });
    }

    // Apply resizing if specified
    if (options.width || options.height) {
      image = image.resize(options.width, options.height, {
        fit: options.fit || 'contain',
        background: options.background || { r: 255, g: 255, b: 255, alpha: 0 },
      });
    }

    // Get optimized buffer and metadata
    const [optimizedBuffer, metadata] = await Promise.all([
      image.toBuffer(),
      image.metadata(),
    ]);

    const result: OptimizationResult = {
      buffer: optimizedBuffer,
      metadata: {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: optimizedBuffer.length,
      },
    };

    // Upload to CDN if enabled
    if (options.uploadToCdn) {
      try {
        result.cdn = await this.cdnService.uploadImage(optimizedBuffer, {
          filename: options.filename || `image.${metadata.format}`,
          contentType: `image/${metadata.format}`,
          path: options.cdnPath,
          transformation: {
            quality: options.quality,
            format: options.format,
            width: options.width,
            height: options.height,
            fit: options.fit,
          },
        });
      } catch (error) {
        console.error('Failed to upload to CDN:', error);
      }
    }

    // Cache the result
    await this.cacheService.set(cacheKey, optimizedBuffer, 'optimized');

    return result;
  }

  async generateThumbnail(buffer: Buffer, options: any = {}): Promise<OptimizationResult> {
    const cacheKey = this.generateCacheKey(buffer, { ...options, type: 'thumbnail' });
    
    // Try to get from cache first
    const cachedResult = await this.cacheService.get(cacheKey, 'thumbnails');
    if (cachedResult) {
      const metadata = await sharp(cachedResult).metadata();
      return {
        buffer: cachedResult,
        metadata: {
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: metadata.format || 'unknown',
          size: cachedResult.length,
        },
      };
    }

    // Process thumbnail if not in cache
    const thumbnailOptions = {
      ...imageConfig.optimization.resize.thumbnail,
      ...options,
      uploadToCdn: true,
      cdnPath: options.cdnPath ? `${options.cdnPath}/thumb` : undefined,
    };

    const result = await this.optimizeBuffer(buffer, thumbnailOptions);
    
    // Cache the thumbnail
    await this.cacheService.set(cacheKey, result.buffer, 'thumbnails');

    return result;
  }

  async generateResponsiveImages(buffer: Buffer, options: any = {}): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];

    for (const size of imageConfig.optimization.resize.responsive) {
      const cacheKey = this.generateCacheKey(buffer, { ...options, ...size, type: 'responsive' });
      
      // Try to get from cache first
      const cachedResult = await this.cacheService.get(cacheKey, 'optimized');
      if (cachedResult) {
        const metadata = await sharp(cachedResult).metadata();
        results.push({
          buffer: cachedResult,
          metadata: {
            width: metadata.width || 0,
            height: metadata.height || 0,
            format: metadata.format || 'unknown',
            size: cachedResult.length,
          },
        });
        continue;
      }

      // Process image if not in cache
      const result = await this.optimizeBuffer(buffer, {
        ...options,
        width: size.width,
        height: size.height,
        uploadToCdn: true,
        cdnPath: options.cdnPath ? `${options.cdnPath}/${size.width}x${size.height}` : undefined,
      });

      // Cache the result
      await this.cacheService.set(cacheKey, result.buffer, 'optimized');

      results.push(result);
    }

    return results;
  }

  async clearCache(): Promise<void> {
    await Promise.all([
      this.cacheService.clear('optimized'),
      this.cacheService.clear('thumbnails'),
    ]);
  }

  getCdnUrl(path: string, options?: any): string {
    return this.cdnService.getUrl(path, options);
  }

  async purgeCdnCache(paths: string[]): Promise<void> {
    await this.cdnService.purgeCache(paths);
  }
} 