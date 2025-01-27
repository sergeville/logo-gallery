'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import LogoCard from '../components/LogoCard';

interface Logo {
  _id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
  averageRating: number;
  totalVotes: number;
}

export default function VotePage() {
  const { data: session } = useSession();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);

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

  const handleVote = async (logoId: string) => {
    if (!session?.user) {
      // TODO: Redirect to login or show message
      return;
    }

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logoId }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update local state
        setLogos(logos.map(logo => 
          logo._id === logoId 
            ? { ...logo, totalVotes: data.totalVotes }
            : logo
        ));
        setSelectedLogoId(data.isVoted ? logoId : null);
      } else {
        console.error('Error voting:', data.error);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Vote for Your Favorite Logo</h1>
          {session?.user && (
            <p className="mt-2 text-sm text-gray-600">
              Welcome back, {session.user.name}! Select one logo to vote.
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
                uploadedAt={logo.createdAt}
                rating={logo.averageRating || 0}
                totalVotes={logo.totalVotes || 0}
                isVoted={selectedLogoId === logo._id}
                onVote={() => handleVote(logo._id)}
                isRadioStyle={true}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 py-12">
              No logos available for voting yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
} 