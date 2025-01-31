'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SortAsc, SortDesc, Grid, List } from 'lucide-react';
import LogoCard from './LogoCard';

interface Logo {
  _id: string
  title: string
  description: string
  imageUrl: string
  thumbnailUrl: string
  responsiveUrls?: Record<string, string>
  userId: string
  createdAt: string | Date | undefined
  totalVotes?: number
  fileSize?: number
  optimizedSize?: number
  compressionRatio?: string
}

interface LogoGalleryProps {
  logos: Logo[];
  className?: string;
}

type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export default function LogoGallery({ logos, className = '' }: LogoGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filteredLogos, setFilteredLogos] = useState<Logo[]>(logos);

  useEffect(() => {
    let result = [...logos];

    // Filter based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        logo =>
          logo.title.toLowerCase().includes(query) ||
          logo.description.toLowerCase().includes(query)
      );
    }

    // Sort logos
    result.sort((a, b) => {
      const comparison = a.title.localeCompare(b.title);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredLogos(result);
  }, [logos, searchQuery, sortDirection]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
          <input
            type="text"
            placeholder="Search logos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-2 rounded-lg bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            aria-label="Toggle sort direction"
          >
            {sortDirection === 'asc' ? (
              <SortAsc className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <SortDesc className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
          <button
            onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            aria-label="Toggle view mode"
          >
            {viewMode === 'grid' ? (
              <List className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Grid className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Gallery */}
      <AnimatePresence mode="wait">
        <motion.div
          layout
          className={`
            ${viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
              : 'space-y-4'
            }
          `}
        >
          {filteredLogos.map((logo) => (
            <motion.div
              key={logo._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <LogoCard
                logo={logo}
                showStats={viewMode === 'list'}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty state */}
      {filteredLogos.length === 0 && (
        <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No logos found matching your search.</p>
        </div>
      )}
    </div>
  );
} 