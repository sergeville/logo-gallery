export type Role = 'admin' | 'user';

export const DEFAULT_ROLE: Role = 'user';

export enum Permission {
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_LOGOS = 'MANAGE_LOGOS',
  MANAGE_VOTING = 'MANAGE_VOTING',
  VIEW_ADMIN_PANEL = 'VIEW_ADMIN_PANEL',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    Permission.MANAGE_USERS,
    Permission.MANAGE_LOGOS,
    Permission.MANAGE_VOTING,
    Permission.VIEW_ADMIN_PANEL,
  ],
  user: [],
};

export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
} 