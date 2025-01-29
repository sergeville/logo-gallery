import { CDNProvider, CDNUploadOptions, CDNUploadResult, CDNTransformOptions } from '../CDNService';
import sharp from 'sharp';
import fetch from 'node-fetch';

interface CloudflareConfig {
  enabled: boolean;
  baseUrl: string;
  zoneId: string;
  apiToken: string;
  options: {
    development: {
      purgeCache: boolean;
      analytics: boolean;
    };
    production: {
      purgeCache: boolean;
      analytics: boolean;
      cacheRules: Array<{
        pattern: string;
        ttl: number;
      }>;
    };
  };
}

export class CloudflareClient implements CDNProvider {
  private config: CloudflareConfig;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: CloudflareConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.headers = {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    };
  }

  async uploadImage(buffer: Buffer, options: CDNUploadOptions): Promise<CDNUploadResult> {
    const metadata = await sharp(buffer).metadata();
    
    // Generate a unique path for the image
    const path = options.path || this.generatePath(options.filename);
    const uploadUrl = `${this.baseUrl}/images/v1/${this.config.zoneId}`;

    // Prepare form data
    const formData = new FormData();
    formData.append('file', new Blob([buffer]), options.filename);
    formData.append('metadata', JSON.stringify({
      ...options.metadata,
      contentType: options.contentType,
      isPublic: options.isPublic !== false,
    }));

    // Upload to Cloudflare Images
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: this.headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image to Cloudflare: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      url: result.result.variants[0],
      publicId: result.result.id,
      metadata: {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: buffer.length,
      },
    };
  }

  getUrl(path: string, options?: CDNTransformOptions): string {
    if (!options) {
      return `${this.baseUrl}/${path}`;
    }

    const params = new URLSearchParams();

    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.quality) params.append('quality', options.quality.toString());
    if (options.format) params.append('format', options.format);
    if (options.fit) params.append('fit', options.fit);
    if (options.background) params.append('background', options.background);
    if (options.dpr) params.append('dpr', options.dpr.toString());
    if (options.auto) params.append('auto', 'format,compress');

    const queryString = params.toString();
    return `${this.baseUrl}/${path}${queryString ? `?${queryString}` : ''}`;
  }

  async purgeCache(paths: string[]): Promise<void> {
    if (!this.config.options.production.purgeCache) {
      return;
    }

    const purgeUrl = `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/purge_cache`;
    
    const response = await fetch(purgeUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        files: paths.map(path => `${this.baseUrl}/${path}`),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to purge Cloudflare cache: ${response.statusText}`);
    }
  }

  private generatePath(filename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = filename.split('.').pop();
    return `${timestamp}-${random}.${extension}`;
  }
} 