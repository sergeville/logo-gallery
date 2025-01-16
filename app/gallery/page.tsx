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

  if (isLoading && currentPage === 1) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Logo Gallery</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logos.map(logo => (
          <LogoCard
            key={logo.id}
            logo={logo}
            onVote={() => !user && setShowAuthModal(true)}
          />
        ))}
      </div>
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
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
  );
} 