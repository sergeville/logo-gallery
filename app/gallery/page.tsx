'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash-es';
import LogoCard from '../components/LogoCard';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';

interface Logo {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  responsiveUrls?: Record<string, string>;
  fileSize?: number;
  optimizedSize?: number;
  compressionRatio?: string;
  userId: string;
  createdAt: string;
  tags?: string[];
}

export default function GalleryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
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
      
      setLogos(prev => resetPage ? data.logos : [...prev, ...data.logos]);
      setHasMore(data.pagination.hasMore);
      
      // Extract unique tags only on first load
      if (currentPage === 1 && data.logos.length > 0) {
        const allTags = data.logos.flatMap((logo: Logo) => logo.tags || []);
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
              Logo Gallery
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Discover and share beautiful logos from around the world
            </p>
          </div>
          {session?.user && (
            <button
              onClick={() => router.push('/upload')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
            >
              Upload Logo
            </button>
          )}
        </div>

        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search logos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-blue focus:border-primary-blue"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date')}
                className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 pl-3 pr-10"
              >
                <option value="date">Date</option>
                <option value="optimization">Optimization</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                data-testid="sort-order-button"
              >
                {sortOrder === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
              </button>
            </div>
          </form>

          {tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                key="all"
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTag === null
                    ? 'bg-primary-blue text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                All
              </button>
              {tags.map((tag) => (
                <button
                  key={`tag-${tag}`}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTag === tag
                      ? 'bg-primary-blue text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-md mb-8">
            {error}
          </div>
        )}

        {logos.length === 0 && !loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No logos found. {session?.user ? 'Upload your first logo!' : 'Sign in to upload logos!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logos.map((logo, index) => (
              <div
                key={logo._id}
                ref={index === logos.length - 1 ? lastLogoElementRef : undefined}
              >
                <LogoCard
                  logo={logo}
                  showStats={true}
                  isOwner={session?.user?.id === logo.userId}
                />
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        )}
      </main>
    </div>
  );
} 