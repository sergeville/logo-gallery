import { ImageOptimizationService } from './ImageOptimizationService';
import { imageCacheService } from './ImageCacheService';

// Create instance
const imageOptimizationService = new ImageOptimizationService();

// Export everything
export { imageCacheService, imageOptimizationService, ImageOptimizationService }; 