'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash-es';
import LogoCard from '../components/LogoCard';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';

interface Logo {
  _id: string;
  name: string;
  imageUrl: string;
  description: string;
  tags: string[];
  uploadedAt: string;
  averageRating: number;
  totalVotes: number;
  ownerName: string;
  ownerId: string;
}

export default function MyLogosPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 12;

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  const fetchLogos = useCallback(async (resetPage = false) => {
    if (!session?.user) return;
    
    try {
      setLoading(true);
      const currentPage = resetPage ? 1 : page;
      const queryParams = new URLSearchParams({
        sortBy,
        sortOrder,
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        userId: session.user.id,
        ...(selectedTag && { tag: selectedTag }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/logos?${queryParams}`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/api/auth/signin');
          return;
        }
        throw new Error('Failed to fetch logos');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Filter logos to only show the current user's logos
      const userLogos = data.logos.filter((logo: Logo) => logo.ownerId === session.user.id);
      setLogos(prev => resetPage ? userLogos : [...prev, ...userLogos]);
      setHasMore(data.pagination.hasMore);
      
      // Extract unique tags only on first load
      if (currentPage === 1 && userLogos.length > 0) {
        const allTags = userLogos.flatMap((logo: Logo) => logo.tags || []);
        setTags(Array.from(new Set(allTags.filter(Boolean))));
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load logos');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, selectedTag, searchTerm, session, router]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchLogos(true);
  }, [sortBy, sortOrder, selectedTag]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(() => {
      setPage(1);
      setHasMore(true);
      fetchLogos(true);
    }, 300),
    [fetchLogos]
  );

  useEffect(() => {
    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  // Intersection Observer for infinite scroll
  const observer = useRef<IntersectionObserver>();
  const lastLogoElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    if (page > 1) {
      fetchLogos(false);
    }
  }, [page, fetchLogos]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogos(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              My Logos
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and organize your uploaded logos
            </p>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-center mb-4">
            {error}
          </div>
        )}

        {logos.length === 0 && !loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            You haven't uploaded any logos yet. Click the Upload Logo button to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logos.map((logo, index) => (
              <div
                key={`${logo._id}-${index}`}
                ref={index === logos.length - 1 ? lastLogoElementRef : undefined}
              >
                <LogoCard
                  name={logo.name}
                  imageUrl={logo.imageUrl}
                  uploadedAt={new Date(logo.uploadedAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  rating={logo.averageRating}
                  totalVotes={logo.totalVotes}
                  ownerName={logo.ownerName}
                  description={logo.description}
                  tags={logo.tags}
                />
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center h-20 mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
          </div>
        )}
      </main>
    </div>
  );
} 