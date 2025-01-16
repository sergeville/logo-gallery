import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/app/lib/db';
import { User } from '@/app/lib/types';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        message: 'Email, password, and name are required'
      }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Email already registered'
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      userId: result.insertedId
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error registering user'
    }, { status: 500 });
  }
} 