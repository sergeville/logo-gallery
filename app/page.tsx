'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, User, LogOut, Upload } from 'lucide-react';
import Image from 'next/image';
import AuthModal from './components/AuthModal';
import UploadModal from './components/UploadModal';
import { useAuth } from './context/AuthContext';

interface Logo {
  _id: string;
  name: string;
  url: string;
  description: string;
  userId: {
    username: string;
    profileImage: string;
  };
  tags: string[];
  averageRating: number;
}

export default function Page() {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const response = await fetch('/api/logos');
      const data = await response.json();
      console.log('Fetched logos data:', data);
      setLogos(data.logos);
    } catch (err) {
      setError('Failed to load logos');
      console.error('Error fetching logos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleUploadSuccess = () => {
    fetchLogos(); // Refresh the logos list
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-black' : 'bg-[#F2F2F7]'}`}>
      {/* Header */}
      <header className="fixed w-full backdrop-blur-lg bg-white/70 dark:bg-black/70 h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Logo Gallery</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search logos..."
              className="pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-gray-900 dark:text-white" />
            ) : (
              <Moon className="h-5 w-5 text-gray-900 dark:text-white" />
            )}
          </button>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white"
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </button>
              <div className="flex items-center space-x-2">
                <Image
                  src={user.profileImage}
                  alt={user.username}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.username}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
            >
              <User className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={handleUploadSuccess}
      />

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
          ) : user ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Your Logos
              </h2>
              {logos.filter(logo => logo.userId.username === user.username).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {logos
                    .filter(logo => logo.userId.username === user.username)
                    .map((logo) => (
                      <div key={logo._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="relative h-[320px] mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <Image
                            src={logo.url}
                            alt={logo.name}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-contain p-4"
                            onError={(e) => {
                              console.error(`Failed to load image: ${logo.url}`);
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
                              {logo.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {logo.tags.map((tag) => (
                                <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">
                              {logo.averageRating.toFixed(1)}
                            </span>
                            <span className="text-yellow-400">⭐</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 text-lg">
                    No images uploaded by {user.username}
                  </div>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Upload Your First Logo
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 text-lg">
                Please sign in to view your logos
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}