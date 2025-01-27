'use client';

import { useState } from 'react';
import AuthModal from '@/components/AuthModal';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  const handleSignIn = () => {
    setShowAuthModal(true);
  };

  const handleLoginSuccess = () => {
    setShowAuthModal(false);
    router.refresh();
  };

  const loading = status === 'loading';
  const user = session?.user;

  return (
    <main className="min-h-screen bg-[#0A1A2F] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {session ? (
          <div className="container mx-auto px-4 py-24 text-center max-w-4xl">
            <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
              Welcome to Logo Gallery
            </h1>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Discover and share beautiful logos from around the world
            </p>
            
            <div className="mt-16">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Latest Uploads
              </h2>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-800 rounded w-1/2 mx-auto"></div>
                  <div className="h-10 bg-gray-800 rounded w-48 mx-auto"></div>
                </div>
              ) : user ? (
                <div className="space-y-8">
                  <p className="text-gray-300 text-lg">
                    Welcome back, {user.name || 'Test User'}!
                  </p>
                  <div className="flex justify-center gap-6">
                    <Link
                      href="/upload"
                      className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg transition-colors font-medium text-lg"
                    >
                      Upload New Logo
                    </Link>
                    <Link
                      href="/gallery"
                      className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg transition-colors font-medium text-lg"
                    >
                      Browse Gallery
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-gray-300 text-lg">
                    Sign in to start uploading and voting on logos
                  </p>
                  <button
                    onClick={handleSignIn}
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg transition-colors font-medium text-lg shadow-lg hover:shadow-xl"
                  >
                    Sign In to Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-white text-center tracking-tight mb-6">
              Welcome to Logo Gallery
            </h1>
            <p className="text-xl text-gray-300 text-center mb-12">
              Discover and share beautiful logos from around the world
            </p>
            <div className="text-center">
              <button
                onClick={handleSignIn}
                className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in to Get Started
              </button>
            </div>
          </>
        )}
      </div>
      
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </main>
  );
} 