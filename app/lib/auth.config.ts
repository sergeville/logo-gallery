import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { User } from '@/app/lib/models/user';
import dbConnect from '@/app/lib/db-config';
import { DEFAULT_ROLE, Role } from '@/app/config/roles.config';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: Role;
      isAdmin?: boolean;
    };
  }
}

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        try {
          await dbConnect();
          
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error('No user found with this email');
          }

          const isValid = await user.comparePassword(credentials.password);

          if (!isValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || DEFAULT_ROLE,
            isAdmin: user.role === 'admin',
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw new Error('An error occurred during authentication');
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || DEFAULT_ROLE;
        token.isAdmin = user.role === 'admin';
      }

      // For OAuth sign-in, set default role if not exists
      if (account?.provider === 'google' || account?.provider === 'github') {
        if (!token.role) {
          token.role = DEFAULT_ROLE;
          token.isAdmin = false;
          
          // Update user in database with default role
          await dbConnect();
          await User.findByIdAndUpdate(token.id, {
            role: DEFAULT_ROLE
          }, { upsert: true });
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
}; 