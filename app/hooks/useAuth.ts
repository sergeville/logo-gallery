import { useSession } from 'next-auth/react';
import { ClientUser } from '@/app/lib/types';

interface AuthState {
  user: Partial<ClientUser> | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const { data: session, status } = useSession();

  return {
    user: session?.user ? {
      id: session.user.id || '',
      email: session.user.email || '',
      name: session.user.name || ''
    } : null,
    loading: status === 'loading'
  };
} 