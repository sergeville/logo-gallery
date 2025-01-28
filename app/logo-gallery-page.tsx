import React, { useState } from 'react';
import { Search, Sun, Moon, User } from 'lucide-react';
import Image from 'next/image';

interface Logo {
  id: number;
  name: string;
  url: string;
}

/**
 * Logo Gallery Page Component
 * Displays a responsive grid of logo cards with interactive features.
 * Includes logo display and action buttons.
 */

/**
 * Main logo gallery component
 * Features:
 * - Responsive grid layout (1-3 columns based on screen size)
 * - Logo cards with image display and error handling
 * - Action buttons for details
 */
const LogoGallery = () => {
  const [darkMode, setDarkMode] = useState(false);
  
  // Sample logo data
  const logos: Logo[] = [
    { id: 1, name: 'Logo 1', url: '/placeholder/200/200' },
    { id: 2, name: 'Logo 2', url: '/placeholder/200/200' },
    { id: 3, name: 'Logo 3', url: '/placeholder/200/200' }
  ];

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = 'https://placehold.co/400x380/666666/FFFFFF?text=Image+Not+Found';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-black' : 'bg-[#F2F2F7]'}`} data-testid="logo-gallery">
      {/* Header */}
      <header className="fixed w-full backdrop-blur-lg bg-white/70 dark:bg-black/70 h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <h1 className="text-xl font-bold dark:text-white">Logo Gallery</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="search"
                placeholder="Search logos..."
                className="pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 dark:text-white"
                data-testid="search-input"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              data-testid="theme-toggle"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="text-white" /> : <Moon />}
            </button>
            
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              data-testid="user-button"
              aria-label="User menu"
            >
              <User className="dark:text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 pb-8" data-testid="main-content">
        <div className="max-w-7xl mx-auto">
          {/* Responsive grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="bg-white dark:bg-[#1C1C1E] rounded-xl shadow-sm hover:shadow-md transition-shadow p-4"
                data-testid="logo-card"
              >
                {/* Logo image container with error handling */}
                <div className="relative h-[320px] mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg" data-testid="logo-image-container">
                  <Image
                    src={logo.url}
                    alt={logo.name}
                    fill
                    className="object-contain p-4"
                    onError={handleImageError}
                    data-testid="logo-image"
                  />
                </div>
                
                {/* Logo information section */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium dark:text-white">{logo.name}</h3>
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex gap-2">
                  <button 
                    className="flex-1 border border-[#007AFF] text-[#007AFF] dark:text-white py-2 rounded-lg hover:bg-[#007AFF] hover:text-white transition-colors"
                    data-testid="details-button"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LogoGallery;
