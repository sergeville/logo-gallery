import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { hasPermission, Permission, Role } from '@/config/roles.config';

interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

export async function withPermission(
  req: AuthenticatedRequest,
  permission: Permission
) {
  try {
    const token = await getToken({ req });

    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const userRole = token.role as Role;

    if (!hasPermission(userRole, permission)) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403 }
      );
    }

    // Add user info to the request for downstream handlers
    req.user = {
      id: token.id as string,
      email: token.email as string,
      role: userRole,
    };

    return null; // Continue to the next middleware/handler
  } catch (error) {
    console.error('RBAC Error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}

export function createPermissionMiddleware(permission: Permission) {
  return async function permissionMiddleware(
    req: AuthenticatedRequest,
    next: () => Promise<NextResponse>
  ) {
    const response = await withPermission(req, permission);
    if (response) return response;
    return next();
  };
}

// Example usage:
// export const POST = createPermissionMiddleware('create:logo')(async (req) => {
//   // Handle the request
// }); 