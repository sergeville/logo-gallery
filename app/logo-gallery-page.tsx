'use client';

import React from 'react';
import { Search, User } from 'lucide-react';
import LogoImage from '@/app/components/LogoImage';

interface Logo {
  id: string;
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  responsiveUrls?: Record<string, string>;
  fileSize?: number;
  optimizedSize?: number;
  compressionRatio?: string;
}

/**
 * Logo Gallery Page Component
 * Displays a responsive grid of logo cards with interactive features.
 * Includes logo display and action buttons.
 */

/**
 * Main logo gallery component
 * Features:
 * - Responsive grid layout (1-3 columns based on screen size)
 * - Logo cards with image display and error handling
 * - Action buttons for details
 */
export default function LogoGallery() {
  // Sample logo data
  const logos: Logo[] = [
    { 
      id: '1',
      name: 'Logo 1',
      title: 'Logo 1',
      description: 'Sample logo description',
      imageUrl: '/placeholder/200/200',
      thumbnailUrl: '/placeholder/200/200',
    },
    { 
      id: '2',
      name: 'Logo 2',
      title: 'Logo 2',
      description: 'Sample logo description',
      imageUrl: '/placeholder/200/200',
      thumbnailUrl: '/placeholder/200/200',
    },
    { 
      id: '3',
      name: 'Logo 3',
      title: 'Logo 3',
      description: 'Sample logo description',
      imageUrl: '/placeholder/200/200',
      thumbnailUrl: '/placeholder/200/200',
    }
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black" data-testid="logo-gallery">
      {/* Header */}
      <header className="fixed w-full backdrop-blur-lg bg-white/70 dark:bg-black/70 h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <h1 className="text-xl font-bold dark:text-white">Logo Gallery</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="search"
                placeholder="Search logos..."
                className="pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 dark:text-white"
                data-testid="search-input"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              data-testid="user-menu-button"
              aria-label="User menu"
            >
              <User className="dark:text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 pb-8" data-testid="main-content">
        <div className="max-w-7xl mx-auto">
          {/* Gallery container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="gallery-container">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="bg-white dark:bg-[#1C1C1E] rounded-xl shadow-sm hover:shadow-md transition-shadow p-4"
                data-testid="logo-card"
              >
                {/* Logo image container with optimization info */}
                <div className="relative" data-testid="logo-image-container">
                  <LogoImage
                    src={logo.thumbnailUrl}
                    alt={logo.title}
                    responsiveUrls={logo.responsiveUrls}
                    className="w-full aspect-square"
                    data-testid="logo-image"
                  />
                  
                  {logo.compressionRatio && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                      {logo.compressionRatio}% optimized
                    </div>
                  )}
                </div>
                
                {/* Logo information section */}
                <div className="mt-4" data-testid="logo-info">
                  <h3 className="text-lg font-medium dark:text-white">{logo.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {logo.description}
                  </p>
                  
                  {/* File size information */}
                  {logo.fileSize && logo.optimizedSize && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Original: {formatFileSize(logo.fileSize)}</span>
                      <span className="mx-2">•</span>
                      <span>Optimized: {formatFileSize(logo.optimizedSize)}</span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex gap-2">
                  <button 
                    className="flex-1 border border-[#007AFF] text-[#007AFF] dark:text-white py-2 rounded-lg hover:bg-[#007AFF] hover:text-white transition-colors"
                    data-testid="details-button"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper function to format file sizes
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
