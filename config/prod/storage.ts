import path from 'path';

export const storageConfig = {
  uploadDir: path.join(process.cwd(), 'uploads', 'production'),
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['image/png', 'image/jpeg', 'image/svg+xml']
}; 