'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Sun, Moon, Menu, X, Loader } from 'lucide-react';
import { Transition } from '@headlessui/react';
import ErrorBoundary from './ErrorBoundary';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { data: session, status } = useSession();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const navigationLinks = [
    { href: '/gallery', label: 'Gallery' },
    ...(session ? [
      { href: '/my-logos', label: 'My Logos' },
      { href: '/upload', label: 'Upload Logo' }
    ] : [])
  ];

  // Loading state component
  const LoadingState = () => (
    <div className="flex items-center justify-center h-12 bg-[#0f1524]">
      <Loader className="animate-spin h-5 w-5 text-gray-400" />
    </div>
  );

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return <LoadingState />;
  }

  const isCurrentPage = (href: string) => pathname === href;

  return (
    <ErrorBoundary 
      fallback={
        <div className="bg-[#0f1524] h-12 flex items-center justify-center">
          <span className="text-red-400">Navigation error. Please refresh.</span>
        </div>
      }
    >
      <header className="bg-[#0f1524] shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" role="navigation">
          <div className="flex justify-between items-center h-12">
            {/* Left side - Logo */}
            <div className="flex-shrink-0">
              <Link 
                href="/" 
                className="text-xl font-bold text-gray-400 hover:text-white transition-colors"
                aria-label="Home"
              >
                Logo Gallery
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button
                type="button"
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-6">
              {navigationLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm transition-colors ${
                    isCurrentPage(href)
                      ? 'text-white font-medium'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  aria-current={isCurrentPage(href) ? 'page' : undefined}
                >
                  {label}
                </Link>
              ))}
              
              {/* User Menu */}
              {status === 'loading' ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse h-8 w-8 rounded-full bg-gray-700" />
                  <div className="animate-pulse h-4 w-20 bg-gray-700 rounded" />
                </div>
              ) : session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">
                    {session.user?.name}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                    aria-label="Sign out"
                  >
                    Sign Out
                  </button>
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt=""
                      width={32}
                      height={32}
                      className="rounded-full"
                      role="presentation"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-700" />
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              )}
              
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <Transition
            show={isMenuOpen}
            enter="transition duration-150 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition duration-100 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div 
              className="sm:hidden" 
              role="dialog" 
              aria-modal="true"
              id="mobile-menu"
            >
              <div className="pt-2 pb-4 space-y-1">
                {navigationLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`block px-3 py-2 text-base transition-colors ${
                      isCurrentPage(href)
                        ? 'text-white font-medium bg-gray-800'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={isCurrentPage(href) ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                ))}
                {status === 'loading' ? (
                  <div className="animate-pulse h-10 bg-gray-700 mx-3 rounded" />
                ) : session ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-400">
                      {session.user?.name}
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base text-gray-400 hover:text-white transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="block px-3 py-2 text-base text-gray-400 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </Transition>
        </nav>
      </header>
    </ErrorBoundary>
  );
} 