'use client';

import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { useState } from 'react';
import AuthModal from './AuthModal';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';

export default function Navbar() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: '/', redirect: false });
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({ redirect: false });
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowAuthModal(false);
    router.refresh();
  };

  return (
    <nav className="bg-[#0A1A2F] border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-xl font-bold text-white">
            Logo Gallery
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/gallery" className="text-gray-300 hover:text-white transition-colors">
              Gallery
            </Link>
            <Link href="/vote" className="text-gray-300 hover:text-white transition-colors">
              Vote
            </Link>
            {user && (
              <Link href="/my-logos" className="text-gray-300 hover:text-white transition-colors">
                My Logos
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link 
                href="/upload" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Upload Logo
              </Link>
              <span className="text-gray-300">
                {user.name || 'Test User'}
              </span>
              <button 
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </>
          ) : (
            <button 
              onClick={handleSignIn}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </nav>
  );
} 