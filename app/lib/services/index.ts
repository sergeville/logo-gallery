import { ImageOptimizationService } from './ImageOptimizationService';
import { imageCacheService } from './ImageCacheService';

export const imageOptimizationService = new ImageOptimizationService();

export {
  imageCacheService,
  imageOptimizationService,
  ImageOptimizationService,
}; 