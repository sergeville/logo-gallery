import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from './db-config';

interface AuthResult {
  status: number;
  token?: string;
  user?: {
    _id: string;
    email: string;
    username: string;
  };
  error?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput extends LoginInput {
  username: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
const SALT_ROUNDS = 10;

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const { db } = await connectToDatabase();

  // Find user
  const user = await db.collection('users').findOne({ email: input.email });

  if (!user) {
    return {
      status: 401,
      error: 'Invalid credentials',
    };
  }

  // Verify password
  const isValid = await compare(input.password, user.password);
  if (!isValid) {
    return {
      status: 401,
      error: 'Invalid credentials',
    };
  }

  // Create session
  const session = await db.collection('sessions').insertOne({
    userId: user._id,
    createdAt: new Date(),
    isValid: true,
  });

  // Generate token
  const token = sign(
    {
      userId: user._id,
      sessionId: session.insertedId,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    status: 200,
    token,
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
    },
  };
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const { db } = await connectToDatabase();

  // Check if email exists
  const existingUser = await db.collection('users').findOne({ email: input.email });
  if (existingUser) {
    return {
      status: 400,
      error: 'Email already registered',
    };
  }

  // Hash password
  const hashedPassword = await hash(input.password, SALT_ROUNDS);

  // Create user
  const result = await db.collection('users').insertOne({
    email: input.email,
    password: hashedPassword,
    username: input.username,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Create session
  const session = await db.collection('sessions').insertOne({
    userId: result.insertedId,
    createdAt: new Date(),
    isValid: true,
  });

  // Generate token
  const token = sign(
    {
      userId: result.insertedId,
      sessionId: session.insertedId,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    status: 201,
    token,
    user: {
      _id: result.insertedId,
      email: input.email,
      username: input.username,
    },
  };
}

export async function validateSession(token: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase();

    // Verify token
    const decoded = verify(token, JWT_SECRET) as {
      userId: string;
      sessionId: string;
    };

    // Check session
    const session = await db.collection('sessions').findOne({
      _id: new ObjectId(decoded.sessionId),
      userId: new ObjectId(decoded.userId),
      isValid: true,
    });

    return !!session;
  } catch {
    return false;
  }
}
