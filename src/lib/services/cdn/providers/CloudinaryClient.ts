import { CDNProvider, UploadOptions, UploadResult } from '../types';

export class CloudinaryClient implements CDNProvider {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  constructor(config: { cloudName: string; apiKey: string; apiSecret: string }) {
    this.cloudName = config.cloudName;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
  }

  async uploadImage(file: File | Blob, options: UploadOptions): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', options.preset || 'default');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const result = await response.json();
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };
  }

  async deleteImage(publicId: string): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await this.generateSignature(publicId, timestamp);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('signature', signature);
    formData.append('api_key', this.apiKey);
    formData.append('timestamp', timestamp.toString());

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete image from Cloudinary');
    }
  }

  private async generateSignature(publicId: string, timestamp: number): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(`public_id=${publicId}&timestamp=${timestamp}${this.apiSecret}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
} 