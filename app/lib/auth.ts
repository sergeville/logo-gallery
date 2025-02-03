import { ObjectId } from 'mongodb';
import { connectToDatabase } from './db-config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { compare } from 'bcryptjs';

interface AuthResult {
  status: number;
  message?: string;
  error?: string;
  user?: any;
  token?: string;
}

interface User {
  _id?: ObjectId;
  email: string;
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  username: string;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Sign in',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'example@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id + '',
          email: user.email,
          name: user.name,
          randomKey: 'Hey cool',
        };
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          randomKey: token.randomKey,
        },
      };
    },
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as unknown as any;
        return {
          ...token,
          id: u.id,
          randomKey: u.randomKey,
        };
      }
      return token;
    },
  },
};

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const { db } = await connectToDatabase();
  
  if (!db) {
    return {
      status: 500,
      error: 'Database connection failed'
    };
  }

  // Check if email exists
  const existingUser = await db.collection('users').findOne({ email: input.email });
  if (existingUser) {
    return {
      status: 400,
      error: 'Email already registered'
    };
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(input.password, salt);

  // Create user
  const user: User = {
    email: input.email,
    password: hashedPassword,
    username: input.username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const result = await db.collection('users').insertOne(user);
  const createdUser = { ...user, _id: result.insertedId };

  // Generate token
  const token = jwt.sign(
    { userId: createdUser._id },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '24h' }
  );

  // Remove password from response
  const { password, ...userWithoutPassword } = createdUser;

  return {
    status: 201,
    user: userWithoutPassword,
    token
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const { db } = await connectToDatabase();

  if (!db) {
    return {
      status: 500,
      error: 'Database connection failed'
    };
  }

  // Find user
  const user = await db.collection('users').findOne({ email: input.email });
  if (!user) {
    return {
      status: 401,
      error: 'Invalid credentials'
    };
  }

  // Check password
  const validPassword = await bcrypt.compare(input.password, user.password);
  if (!validPassword) {
    return {
      status: 401,
      error: 'Invalid credentials'
    };
  }

  // Generate token
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '24h' }
  );

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return {
    status: 200,
    user: userWithoutPassword,
    token
  };
}

export async function validateSession(token: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string };
    const { db } = await connectToDatabase();

    if (!db) {
      return false;
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}
