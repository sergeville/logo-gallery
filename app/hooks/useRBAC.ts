import { useSession } from 'next-auth/react';
import { Permission } from '@/config/roles.config';

export function useRBAC() {
  const { data: session } = useSession();

  const hasPermission = (permission: Permission) => {
    if (!session?.user) return false;
    return session.user.isAdmin || false;
  };

  return {
    hasPermission,
    isAdmin: session?.user?.isAdmin || false,
    isAuthenticated: !!session?.user,
  };
}