'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface Logo {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  tags: string[];
  ownerId: string;
  createdAt: string;
}

export default function LogoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [logo, setLogo] = useState<Logo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch(`/api/logos/${params.id}`);
        if (!response.ok) {
          throw new Error('Logo not found');
        }
        const data = await response.json();
        setLogo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load logo');
        setTimeout(() => {
          router.push('/gallery');
        }, 3000);
      }
    };

    fetchLogo();
  }, [params.id, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-semibold text-red-500 mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to gallery...</p>
        </div>
      </div>
    );
  }

  if (!logo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="relative w-full aspect-video mb-6">
            <Image
              src={logo.imageUrl}
              alt={logo.name}
              fill
              className="object-contain rounded-lg"
              priority
            />
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {logo.name}
          </h1>
          
          {logo.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {logo.description}
            </p>
          )}
          
          {logo.tags && logo.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {logo.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-primary-blue/10 text-primary-blue rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <span>
              Uploaded on {new Date(logo.createdAt).toLocaleDateString()}
            </span>
            {session?.user?.id === logo.ownerId && (
              <button
                onClick={() => router.push(`/mylogos`)}
                className="text-primary-blue hover:text-blue-600"
              >
                Manage Logo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 