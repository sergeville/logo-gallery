'use client';

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LogoCard from '../components/LogoCard'
import { AdminLogoCard } from '../components/AdminLogoCard'
import { ClientLogo } from '../../lib/types'

interface User {
  id: string;
  name: string;
  email: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logos, setLogos] = useState<ClientLogo[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin')
      return
    }

    const fetchData = async () => {
      try {
        if (!session?.user?.id) {
          return
        }

        setLoading(true)
        setError('')

        const [logosResponse, usersResponse] = await Promise.all([
          fetch('/api/user/logos'),
          session.user.role === 'ADMIN' ? fetch('/api/users') : null
        ])

        if (!logosResponse.ok) {
          throw new Error('Failed to fetch logos')
        }

        const logosData = await logosResponse.json()
        setLogos(logosData.logos || [])

        if (session.user.role === 'ADMIN' && usersResponse) {
          if (!usersResponse.ok) {
            throw new Error('Failed to fetch users')
          }
          const usersData = await usersResponse.json()
          setUsers(usersData.users || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [session, status, router])

  const handleUpdateOwner = async (logoId: string, newOwnerId: string) => {
    try {
      const response = await fetch(`/api/logos/${logoId}/owner`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newOwnerId }),
      })

      if (!response.ok) throw new Error('Failed to update owner')
      
      // Refresh logos list using the user-specific endpoint
      const updatedLogosResponse = await fetch('/api/user/logos')
      if (!updatedLogosResponse.ok) throw new Error('Failed to fetch updated logos')
      const data = await updatedLogosResponse.json()
      if (!data.logos) throw new Error('Invalid response format')
      setLogos(data.logos)
    } catch (err) {
      console.error('Error updating owner:', err)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen p-8">
        <div className="text-center">Loading session...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-center">Loading logos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Logos</h1>
        {logos.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            You haven't uploaded any logos yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logos.map((logo) => (
              session?.user?.role === 'ADMIN' ? (
                <AdminLogoCard 
                  key={logo.id} 
                  logo={logo} 
                  onUpdateOwner={handleUpdateOwner}
                  users={users}
                />
              ) : (
                <LogoCard 
                  key={logo.id} 
                  logo={logo} 
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 