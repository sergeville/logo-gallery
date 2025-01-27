'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LogoCard from '../components/LogoCard';
import { ClientLogo } from '../../lib/types';
import Link from 'next/link';

interface PaginatedResponse {
  logos: ClientLogo[];
  pagination: {
    current: number;
    total: number;
    hasMore: boolean;
  };
}

export default function MyLogosPage() {
  const { data: session } = useSession();
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchLogos = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/logos?page=${currentPage}&userId=${session?.user?.id}`);
      if (!response.ok) throw new Error('Failed to load logos');
      
      const data: PaginatedResponse = await response.json();
      setLogos(prevLogos => currentPage === 1 ? data.logos : [...prevLogos, ...data.logos]);
      setHasMore(data.pagination.hasMore);
    } catch (err) {
      setError('Failed to load logos. Please try again later.');
      console.error('Error fetching logos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchLogos();
    }
  }, [currentPage, session?.user?.id]);

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#011627] text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Logos</h1>
          <p>Please sign in to view your logos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#011627] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Logos</h1>
          <Link
            href="/upload"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Upload New Logo
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading && currentPage === 1 ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : logos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">You haven't uploaded any logos yet.</p>
            <Link
              href="/upload"
              className="text-blue-500 hover:text-blue-400 underline"
            >
              Upload your first logo
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {logos.map(logo => (
                <LogoCard key={logo.id} logo={logo} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 