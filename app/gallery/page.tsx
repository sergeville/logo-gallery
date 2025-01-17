'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
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
}

export default function GalleryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetchLogos();
  }, [sortBy, sortOrder, selectedTag]);

  const fetchLogos = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        sortBy,
        sortOrder,
        ...(selectedTag && { tag: selectedTag }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/logos?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch logos');
      
      const data = await response.json();
      setLogos(data.logos);
      
      // Extract unique tags
      const allTags = data.logos.flatMap((logo: Logo) => logo.tags);
      setTags(Array.from(new Set(allTags)));
    } catch (error) {
      setError('Failed to load logos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogos();
  };

  const filteredLogos = logos.filter(logo => 
    logo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    logo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    logo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Logo Gallery
          </h1>
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
                  key={tag}
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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 dark:text-red-400">{error}</div>
        ) : filteredLogos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLogos.map((logo) => (
              <LogoCard
                key={logo._id}
                name={logo.name}
                imageUrl={logo.imageUrl}
                uploadedAt={logo.uploadedAt}
                rating={logo.averageRating}
                totalVotes={logo.totalVotes}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No logos found. {session?.user && 'Be the first to upload one!'}
          </div>
        )}
      </main>
    </div>
  );
} 