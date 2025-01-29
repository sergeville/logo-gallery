import { useSession } from 'next-auth/react';
import { hasPermission, Permission, Role } from '@/config/roles.config';

interface RBACHook {
  hasPermission: (permission: Permission) => boolean;
  userRole: Role | null;
  isLoading: boolean;
}

export function useRBAC(): RBACHook {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const userRole = session?.user?.role as Role | null;

  const checkPermission = (permission: Permission): boolean => {
    if (!userRole) return false;
    return hasPermission(userRole, permission);
  };

  return {
    hasPermission: checkPermission,
    userRole,
    isLoading,
  };
}

// HOC for protecting components based on permissions
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: Permission
) {
  return function PermissionWrapper(props: P) {
    const { hasPermission, isLoading } = useRBAC();

    if (isLoading) {
      return <div>Loading...</div>; // Or your loading component
    }

    if (!hasPermission(requiredPermission)) {
      return <div>Access Denied</div>; // Or your access denied component
    }

    return <WrappedComponent {...props} />;
  };
}

// Example usage:
// const AdminPanel = withPermission(YourComponent, 'manage:users'); 