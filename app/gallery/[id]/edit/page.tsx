'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { ClientLogo } from '../../../../lib/types';

export default function EditLogoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [logo, setLogo] = useState<ClientLogo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch(`/api/logos/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch logo');
        const data = await response.json();
        setLogo(data);
      } catch (err) {
        setError('Failed to load logo');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, [params.id]);

  // Check if user is admin with proper typing
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    router.push('/gallery');
    return null;
  }

  const handleUpdate = async (field: string, value: string) => {
    if (!logo) return;
    
    try {
      const response = await fetch(`/api/logos/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...logo,
          [field]: value
        }),
      });

      if (!response.ok) throw new Error('Failed to update logo');
      const updatedLogo = await response.json();
      setLogo(updatedLogo);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update logo');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this logo?')) return;

    try {
      const response = await fetch(`/api/logos/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete logo');
      router.push('/gallery');
    } catch (err) {
      setError('Failed to delete logo');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!logo) {
    return <div className="p-8 text-center">Logo not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#0A1A2F] py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-white">Logo Details</h1>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Delete Logo
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Logo Preview */}
            <div className="relative aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden">
              <Image
                src={logo.imageUrl || '/placeholder-logo.png'}
                alt={logo.name}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Logo Information */}
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Logo ID</label>
                <div className="text-white bg-gray-700 rounded px-3 py-2">{logo.id}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  defaultValue={logo.name}
                  onBlur={(e) => handleUpdate('name', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Owner</label>
                <input
                  type="text"
                  defaultValue={logo.ownerName || 'Unknown owner'}
                  onBlur={(e) => handleUpdate('ownerName', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                <input
                  type="text"
                  defaultValue={logo.tags?.join(', ')}
                  onBlur={(e) => handleUpdate('tags', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                <input
                  type="text"
                  defaultValue={logo.imageUrl}
                  onBlur={(e) => handleUpdate('imageUrl', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Back to Gallery
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 