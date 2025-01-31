export type Role = 'admin' | 'moderator' | 'user' | 'guest';

export const DEFAULT_ROLE: Role = 'user';

export const ROLES = {
  ADMIN: 'admin' as Role,
  MODERATOR: 'moderator' as Role,
  USER: 'user' as Role,
  GUEST: 'guest' as Role,
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['*'],
  [ROLES.MODERATOR]: ['read', 'write', 'delete', 'moderate'],
  [ROLES.USER]: ['read', 'write'],
  [ROLES.GUEST]: ['read'],
} as const;

export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
} 