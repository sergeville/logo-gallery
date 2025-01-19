import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ClientLogo } from '@/app/lib/transforms';
import { AuthModal } from '@/app/components/AuthModal';

export default function VotePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await fetch('/api/logos?page=1');
        if (!response.ok) throw new Error('Failed to fetch logos');
        const data = await response.json();
        setLogos(data.logos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load logos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogos();
  }, []);

  const handleVote = async () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedLogo) {
      return;
    }

    try {
      const response = await fetch(`/api/logos/${selectedLogo}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: 1 })
      });

      if (!response.ok) throw new Error('Failed to submit vote');
      
      router.refresh();
      setSelectedLogo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1A2F] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A1A2F] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-lg">
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1A2F] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Vote for Logos</h1>
          <button
            onClick={handleVote}
            disabled={!selectedLogo}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            Submit Vote
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {logos.map(logo => (
            <div
              key={logo.id}
              className="bg-[#1C1C1E] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 p-6"
            >
              <div className="relative aspect-[4/3] mb-4 bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={logo.imageUrl}
                  alt={logo.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white truncate">{logo.name}</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLogo === logo.id}
                      onChange={() => setSelectedLogo(selectedLogo === logo.id ? null : logo.id)}
                      disabled={selectedLogo !== null && selectedLogo !== logo.id}
                      className="sr-only peer"
                    />
                    <div className={`w-6 h-6 border-2 rounded-full transition-colors ${
                      selectedLogo === logo.id
                        ? 'bg-blue-500 border-blue-500'
                        : selectedLogo !== null
                        ? 'bg-gray-700 border-gray-600 cursor-not-allowed'
                        : 'border-gray-400 hover:border-blue-400'
                    }`}>
                      {selectedLogo === logo.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
                
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <span className="inline-block w-6 h-6 rounded-full bg-gray-700 flex-shrink-0"></span>
                  <span>{logo.ownerName || 'Unknown User'}</span>
                </div>
                
                {logo.tags && logo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {logo.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={() => {
            setShowAuthModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
} 