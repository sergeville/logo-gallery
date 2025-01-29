'use client';

import { useRBAC } from '@/hooks/useRBAC';
import { Permission } from '@/config/roles.config';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface PermissionGateProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function PermissionGate({
  permission,
  children,
  fallback,
  redirectTo = '/auth/signin',
}: PermissionGateProps) {
  const { hasPermission, isLoading } = useRBAC();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !hasPermission(permission) && redirectTo) {
      router.push(redirectTo);
    }
  }, [isLoading, hasPermission, permission, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Access Denied
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

// Example usage:
// <PermissionGate permission="manage:users">
//   <AdminPanel />
// </PermissionGate> 