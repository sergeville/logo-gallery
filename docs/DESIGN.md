# Logo Gallery Design System & Documentation

## 📋 Project Overview

The Logo Gallery is a platform where designers can showcase their logo designs, get feedback from others' submissions, and interact through votes and comments.

## 🏗 Architecture

### Tech Stack
- **Frontend**: Next.js 14.1 with App Router
- **Backend**: Next.js API Routes
- **Database**: MongoDB 7.0+
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS 3.4
- **Image Storage**: Local file system with uploads directory
- **State Management**: React Hooks + Context + Zustand
- **Form Handling**: React Hook Form v7
- **Validation**: Zod + TypeScript 5.3+
- **Testing**: Jest + React Testing Library + Playwright
- **CI/CD**: GitHub Actions

### Database Schema

```typescript
// User Model
interface User {
  _id: ObjectId;
  email: string;
  name: string;
  password: string; // Hashed
  createdAt: Date;
  updatedAt: Date;
  profile: {
    avatar: string;
    bio: string;
  };
}

// Logo Model
interface Logo {
  _id: ObjectId;
  name: string;
  description?: string;
  url: string;
  thumbnailUrl: string;
  ownerId: ObjectId;
  ownerName: string;
  category: string;
  tags: string[];
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  totalVotes: number;
  votes: Array<{
    userId: ObjectId;
    timestamp: Date;
  }>;
}

// Vote Model
interface Vote {
  _id: ObjectId;
  logoId: ObjectId;
  userId: ObjectId;
  timestamp: Date;
}
```

### Directory Structure
```
logo-gallery/
├── app/
│   ├── api/                 # API routes
│   ├── auth/                # Authentication pages
│   ├── components/          # Shared components
│   ├── lib/                 # Utility functions
│   ├── (routes)/           # Page routes
│   └── layout.tsx          # Root layout
├── public/
│   └── uploads/            # Logo uploads directory
├── styles/
│   └── globals.css         # Global styles
├── docs/
│   └── DESIGN.md           # This document
└── scripts/
    └── seed/              # Database seeding
```

## 🚀 Setup & Installation

1. **Prerequisites**
   ```bash
   Node.js >= 18.0.0
   MongoDB >= 5.0
   npm or yarn
   ```

2. **Environment Variables**
   ```env
   # .env.local
   MONGODB_URI=mongodb://localhost:27017/LogoGalleryDevelopmentDB
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   JWT_SECRET=your-jwt-secret
   ```

3. **Installation Steps**
   ```bash
   # Clone repository
   git clone [repository-url]
   cd logo-gallery

   # Install dependencies
   npm install

   # Setup database
   npm run db:setup
   npm run db:seed

   # Start development server
   npm run dev
   ```

## 🔐 Authentication Flow

1. **Sign Up**
   - Route: `/auth/signup`
   - Validates email and password
   - Creates user in database
   - Automatically signs in user

2. **Sign In**
   - Route: `/auth/signin`
   - Supports email/password
   - Uses NextAuth.js session management
   - Redirects to previous page or home

3. **Protected Routes**
   - Middleware checks authentication
   - Redirects to sign in if needed
   - Preserves original destination

## 📤 Upload Process

1. **File Upload**
   - Accepts images up to 5MB
   - Validates file type (jpg, png, svg)
   - Generates unique filename
   - Creates thumbnail version

2. **Metadata Extraction**
   - Gets image dimensions
   - Calculates file size
   - Determines file type
   - Associates with user

3. **Storage**
   - Saves to `/public/uploads`
   - Updates database record
   - Returns success/error

## 🖼 Gallery Implementation

1. **Main Gallery**
   - Displays all logos from all users
   - Shows owner name for each logo
   - Responsive grid layout
   - Infinite scroll pagination
   - Search and filter capabilities
 
2. **Personal Gallery (My Logos)**
   - Route: `/mylogos`
   - Shows only logged-in user's logos
   - Identical layout to main gallery
   - Personal upload management
   - Protected route (requires authentication)

