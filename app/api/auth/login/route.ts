import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/app/lib/db';
import { 
  ValidationError, 
  AuthenticationError, 
  DatabaseError,
  createErrorResponse,
  createValidationError,
  createDatabaseError
} from '@/app/lib/errors';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      throw createValidationError(
        !email ? 'email' : 'password',
        'Email and password are required',
        { email: !!email, password: !!password }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createValidationError('email', 'Invalid email format', { email });
    }

    try {
      const { db } = await connectToDatabase();
      const user = await db.collection('users').findOne({ email: email.toLowerCase() });

      if (!user) {
        // Use generic message for security
        throw new AuthenticationError('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        // Use generic message for security
        throw new AuthenticationError('Invalid credentials');
      }

      // Remove sensitive data before sending
      const { password: _, ...userWithoutPassword } = user;

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: userWithoutPassword,
          timestamp: new Date().toISOString()
        }), 
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'X-Last-Login': new Date().toISOString()
          }
        }
      );
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw createDatabaseError('user authentication', error);
    }
  } catch (error) {
    return createErrorResponse(error);
  }
} 