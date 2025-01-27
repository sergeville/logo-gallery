import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from '../../../../lib/db'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔍 [NextAuth] authorize callback started', { email: credentials?.email });
        
        if (!credentials?.email || !credentials?.password) {
          console.error('❌ [NextAuth] Missing credentials');
          throw new Error('Email and password are required');
        }

        try {
          const { db } = await connectToDatabase();
          console.log('✅ [NextAuth] Database connected');
          
          const user = await db.collection('users').findOne({ email: credentials.email });
          console.log('🔍 [NextAuth] User lookup result:', { 
            found: !!user, 
            email: credentials.email,
            passwordLength: user?.password?.length 
          });

          if (!user) {
            console.error('❌ [NextAuth] User not found');
            throw new Error('Invalid credentials');
          }

          // Log the password comparison inputs
          console.log('🔐 [NextAuth] Password comparison:', { 
            providedPassword: credentials.password,
            storedHash: user.password,
          });

          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log('🔐 [NextAuth] Password validation:', { 
            isValid,
            passwordLength: credentials.password.length,
            hashLength: user.password.length
          });

          if (!isValid) {
            console.error('❌ [NextAuth] Invalid password');
            throw new Error('Invalid credentials');
          }

          console.log('✅ [NextAuth] Authentication successful');
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'USER'
          };
        } catch (error) {
          console.error('❌ [NextAuth] Auth error:', error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If the url starts with baseUrl, allow it
      if (url.startsWith(baseUrl)) return url;
      // Otherwise only allow relative urls
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Default to homepage
      return baseUrl;
    }
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
} 