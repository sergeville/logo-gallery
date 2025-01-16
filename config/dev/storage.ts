import path from 'path';

export const storageConfig = {
  uploadDir: path.join(process.cwd(), 'uploads', 'development'),
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['image/png', 'image/jpeg', 'image/svg+xml']
}; 