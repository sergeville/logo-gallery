'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import LogoCard from '../components/LogoCard';

interface Logo {
  _id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
  averageRating: number;
  totalVotes: number;
}

export default function Gallery() {
  const { data: session } = useSession();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogos() {
      try {
        const response = await fetch('/api/logos');
        const data = await response.json();
        setLogos(data.logos);
      } catch (error) {
        console.error('Error fetching logos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLogos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Logo Gallery</h1>
          {session?.user && (
            <p className="mt-2 text-sm text-gray-600">
              Welcome back, {session.user.name}! Browse through our collection of logos.
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
          ) : logos.length > 0 ? (
            logos.map((logo) => (
              <LogoCard
                key={logo._id}
                name={logo.name}
                imageUrl={logo.imageUrl}
                uploadedAt={logo.uploadedAt || logo.createdAt}
                rating={logo.averageRating || 0}
                totalVotes={logo.totalVotes || 0}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 py-12">
              No logos have been uploaded yet. Be the first to share your logo!
            </p>
          )}
        </div>
      </main>
    </div>
  );
} 