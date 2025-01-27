'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import AuthModal from './AuthModal';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignIn = () => {
    signIn(undefined, { callbackUrl: '/', redirect: false });
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.refresh();
  };

  const handleLoginSuccess = () => {
    setShowAuthModal(false);
    router.refresh();
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Site name on the left */}
        <Link href="/" className="text-xl font-bold nav-link">
          Logo Gallery
        </Link>

        {/* Navigation links and buttons on the right */}
        <div className="flex items-center space-x-6">
          <Link href="/gallery" className="nav-link">
            Gallery
          </Link>
          <Link href="/vote" className="nav-link">
            Vote
          </Link>
          {user && (
            <Link href="/my-logos" className="nav-link">
              My Logos
            </Link>
          )}
          {user ? (
            <>
              <Link 
                href="/upload" 
                className="btn-primary"
              >
                Upload Logo
              </Link>
              <span className="nav-link">
                {user.name || 'Test User'}
              </span>
              <button 
                onClick={handleSignOut}
                className="nav-link"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button 
              onClick={handleSignIn}
              className="btn-primary"
            >
              Sign In
            </button>
          )}
          <ThemeToggle />
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