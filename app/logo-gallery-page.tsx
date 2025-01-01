import React, { useState } from 'react';
import { Search, Sun, Moon, User } from 'lucide-react';

const LogoGallery = () => {
  const [darkMode, setDarkMode] = useState(false);
  
  // Sample logo data
  const logos = [
    { id: 1, name: 'Logo 1', url: '/api/placeholder/200/200', rating: 4.5 },
    { id: 2, name: 'Logo 2', url: '/api/placeholder/200/200', rating: 3.8 },
    { id: 3, name: 'Logo 3', url: '/api/placeholder/200/200', rating: 4.2 }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-black' : 'bg-[#F2F2F7]'}`}>
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
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {darkMode ? <Sun className="text-white" /> : <Moon />}
            </button>
            
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <User className="dark:text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="bg-white dark:bg-[#1C1C1E] rounded-xl shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="relative h-48 mb-4">
                  <img
                    src={logo.url}
                    alt={logo.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium dark:text-white">{logo.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {logo.rating}
                    </span>
                    <button className="text-2xl">⭐️</button>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-[#007AFF] text-white py-2 rounded-lg hover:opacity-90">
                    Vote
                  </button>
                  <button className="flex-1 border border-[#007AFF] text-[#007AFF] dark:text-white py-2 rounded-lg hover:bg-[#007AFF] hover:text-white transition-colors">
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
