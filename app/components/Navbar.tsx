'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import SignInModal from './SignInModal';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  return (
    <>
      <nav className="bg-[#0f1524] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-12 items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center">
                <span className="text-sm font-medium">
                  Logo Gallery
                </span>
              </Link>
              <Link 
                href="/gallery"
                className="text-gray-300 hover:text-white text-sm"
              >
                Gallery
              </Link>
              {session?.user && (
                <Link 
                  href="/mylogos"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  My Logos
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-6">
              {session?.user ? (
                <>
                  <Link
                    href="/upload"
                    className="text-gray-300 hover:text-white text-sm"
                  >
                    Upload Logo
                  </Link>
                  <span className="text-sm text-gray-300">
                    {session.user.name}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-300 hover:text-white text-sm"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsSignInModalOpen(true)}
                  className="text-gray-300 hover:text-white text-sm"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <SignInModal 
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </>
  );
} 