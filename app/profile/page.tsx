'use client';

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/hooks/useAuth'
import { LogoCard } from '@/app/components/LogoCard'
import { ClientLogo } from '@/app/lib/types'

export default function ProfilePage() {
  const { user } = useAuth()
  const [logos, setLogos] = useState<ClientLogo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogos = async () => {
      if (!user?.email || !user?.id) {
        console.log('No authenticated user found in profile page');
        setLoading(false)
        return
      }
      
      try {
        console.log('Fetching logos for user:', user.id);
        const response = await fetch('/api/user/logos')
        
        if (!response.ok) {
          console.error('Failed to load logos:', response.status, response.statusText);
          const errorData = await response.json().catch(() => ({}));
          console.error('Error data:', errorData);
          throw new Error(errorData.error || 'Failed to load user logos')
        }
        
        const data = await response.json()
        console.log('Received logos data:', data);
        
        // Verify the logos belong to the current user
        if (data.userId !== user.id) {
          console.error('User ID mismatch:', { responseId: data.userId, currentId: user.id });
          throw new Error('Invalid user data received')
        }

        setLogos(data.logos)
        console.log('Set logos:', data.logos.length);
      } catch (err) {
        console.error('Error fetching logos:', err)
        setError('Failed to load your logos')
      } finally {
        setLoading(false)
      }
    }

    fetchLogos()
  }, [user?.email, user?.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!user?.email) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Please log in to view your profile</div>
      </div>
    )
  }

  if (logos.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">You haven't uploaded any logos yet</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">My Logos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logos.map(logo => (
          <LogoCard
            key={logo.id}
            logo={logo}
            onVote={() => {}} // Disable voting on own logos
          />
        ))}
      </div>
    </div>
  )
} 