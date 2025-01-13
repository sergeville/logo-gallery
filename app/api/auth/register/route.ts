import { connectToDatabase } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { Document } from 'mongodb';

interface User extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validate required fields
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (!password) {
      return new Response(
        JSON.stringify({ success: false, message: 'Password is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (!name) {
      return new Response(
        JSON.stringify({ success: false, message: 'Name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await connectToDatabase();
    
    // Check for existing user
    const existingUser = await db.collection<User>('users').findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email already registered' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser: Omit<User, '_id' | 'createdAt' | 'updatedAt'> = {
      email,
      password: hashedPassword,
      name,
    };

    await db.collection<User>('users').insertOne({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return new Response(
      JSON.stringify({ success: true, message: 'User registered successfully' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to register user' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 