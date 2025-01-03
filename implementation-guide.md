# Logo Gallery Website Implementation Guide

## 1. Project Setup

```bash
# Create new Next.js project with TypeScript
npx create-next-app@latest logo-gallery --typescript --tailwind
cd logo-gallery

# Install dependencies
npm install mongoose dotenv mongodb jsonwebtoken express lucide-react
```

## 2. Environment Configuration

Create `.env` file in root directory:

```env
MONGODB_URI=mongodb://localhost:27017/logo_gallery
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_API_URL=http://localhost:3000/
```

## 3. Database Setup

### Initialize MongoDB Connection
`src/lib/db.ts`:
```typescript
import mongoose from 'mongoose';

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
```

### Create Models
`src/models/User.ts` and `src/models/Logo.ts` as provided in documentation.

## 4. API Implementation

### Create API Routes

`src/pages/login.ts`:
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}
```

`src/pages/api/logos/index.ts`:
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { Logo } from '@/models/Logo';
import { connectDB } from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    try {
      const logos = await Logo.find()
        .populate('userId', 'username profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Logo.countDocuments();

      res.json({
        logos,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasMore: skip + logos.length < total
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}
```

## 5. Frontend Implementation

### Create Context for Auth

`src/context/AuthContext.tsx`:
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any;
  login: (token: string, userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Create Layout Component

`src/components/Layout.tsx`:
```typescript
import { useAuth } from '@/context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div>
      {/* Header implementation */}
      <main>{children}</main>
    </div>
  );
}
```

### Update App Component

`src/pages/_app.tsx`:
```typescript
import { AuthProvider } from '@/context/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;
```

## 6. Tailwind Configuration

Update `tailwind.config.js`:
```javascript
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        secondary: '#5856D6',
        success: '#34C759',
        error: '#FF3B30',
        warning: '#FF9500',
      },
    },
  },
  plugins: [],
}
```

## 7. Testing

1. Start MongoDB:
```bash
brew services start mongodb-community
```

2. Run development server:
```bash
npm run dev
```

3. Test endpoints with Postman or similar tool.

## 8. Deployment

1. Create MongoDB Atlas account for production database
2. Update environment variables for production
3. Deploy to Vercel:
```bash
vercel
```

## 9. Security Considerations

1. Implement rate limiting
2. Add input validation
3. Set up CORS properly
4. Use secure headers
5. Implement proper error handling
6. Set up monitoring and logging

## 10. Performance Optimization

1. Implement caching
2. Use proper indexes in MongoDB
3. Optimize images
4. Implement lazy loading
5. Add error boundaries

## 11. Maintenance

1. Regular dependency updates
2. Database backups
3. Monitor error logs
4. Update security patches
5. Performance monitoring

Follow these steps sequentially to set up and deploy the logo gallery website. Each component can be tested individually before moving to the next step.
