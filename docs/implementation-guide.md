# Logo Gallery Website Implementation Guide

## 1. Project Setup

```bash
# Create new Next.js project with TypeScript and App Router
pnpm create next-app@latest logo-gallery --typescript --tailwind --app --src-dir --import-alias "@/*"
cd logo-gallery

# Install core dependencies
pnpm add mongoose mongodb next-auth@beta zod zustand @hookform/resolvers
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast
pnpm add sharp lucide-react date-fns

# Install development dependencies
pnpm add -D @types/node @types/react @types/react-dom typescript
pnpm add -D eslint eslint-config-next @typescript-eslint/parser @typescript-eslint/eslint-plugin
pnpm add -D prettier prettier-plugin-tailwindcss
pnpm add -D jest @testing-library/react @testing-library/jest-dom @types/jest
pnpm add -D @playwright/test @testing-library/user-event
```

## 2. Environment Configuration

Create `.env.local` in root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/logo_gallery

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
GITHUB_ID=your-github-oauth-id
GITHUB_SECRET=your-github-oauth-secret

# Upload Settings
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/svg+xml

# API Settings
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
RATE_LIMIT_MAX=100
```

## 3. TypeScript Configuration

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 4. Database Setup

### MongoDB Connection
`src/lib/db.ts`:
```typescript
import mongoose from 'mongoose';

declare global {
  var mongoose: any;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
```

### Zod Schemas
`src/lib/validations/logo.ts`:
```typescript
import { z } from 'zod';

export const LogoSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  file: z.any()
    .refine((file) => file?.size <= process.env.NEXT_PUBLIC_MAX_FILE_SIZE, 
      'Max file size is 5MB')
    .refine(
      (file) => process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES.includes(file?.type),
      'File type not supported'
    )
});
```

## 5. API Implementation

### Middleware Setup
`src/middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    
    // Check authentication
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Rate limiting
    const ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(100, '1 m'),
    });

    const { success, limit, reset, remaining } = await ratelimit.limit(
      `ratelimit_${token.sub}`
    );

    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        }
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: ['/api/v1/logos/:path*', '/api/v1/votes/:path*']
};
```

### API Routes
`src/app/api/v1/logos/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LogoSchema } from '@/lib/validations/logo';
import { processUpload } from '@/lib/upload';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '12');
    const sort = searchParams.get('sort') ?? 'date';
    
    // Implement pagination and filtering logic
    
    return NextResponse.json({
      logos: [], // Fetched logos
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalItems: 0
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const validatedData = await LogoSchema.parseAsync({
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      tags: formData.get('tags')?.split(','),
      file: formData.get('file')
    });

    // Process upload and save to database
    
    return NextResponse.json({ 
      message: 'Logo uploaded successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

## 6. Frontend Implementation

### State Management
`src/lib/store.ts`:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LogoStore {
  logos: Logo[];
  filters: {
    category: string | null;
    tag: string | null;
    search: string;
  };
  setFilters: (filters: Partial<LogoStore['filters']>) => void;
  addLogo: (logo: Logo) => void;
  removeLogo: (id: string) => void;
}

export const useLogoStore = create<LogoStore>()(
  persist(
    (set) => ({
      logos: [],
      filters: {
        category: null,
        tag: null,
        search: ''
      },
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters }
        })),
      addLogo: (logo) =>
        set((state) => ({
          logos: [logo, ...state.logos]
        })),
      removeLogo: (id) =>
        set((state) => ({
          logos: state.logos.filter((logo) => logo._id !== id)
        }))
    }),
    {
      name: 'logo-storage'
    }
  )
);
```

### Components
`src/components/logo-upload.tsx`:
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogoSchema } from '@/lib/validations/logo';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function LogoUpload() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(LogoSchema)
  });

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch('/api/v1/logos', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      toast({
        title: 'Success',
        description: 'Logo uploaded successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload logo',
        variant: 'destructive'
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## 7. Testing Setup

### Jest Configuration
`jest.config.js`:
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './'
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};

module.exports = createJestConfig(customJestConfig);
```

### Playwright Configuration
`playwright.config.ts`:
```typescript
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './e2e',
  use: {
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
};

export default config;
```

## 8. CI/CD Setup

`.github/workflows/main.yml`:
```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install

      - name: Run linting
        run: pnpm lint
        
      - name: Run tests
        run: pnpm test

      - name: Run e2e tests
        run: pnpm test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Vercel
        uses: vercel/actions/deploy@v1
```

## 9. Performance Monitoring

### Core Web Vitals
`src/app/layout.tsx`:
```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```

## 10. Security Implementation

### Content Security Policy
`next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data:;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      block-all-mixed-content;
      upgrade-insecure-requests;
    `
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

Follow these steps sequentially to implement the logo gallery website. Each component can be tested individually before moving to the next step.
