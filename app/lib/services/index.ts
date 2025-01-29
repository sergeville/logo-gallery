import { ImageOptimizationService } from '@/app/lib/services/ImageOptimizationService';
import { imageCacheService } from '@/app/lib/services/ImageCacheService';

export const imageOptimizationService = new ImageOptimizationService();

export {
  imageCacheService,
  imageOptimizationService,
  ImageOptimizationService,
}; 