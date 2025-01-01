'use client';

import React, { useState } from 'react';
import { Search, Sun, Moon, User } from 'lucide-react';

export default function Page() {
  const [darkMode, setDarkMode] = useState(false);
  
  const logos = [
    {
      id: 1,
      name: 'Mountain Peak Logo',
      url: 'https://placehold.co/400x380/007AFF/FFFFFF?text=Mountain+Peak',
      rating: 4.5,
      description: 'Minimalist mountain peak design in blue'
    },
    {
      id: 2,
      name: 'Tech Tree Logo',
      url: 'https://placehold.co/400x380/34C759/FFFFFF?text=Tech+Tree',
      rating: 4.8,
      description: 'Modern tech tree concept in green'
    },
    {
      id: 3,
      name: 'Creative Wave Logo',
      url: 'https://placehold.co/400x380/5856D6/FFFFFF?text=Creative+Wave',
      rating: 4.2,
      description: 'Abstract wave pattern in purple'
    }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-black' : 'bg-[#F2F2F7]'}`}>
      {/* Header */}
      <header className="fixed w-full backdrop-blur-lg bg-white/70 dark:bg-black/70 h-16 flex items-center justify-center px-4 border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="flex items-center justify-between w-full max-w-6xl">
          <h1 className="text-xl font-bold dark:text-white">Logo Gallery</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="search"
                placeholder="Search logos..."
                className="pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 dark:text-white w-[200px] sm:w-[300px]"
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
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="bg-white dark:bg-[#1C1C1E] rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="relative h-[320px] mb-6 overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-900">
                  <img
                    src={logo.url}
                    alt={logo.name}
                    className="w-full h-full object-contain p-4"
                    width={400}
                    height={380}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium dark:text-white">{logo.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{logo.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {logo.rating}
                      </span>
                      <button className="text-2xl hover:scale-110 transition-transform">⭐️</button>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 bg-[#007AFF] text-white py-2.5 rounded-lg hover:opacity-90 font-medium transition-opacity">
                      Vote
                    </button>
                    <button className="flex-1 border-2 border-[#007AFF] text-[#007AFF] dark:text-white py-2.5 rounded-lg hover:bg-[#007AFF] hover:text-white transition-colors font-medium">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}