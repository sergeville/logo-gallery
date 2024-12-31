import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, User } from 'lucide-react';

interface Vote {
  userId: string;
  value: -1 | 1;
}

interface Logo {
  _id: string;
  name: string;
  url: string;
  userId: {
    _id: string;
    username: string;
    profileImage: string;
  };
  description: string;
  tags: string[];
  votes: Vote[];
  averageRating: number;
}

const LogoGallery = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogos();
  }, [page]);

  const fetchLogos = async () => {
    try {
      const response = await fetch(`/api/logos?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setLogos(prev => page === 1 ? data.logos : [...prev, ...data.logos]);
        setHasMore(data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Error fetching logos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (logoId: string, value: -1 | 1) => {
    try {
      const response = await fetch(`/api/logos/${logoId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ value })
      });

      if (response.ok) {
        const updatedLogo = await response.json();
        setLogos(prev => 
          prev.map(logo => 
            logo._id === logoId ? updatedLogo : logo
          )
        );
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-black' : 'bg-[#F2F2F7]'}`}>
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

      <main className="pt-24 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {loading && page === 1 ? (
            <div className="text-center">Loading logos...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {logos.map((logo) => (
                <div
                  key={logo._id}
                  className="bg-white dark:bg-[#1C1C1E] rounded-xl shadow-sm hover:shadow-md transition-shadow p-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={logo.userId.profileImage}
                      alt={logo.userId.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium dark:text-white">
                      {logo.userId.username}
                    </span>
                  </div>

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
                        {logo.averageRating.toFixed(1)}
                      </span>
                      <button onClick={() => handleVote(logo._id, 1)} className="text-2xl">
                        ⭐️
                      </button>
                    </div>
                  </div>
                  
                  {logo.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {logo.description}
                    </p>
                  )}

                  {logo.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {logo.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {hasMore && !loading && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="mt-8 mx-auto block bg-[#007AFF] text-white px-6 py-2 rounded-lg hover:opacity-90"
            >
              Load More
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default LogoGallery;
