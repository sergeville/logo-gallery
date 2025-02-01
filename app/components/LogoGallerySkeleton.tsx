'use client';

import { motion } from 'framer-motion';

interface LogoGallerySkeletonProps {
  count?: number;
  viewMode?: 'grid' | 'list';
}

export default function LogoGallerySkeleton({ count = 8, viewMode = 'grid' }: LogoGallerySkeletonProps) {
  return (
    <div className={`
      ${viewMode === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
        : 'space-y-4'
      }
    `}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
        >
          {/* Image skeleton */}
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse" />
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
            
            {/* Description skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
            </div>

            {viewMode === 'list' && (
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
} 