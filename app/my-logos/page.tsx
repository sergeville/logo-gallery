'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LogoCard from '@/app/components/LogoCard';

interface Logo {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  thumbnailUrl?: string;
  userId: string;
  createdAt: string;
  fileSize?: number;
  optimizedSize?: number;
  compressionRatio?: string;
  ownerName?: string;
}

interface LogoApiResponse {
  _id: string | { toString(): string };
  title?: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  userId: string | { toString(): string };
  createdAt: string;
  fileSize?: number;
  optimizedSize?: number;
  compressionRatio?: string;
  ownerName?: string;
}

export default function MyLogos() {
  const { status } = useSession();
  const router = useRouter();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogos = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching my logos...');
      const response = await fetch('/api/logos?myLogos=true');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/api/auth/signin');
          return;
        }
        throw new Error('Failed to fetch logos');
      }

      const data = await response.json();
      console.log('Received logos data:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Transform the data
      const transformedLogos = data.logos.map((logo: LogoApiResponse) => ({
        _id: typeof logo._id === 'object' ? logo._id.toString() : logo._id,
        title: logo.title || '',
        description: logo.description || '',
        imageUrl: logo.imageUrl || '',
        thumbnailUrl: logo.thumbnailUrl || '',
        userId: typeof logo.userId === 'object' ? logo.userId.toString() : logo.userId,
        createdAt: logo.createdAt,
        fileSize: logo.fileSize,
        optimizedSize: logo.optimizedSize,
        compressionRatio: logo.compressionRatio,
        ownerName: logo.ownerName
      }));

      console.log('Transformed logos:', transformedLogos);
      setLogos(transformedLogos);
    } catch (error) {
      console.error('Error fetching logos:', error);
      setError(error instanceof Error ? error.message : 'Failed to load logos');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchLogos();
    }
  }, [status, router, fetchLogos]);

  // Refresh logos when returning to the page
  useEffect(() => {
    const handleFocus = () => {
      if (status === 'authenticated') {
        fetchLogos();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [status, fetchLogos]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">My Logos</h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">My Logos</h1>
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Logos</h1>
        <button
          onClick={() => router.push('/upload')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
        >
          Upload New Logo
        </button>
      </div>
      
      {logos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">You haven't uploaded any logos yet.</p>
          <button
            onClick={() => router.push('/upload')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
          >
            Upload Your First Logo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logos.map((logo) => (
            <LogoCard
              key={logo._id}
              logo={logo}
              showDelete={true}
              showStats={true}
              isOwner={true}
            />
          ))}
        </div>
      )}
    </div>
  );
} 