export interface CDNUploadOptions {
  folder?: string;
  public_id?: string;
  tags?: string[];
  transformation?: Record<string, any>;
}

export interface CDNUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

export interface CDNTransformOptions {
  width?: number;
  height?: number;
  format?: string;
  quality?: number;
  crop?: string;
}

export interface CDNProvider {
  uploadImage(buffer: Buffer, options: CDNUploadOptions): Promise<CDNUploadResult>;
  getUrl(path: string, options?: CDNTransformOptions): string;
} 