3. **Common Features**
   - Lazy loading images
   - Skeleton loading states
   - Error boundaries
   - 12 items per page
   - Maintains filters and sort state
   - Search across name/description/tags

4. **Filtering & Search**
   - By category
   - By tag
   - By owner name
   - Full-text search
   - Date range


## 🎯 Navigation Structure

1. **Main Navigation**
   - Logo Gallery (Home)
   - Gallery (All logos)
   - My Logos (Authenticated users only)
   - Upload Logo (Authenticated users only)

2. **User Menu**
   - Username display
   - Sign Out button
   - Sign In link (unauthenticated users)

3. **Styling**
   - Background: #0f1524 (dark navy)
   - Height: h-12
   - Text color: text-gray-300
   - Hover: text-white
   - Font size: text-sm
   - Spacing: space-x-6

4. **Responsive Behavior**
   - Collapses to hamburger menu on mobile
   - Maintains visibility of key actions
   - Preserves authentication state

## 🎯 Performance Optimizations

1. **Image Optimization**
   - Automatic thumbnail generation
   - Next.js Image component with priority loading
   - WebP/AVIF format support with fallbacks
   - Lazy loading with blur placeholder
   - Responsive image sizes

2. **Data Loading**
   - Server-side pagination
   - Incremental Static Regeneration
   - React Suspense boundaries
   - SWR for client caching
   - Optimistic updates
   - Streaming SSR

3. **Code Optimization**
   - Dynamic imports with preloading
   - Route prefetching
   - Bundle optimization
   - Tree shaking
   - Module/Component level code splitting
   - Partial prerendering (Next.js 14 feature)

4. **Core Web Vitals**
   - First Contentful Paint (FCP) optimization
   - Largest Contentful Paint (LCP) < 2.5s
   - First Input Delay (FID) < 100ms
   - Cumulative Layout Shift (CLS) < 0.1
   - Interaction to Next Paint (INP) < 200ms

5. **Caching Strategy**
   - Browser caching with Cache-Control headers
   - Static asset caching
   - API response caching
   - Stale-while-revalidate pattern
   - Service Worker for offline support

## 🔌 API Documentation

### Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```http
Authorization: Bearer <token>
```

### Endpoints

#### Logo Management

##### `GET /api/logos`
Get paginated list of logos.

Query Parameters:
```typescript
{
  page?: number;        // Default: 1
  limit?: number;       // Default: 12
  category?: string;
  tag?: string;
  search?: string;
  ownerId?: string;
}
```

Response:
```typescript
{
  logos: Logo[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
```

##### `POST /api/logos`
Upload a new logo.

Request Body (multipart/form-data):
```typescript
{
  file: File;          // Logo image file (required)
  name: string;        // Logo name (required)
  description?: string;
  category: string;    // Logo category (required)
  tags?: string[];     // Array of tags
}
```

Response:
```typescript
{
  logo: Logo;          // Created logo object
  message: string;
}
```

##### `GET /api/logos/[id]`
Get logo details by ID.

Response:
```typescript
{
  logo: Logo;
}
```

##### `PATCH /api/logos/[id]`
Update logo details.

Request Body:
```typescript
{
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
}
```

Response:
```typescript
{
  logo: Logo;          // Updated logo object
  message: string;
}
```

##### `DELETE /api/logos/[id]`
Delete a logo.

Response:
```typescript
{
  message: string;
}
```

#### Votes

##### `POST /api/logos/[id]/vote`
Submit a vote for a logo.

Request Body:
```typescript
{
  logoId: string;      // Logo ID (required)
}
```

Response:
```typescript
{
  vote: Vote;
  totalVotes: number;
  message: string;
}
```

##### `GET /api/votes/[logoId]`
Get votes for a specific logo.

Response:
```typescript
{
  votes: Vote[];
  totalVotes: number;
}
```

#### User Management

##### `GET /api/users/me`
Get current user profile.

Response:
```typescript
{
  user: {
    _id: string;
    email: string;
    name: string;
    profile: {
      avatar: string;
      bio: string;
    }
  }
}
```

##### `PATCH /api/users/me`
Update current user profile.

Request Body:
```typescript
{
  name?: string;
  profile?: {
    avatar?: string;
    bio?: string;
  }
}
```

Response:
```typescript
{
  user: User;
  message: string;
}
```

### Error Responses

All endpoints follow a consistent error response format:

```typescript
{
  error: {
    code: string;      // Error code
    message: string;   // Human-readable message
    details?: any;     // Additional error details
  }
}
```

Common Error Codes:
- `UNAUTHORIZED`: Authentication required or token invalid
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

### Rate Limiting

- Public endpoints: 100 requests per minute
- Authenticated endpoints: 1000 requests per minute
- Upload endpoints: 50 requests per hour

### Caching

- GET requests are cached for 5 minutes by default
- Cache can be bypassed with `Cache-Control: no-cache` header
- Individual endpoints may specify different cache durations

### Versioning

- Current API version: v1
- Version is included in the URL path: `/api/v1/...`
- Breaking changes will increment the version number

## 🎨 Color Palette

### Primary Colors
- Primary Blue: `#2563eb` - Used for primary actions, links, and highlights
- Primary Dark: `#1C1C1E` - Used for dark mode backgrounds
- Primary White: `#FFFFFF` - Used for light mode backgrounds

### Secondary Colors
- Success Green: `#16a34a` - Used for success states and positive actions
- Error Red: `#dc2626` - Used for error states and destructive actions
- Warning Yellow: `#eab308` - Used for warning states and important notices

### Gray Scale
- Gray 900: `#111827` - Text in light mode
- Gray 800: `#1f2937` - Dark mode background
- Gray 700: `#374151` - Dark mode borders
- Gray 500: `#6b7280` - Secondary text
- Gray 400: `#9ca3af` - Disabled text
- Gray 300: `#d1d5db` - Borders in light mode
- Gray 200: `#e5e7eb` - Background accents
- Gray 100: `#f3f4f6` - Light mode hover states

## 📝 Typography

### Font Family
- Primary: `Inter` - Modern, clean sans-serif font for all text
- Fallback: `system-ui, -apple-system, sans-serif`

### Font Sizes
- Heading 1: `2rem` (32px) - Main page titles
- Heading 2: `1.5rem` (24px) - Section headers
- Heading 3: `1.25rem` (20px) - Card titles
- Body: `1rem` (16px) - Regular text
- Small: `0.875rem` (14px) - Secondary information
- Tiny: `0.75rem` (12px) - Meta information

### Font Weights
- Bold: 700 - Headers and emphasis
- Semi-bold: 600 - Sub-headers and important text
- Medium: 500 - Navigation and buttons
- Regular: 400 - Body text

## 🔲 Components

### Buttons
```jsx
// Primary Button
<button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors">
  Primary Action
</button>

// Secondary Button
<button className="rounded-lg border-2 border-blue-500 px-4 py-2 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors">
  Secondary Action
</button>

// Danger Button
<button className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition-colors">
  Destructive Action
</button>
```

### Cards
```jsx
<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
  <div className="space-y-4">
    <h3 className="text-lg font-medium dark:text-white">Card Title</h3>
    <p className="text-gray-600 dark:text-gray-400">Card content</p>
  </div>
</div>
```

### Form Inputs
```jsx
<input 
  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
  type="text"
/>
```

## 📱 Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Grid System
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

## 🌓 Dark Mode

### Implementation
- Uses Tailwind's dark mode with `

## Overview
The Logo Gallery is a platform where designers can showcase their logo designs, get feedback from others' submissions, and interact through votes and comments.

### Filtering and Sorting

Available sort options:
- Sort by date
- Sort by vote count

Filter options:
- Date range
- Vote count range
- Categories/tags
