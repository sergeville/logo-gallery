'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LogoCard from '../components/LogoCard';
import AuthModal from '../components/AuthModal';
import Header from '../components/Header';
import { Logo } from '../models/Logo';

export default function GalleryPage() {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;

    const loadLogos = async () => {
      try {
        const response = await fetch('/api/logos');
        const data = await response.json();
        if (mounted) {
          setLogos(Array.isArray(data.logos) ? data.logos : []);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching logos:', error);
        if (mounted) {
          setLoading(false);
          setError('Failed to load logos');
        }
      }
    };

    loadLogos();
    return () => {
      mounted = false;
    };
  }, []);

  const handleVote = async (logoId: string, rating: number) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const response = await fetch(`/api/logos/${logoId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      const updatedLogo = await response.json();
      setLogos(logos.map(logo => 
        logo._id === logoId ? { ...logo, ...updatedLogo } : logo
      ));
    } catch (error) {
      console.error('Error voting:', error);
      setError('Failed to submit vote');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header onLoginClick={() => setShowAuthModal(true)} />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center" role="status" aria-label="Loading">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" data-testid="gallery-container">
      <Header onLoginClick={() => setShowAuthModal(true)} />

      <main className="container mx-auto p-4" data-testid="gallery-main">
        {error ? (
          <div className="mb-4 text-red-500" data-testid="error-message">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="logo-grid">
            {logos.map((logo) => (
              <LogoCard
                key={logo._id}
                logo={{
                  ...logo,
                  thumbnailUrl: logo.thumbnailUrl ?? '',
                  ownerId: logo.ownerId ?? '',
                  tags: logo.tags ?? [],
                  category: logo.category ?? '',
                  createdAt: logo.createdAt instanceof Date ? logo.createdAt : new Date(logo.createdAt || Date.now()),
                  updatedAt: logo.updatedAt || new Date(),
                  averageRating: logo.averageRating || 0,
                  totalVotes: logo.totalVotes || 0
                }}
                onVote={(rating: number) => handleVote(logo._id.toString(), rating)}
                onAuthRequired={() => setShowAuthModal(true)}
              />
            ))}
          </div>
        )}
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
} 