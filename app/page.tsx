'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, User } from 'lucide-react';

interface Logo {
  _id: string;
  name: string;
  url: string | undefined;
  path: string;
  description?: string;
  userId?: {
    username: string;
    profileImage: string;
  };
  tags: string[];
  averageRating: number;
}

interface User {
  _id: string;
  username: string;
  email: string;
  profileImage?: string;
}

export default function Page() {
  const [darkMode, setDarkMode] = useState(false);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Dark mode effect
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Fetch logos
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await fetch('/api/logos');
        if (!response.ok) {
          throw new Error('Failed to fetch logos');
        }
        const data = await response.json();
        console.log('Raw logo data:', JSON.stringify(data, null, 2));
        setLogos(data.logos);
      } catch (err) {
        console.error('Error details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch logos');
      } finally {
        setLoading(false);
      }
    };

    fetchLogos();
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getImageUrl = (logo: Logo | undefined) => {
    if (!logo) {
      return 'https://placehold.co/400x380/666666/FFFFFF?text=No+Logo+Data';
    }

    if (!logo.path && !logo.url) {
      return 'https://placehold.co/400x380/666666/FFFFFF?text=No+Image+Path';
    }

    if (logo.url?.startsWith('http')) {
      return logo.url;
    }

    // Remove /api/ and handle trailing slash
    const cleanPath = logo.path.replace('/api/uploads/', 'uploads/');
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/').replace(/\/$/, '');
    return `${baseUrl}/${cleanPath}`;
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10 transition-colors duration-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
              Logo Gallery
            </h1>
            <div className="flex items-center gap-4">
              <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  {user?.username && (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {user.username}
                    </span>
                  )}
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20">
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        <a
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Profile
                        </a>
                        <a
                          href="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Settings
                        </a>
                        <button
                          onClick={() => {
                            // Add logout logic here
                            setUser(null);
                            setIsDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Sign out
                        </button>
                      </>
                    ) : (
                      <>
                        <a
                          href="/login"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Sign in
                        </a>
                        <a
                          href="/register"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Register
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20 pb-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-error p-4">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {logos.map((logo) => (
                <div key={logo._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="relative h-[320px] mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <img
                      src={getImageUrl(logo)}
                      alt={logo.name || 'Logo'}
                      className="w-full h-full object-contain p-4"
                      width={400}
                      height={380}
                      onError={(e) => {
                        const logoName = logo?.name || 'Unknown';
                        console.error(`Failed to load image for ${logoName}`, {
                          logo: JSON.stringify(logo, null, 2)
                        });
                        e.currentTarget.src = 'https://placehold.co/400x380/666666/FFFFFF?text=Image+Not+Found';
                      }}
                    />
                  </div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {logo.name}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        by {logo.userId?.username || 'Unknown User'}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">
                        {typeof logo.averageRating === 'number' ? logo.averageRating.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-yellow-400">⭐</span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {logo.description}
                  </p>
                  {logo.tags && logo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {logo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-colors">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              © 2024 Your Company. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}