import path from 'path';

export const storageConfig = {
  uploadDir: path.join(process.cwd(), 'public', 'uploads'),
  maxFileSize: 1 * 1024 * 1024, // 1MB for tests
  allowedFormats: ['image/png', 'image/jpeg', 'image/svg+xml']
}; 