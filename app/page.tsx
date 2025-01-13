'use client';

import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import AuthModal from './components/AuthModal';
import UploadModal from './components/UploadModal';
import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface Logo {
  _id: string;
  name: string;
  url: string;
  uploadedAt: string;
  averageRating?: number;
  totalVotes?: number;
}

export default function Home() {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchLogos(); // Refresh the logos list
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = '/placeholder-logo.png'; // Make sure to add a placeholder image in public directory
  };

  const fetchLogos = async () => {
    try {
      setError(null);
      const response = await fetch('/api/logos');
      if (!response.ok) throw new Error('Failed to fetch logos');
      const data = await response.json();
      setLogos(data.logos || []);
    } catch (error) {
      console.error('Error fetching logos:', error);
      setError('Failed to load logos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  return (
    <main className={`min-h-screen p-8 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold dark:text-white">Logo Gallery</h1>
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="dark:text-white">Welcome, {user.email}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={() => setShowAuthModal(false)}
        />

        {/* Upload Modal */}
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />

        {/* Main Content */}
        {user ? (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold dark:text-white">Welcome to Logo Gallery</h2>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You're logged in as {user.email}. You can now upload and manage your logos.
              </p>

              {/* Logo Management Section */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Your Logos</h3>
                {error && (
                  <div className="text-red-500 mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                      Loading logos...
                    </div>
                  ) : logos.length > 0 ? (
                    logos.map((logo) => (
                      <div key={logo._id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <div className="relative h-48 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                          <img
                            src={logo.url.startsWith('http') ? logo.url : `${process.env.NEXT_PUBLIC_API_URL}${logo.url}`}
                            alt={logo.name}
                            className="w-full h-full object-contain"
                            onError={handleImageError}
                          />
                        </div>
                        <h4 className="text-lg font-medium dark:text-white">{logo.name}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Uploaded: {new Date(logo.uploadedAt).toLocaleDateString()}
                          </p>
                          {logo.averageRating !== undefined && (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">⭐</span>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {logo.averageRating.toFixed(1)} ({logo.totalVotes || 0})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <ImageIcon className="w-12 h-12 mb-4" />
                      <p className="text-center">No logos uploaded yet. Click the Upload button to add your first logo.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Welcome to Logo Gallery</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please log in to upload and manage your logos.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}