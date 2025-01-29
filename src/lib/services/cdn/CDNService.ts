import { cdnConfig } from '@/config/cdn.config';
import { CloudflareClient } from './providers/CloudflareClient';
import { CloudinaryClient } from './providers/CloudinaryClient';

export interface CDNProvider {
  uploadImage(buffer: Buffer, options: CDNUploadOptions): Promise<CDNUploadResult>;
  getUrl(path: string, options?: CDNTransformOptions): string;
  purgeCache(paths: string[]): Promise<void>;
}

export interface CDNUploadOptions {
  filename: string;
  contentType: string;
  metadata?: Record<string, string>;
  path?: string;
  isPublic?: boolean;
  transformation?: CDNTransformOptions;
}

export interface CDNUploadResult {
  url: string;
  publicId: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

export interface CDNTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  background?: string;
  dpr?: number;
  auto?: boolean;
}

export class CDNService {
  private providers: Map<string, CDNProvider> = new Map();
  private defaultProvider: string;

  constructor() {
    this.defaultProvider = cdnConfig.defaultProvider;
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize Cloudflare provider
    if (cdnConfig.providers.cloudflare.enabled) {
      this.providers.set('cloudflare', new CloudflareClient(cdnConfig.providers.cloudflare));
    }

    // Initialize Cloudinary provider
    if (cdnConfig.providers.cloudinary.enabled) {
      this.providers.set('cloudinary', new CloudinaryClient(cdnConfig.providers.cloudinary));
    }
  }

  private getProvider(name?: string): CDNProvider {
    const providerName = name || this.defaultProvider;
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      throw new Error(`CDN provider '${providerName}' not found or not enabled`);
    }

    return provider;
  }

  async uploadImage(
    buffer: Buffer,
    options: CDNUploadOptions,
    provider?: string
  ): Promise<CDNUploadResult> {
    return await this.getProvider(provider).uploadImage(buffer, options);
  }

  getUrl(path: string, options?: CDNTransformOptions, provider?: string): string {
    return this.getProvider(provider).getUrl(path, options);
  }

  async purgeCache(paths: string[], provider?: string): Promise<void> {
    await this.getProvider(provider).purgeCache(paths);
  }
} 