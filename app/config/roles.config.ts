export type Role = 'admin' | 'moderator' | 'user' | 'guest';

export type Permission =
  | 'create:logo'
  | 'edit:logo'
  | 'delete:logo'
  | 'vote:logo'
  | 'manage:users'
  | 'manage:roles'
  | 'view:analytics'
  | 'moderate:content';

export const ROLES: Record<Role, Permission[]> = {
  admin: [
    'create:logo',
    'edit:logo',
    'delete:logo',
    'vote:logo',
    'manage:users',
    'manage:roles',
    'view:analytics',
    'moderate:content'
  ],
  moderator: [
    'create:logo',
    'edit:logo',
    'vote:logo',
    'moderate:content',
    'view:analytics'
  ],
  user: [
    'create:logo',
    'edit:logo',
    'delete:logo',
    'vote:logo'
  ],
  guest: []
};

export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLES[userRole]?.includes(permission) || false;
}

export function getRolePermissions(role: Role): Permission[] {
  return ROLES[role] || [];
}

export const DEFAULT_ROLE: Role = 'user'; 