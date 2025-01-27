'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LogoCard from '@/app/components/LogoCard';
import { ClientLogo } from '@/lib/types';
import { Search, SortAsc, SortDesc } from 'lucide-react';
import { debounce } from 'lodash';

interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate: string;
  totalLogos: number;
  totalVotes: number;
  averageRating: number;
}

interface UserLogo {
  _id: string;
  name: string;
  imageUrl: string;
  uploadedAt: string;
  averageRating: number;
  totalVotes: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 12;

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
  }, [page, sortBy, sortOrder, selectedTag, searchTerm, session]);

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    if (session?.user) {
      fetchUserProfile();
      fetchUserLogos();
    }
  }, [session, status]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', err);
    }
  };

  const fetchUserLogos = async () => {
    try {
      const response = await fetch(`/api/logos?userId=${session?.user?.id}`);
      const data = await response.json();
      setLogos(data.logos || []);
    } catch (error) {
      console.error('Error fetching user logos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Welcome back, {session?.user?.name}!
          </p>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start gap-6">
            <div className="relative h-24 w-24 rounded-full overflow-hidden">
              <Image
                src={session?.user?.image || '/default-avatar.svg'}
                alt={session?.user?.name || 'Profile'}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile?.name}</h1>
              <p className="text-gray-600">{profile?.email}</p>
              {profile?.bio && (
                <p className="mt-2 text-gray-700">{profile.bio}</p>
              )}
              <div className="mt-4 flex gap-4">
                {profile?.location && (
                  <span className="text-sm text-gray-600">
                    📍 {profile.location}
                  </span>
                )}
                {profile?.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    🌐 Website
                  </a>
                )}
                <span className="text-sm text-gray-600">
                  📅 Joined {new Date(profile?.joinedDate || '').toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{profile?.totalLogos || 0}</div>
              <div className="text-gray-600">Logos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{profile?.totalVotes || 0}</div>
              <div className="text-gray-600">Total Votes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {profile?.averageRating?.toFixed(1) || '0.0'}
              </div>
              <div className="text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>

        {/* User's Logos */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Logos</h2>
          
          <div className="mb-8 space-y-4">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search your logos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary-blue focus:border-primary-blue"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')}
                  className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 pl-3 pr-10"
                >
                  <option value="date">Date</option>
                  <option value="rating">Rating</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {sortOrder === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
                </button>
              </div>
            </form>

            {tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <button
                  key="all"
                  onClick={() => setSelectedTag('')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTag === ''
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
            <div className="text-red-500 text-center mb-4">
              {error}
            </div>
          )}

          {logos.length === 0 && !loading ? (
            <div className="text-center text-gray-600 dark:text-gray-300">
              <p>You haven't uploaded any logos yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {logos.map((logo, index) => (
                <div
                  key={`${logo._id}-${index}`}
                  ref={index === logos.length - 1 ? lastLogoElementRef : undefined}
                >
                  <LogoCard
                    name={logo.name}
                    imageUrl={logo.imageUrl}
                    uploadedAt={logo.uploadedAt}
                    totalVotes={logo.totalVotes}
                    rating={logo.averageRating}
                    ownerName={logo.ownerName}
                    ownerId={logo.ownerId}
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
        </div>
      </div>
    </div>
  );
} 