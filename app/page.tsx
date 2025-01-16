'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/AuthModal';

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      setShowAuthModal(false);
    }
  }, [user]);

  return (
    <main className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Welcome to Logo Gallery</h1>
        <p className="text-lg mb-8">
          A curated collection of beautiful logos. Browse, vote, and share your favorites.
        </p>
        {!loading && !user && (
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Sign In to Vote
          </button>
        )}
      </div>
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={() => setShowAuthModal(false)}
        />
      )}
    </main>
  );
}