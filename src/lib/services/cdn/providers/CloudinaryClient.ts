import { CDNProvider, CDNUploadOptions, CDNUploadResult, CDNTransformOptions } from '../CDNService';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

interface CloudinaryConfig {
  enabled: boolean;
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  options: {
    secure: boolean;
    cdn_subdomain: boolean;
    transformation: {
      quality: string;
      fetchFormat: string;
    };
  };
}

export class CloudinaryClient implements CDNProvider {
  private config: CloudinaryConfig;

  constructor(config: CloudinaryConfig) {
    this.config = config;
    
    // Initialize Cloudinary
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: config.options.secure,
    });
  }

  async uploadImage(buffer: Buffer, options: CDNUploadOptions): Promise<CDNUploadResult> {
    const metadata = await sharp(buffer).metadata();

    // Convert buffer to base64
    const base64Data = buffer.toString('base64');
    const uploadStr = `data:${options.contentType};base64,${base64Data}`;

    // Prepare upload options
    const uploadOptions = {
      public_id: options.path || undefined,
      folder: !options.path ? 'logos' : undefined,
      resource_type: 'image',
      ...options.transformation,
    };

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(uploadStr, uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
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
      return cloudinary.url(path, {
        secure: this.config.options.secure,
        cdn_subdomain: this.config.options.cdn_subdomain,
      });
    }

    const transformation: any = {
      secure: this.config.options.secure,
      cdn_subdomain: this.config.options.cdn_subdomain,
    };

    if (options.width) transformation.width = options.width;
    if (options.height) transformation.height = options.height;
    if (options.quality) transformation.quality = options.quality;
    if (options.format) transformation.fetch_format = options.format;
    if (options.fit) {
      switch (options.fit) {
        case 'cover':
          transformation.crop = 'fill';
          break;
        case 'contain':
          transformation.crop = 'fit';
          break;
        case 'fill':
          transformation.crop = 'scale';
          break;
        case 'inside':
          transformation.crop = 'limit';
          break;
        case 'outside':
          transformation.crop = 'mfit';
          break;
      }
    }
    if (options.background) transformation.background = options.background.replace('#', 'rgb:');
    if (options.dpr) transformation.dpr = options.dpr;
    if (options.auto) {
      transformation.fetch_format = 'auto';
      transformation.quality = 'auto';
    }

    return cloudinary.url(path, transformation);
  }

  async purgeCache(paths: string[]): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      cloudinary.api.delete_resources(paths, (error: any) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
} 