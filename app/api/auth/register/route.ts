import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/app/lib/db';
import { User } from '@/app/lib/types';
import { 
  ValidationError, 
  ConflictError, 
  DatabaseError,
  createErrorResponse,
  createValidationError,
  createDatabaseError
} from '@/app/lib/errors';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validate required fields
    if (!email || !password || !name) {
      throw createValidationError(
        !email ? 'email' : !password ? 'password' : 'name',
        'Email, password, and name are required',
        { email: !!email, password: !!password, name: !!name }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createValidationError('email', 'Invalid email format', { email });
    }

    // Validate password strength
    if (password.length < 8) {
      throw createValidationError('password', 'Password must be at least 8 characters long');
    }

    // Validate name length
    if (name.length < 2 || name.length > 50) {
      throw createValidationError('name', 'Name must be between 2 and 50 characters', { length: name.length });
    }

    try {
      const { db } = await connectToDatabase();
      const usersCollection = db.collection<User>('users');

      const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new ConflictError('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser: User = {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await usersCollection.insertOne(newUser);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'User registered successfully',
          userId: result.insertedId,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 201,
          headers: { 
            'Content-Type': 'application/json',
            'Location': `/api/users/${result.insertedId}`
          }
        }
      );
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      throw createDatabaseError('user registration', error);
    }
  } catch (error) {
    return createErrorResponse(error);
  }
} 