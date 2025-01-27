import { useSession } from 'next-auth/react';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  } | null;
}

export function useAuth(): AuthState {
  const { data: session, status } = useSession();

  return {
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    user: session?.user || null,
  };
}

export default useAuth; 