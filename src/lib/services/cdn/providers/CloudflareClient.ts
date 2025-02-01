import { CDNProvider, CDNUploadOptions, CDNUploadResult, CDNTransformOptions } from '../types';
import fetch from 'node-fetch';

interface CloudflareConfig {
  accountId: string;
  apiToken: string;
  imageDeliveryUrl: string;
  zoneId?: string;
}

export class CloudflareClient implements CDNProvider {
  private config: CloudflareConfig;
  private headers: Record<string, string>;

  constructor(config: CloudflareConfig) {
    this.config = config;
    this.headers = {
      Authorization: `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  async uploadImage(buffer: Buffer, options: CDNUploadOptions): Promise<CDNUploadResult> {
    const formData = new FormData();
    formData.append('file', new Blob([buffer]));
    
    if (options.public_id) {
      formData.append('filename', options.public_id);
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }

    const result = await response.json() as {
      result: {
        id: string;
        variants: string[];
      };
    };

    return {
      url: result.result.variants[0],
      publicId: result.result.id,
    };
  }

  getUrl(path: string, options?: CDNTransformOptions): string {
    let url = `${this.config.imageDeliveryUrl}/${path}`;
    
    if (options) {
      const params = new URLSearchParams();
      
      if (options.width) params.append('width', options.width.toString());
      if (options.height) params.append('height', options.height.toString());
      if (options.format) params.append('format', options.format);
      if (options.quality) params.append('quality', options.quality.toString());
      if (options.crop) params.append('fit', options.crop);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    return url;
  }

  async purgeCache(paths: string[]): Promise<void> {
    if (!this.config.zoneId) {
      throw new Error('Zone ID is required for cache purging');
    }

    const purgeUrl = `https://api.cloudflare.com/client/v4/zones/${this.config.zoneId}/purge_cache`;
    
    const response = await fetch(purgeUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        files: paths.map(path => `${this.config.imageDeliveryUrl}/${path}`),
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