'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { AuthModal } from '@/app/components/AuthModal';
import { LogoCard } from '@/app/components/LogoCard';
import { ClientLogo } from '@/app/lib/types';

interface PaginatedResponse {
  logos: ClientLogo[];
  pagination: {
    current: number;
    total: number;
    hasMore: boolean;
  };
}

export default function GalleryPage() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchLogos = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/logos?page=${currentPage}`);
      if (!response.ok) throw new Error('Failed to fetch logos');
      const data: PaginatedResponse = await response.json();
      setLogos(prevLogos => currentPage === 1 ? data.logos : [...prevLogos, ...data.logos]);
      setHasMore(data.pagination.hasMore);
    } catch (err) {
      console.error('Error fetching logos:', err);
      setError('Failed to load logos. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, [currentPage]);

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0A1A2F] py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Logo Gallery</h1>
          <div className="flex gap-4">
            {/* Add search and filter controls here later */}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-lg mb-8">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {isLoading && currentPage === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#0A1A2F] rounded-xl shadow-lg p-6 animate-pulse">
                <div className="relative aspect-[4/3] mb-4 bg-gray-800 rounded-lg"></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-800 rounded w-16"></div>
                    <div className="h-6 bg-gray-800 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {logos.map(logo => (
              <LogoCard
                key={logo.id}
                logo={logo}
                onVote={() => !user && setShowAuthModal(true)}
              />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={handleLoadMore}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-3 rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}

        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onLoginSuccess={() => setShowAuthModal(false)}
          />
        )}
      </div>
    </div>
  );
} 