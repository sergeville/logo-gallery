# Logo Gallery Design System & Documentation

## 📋 Project Overview

The Logo Gallery is a web application for uploading, displaying, and managing logo designs. Users can upload logos, view others' submissions, and interact through ratings and comments.

## 🏗 Architecture

### Tech Stack
- **Frontend**: Next.js 14 with App Router
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Image Storage**: Local file system with uploads directory
- **State Management**: React Hooks + Context
- **Form Handling**: React Hook Form
- **Validation**: Zod

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
}

// Vote Model
interface Vote {
  _id: ObjectId;
  logoId: ObjectId;
  userId: ObjectId;
  rating: number;
  createdAt: Date;
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
   - Sort by date or rating

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
   - Rating range

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
   - Next.js Image component
   - WebP format support
   - Lazy loading

2. **Data Loading**
   - Server-side pagination
   - Incremental Static Regeneration
   - SWR for client caching
   - Optimistic updates

3. **Code Optimization**
   - Dynamic imports
   - Route prefetching
   - Bundle optimization
   - Tree shaking

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
- Uses Tailwind's dark mode with `dark:` prefix
- Toggles based on user preference and manual selection
- Persists user choice in local storage

### Color Mapping
- Background: `bg-white` → `dark:bg-gray-800`
- Text: `text-gray-900` → `dark:text-white`
- Borders: `border-gray-200` → `dark:border-gray-700`
- Cards: `bg-white` → `dark:bg-gray-800`

## 🎭 UI States

### Interactive Elements
- Hover: Slight opacity or color change
- Focus: Blue ring with 2px width
- Active: Darker shade of the base color
- Disabled: Reduced opacity and gray color

### Loading States
```jsx
// Loading Spinner
<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>

// Skeleton Loading
<div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-[200px]"></div>
```

## 🎯 Accessibility

### Focus Management
- Visible focus rings on all interactive elements
- Skip links for keyboard navigation
- Proper tab order

### Color Contrast
- All text meets WCAG 2.1 AA standards
- Interactive elements have sufficient contrast
- No color-only information

### ARIA Attributes
- Proper roles and labels
- Error messages linked to form fields
- Modal and dialog management

## 📏 Spacing System

### Scale (in pixels)
- 0: 0px
- 1: 4px
- 2: 8px
- 3: 12px
- 4: 16px
- 6: 24px
- 8: 32px
- 12: 48px
- 16: 64px

### Usage
```jsx
// Margin and Padding
<div className="m-4 p-6">
  <div className="space-y-4">
    {/* Content with vertical spacing */}
  </div>
</div>
```

## 🔄 Animations

### Transitions
- Duration: 150ms - 300ms
- Timing: ease-in-out
- Properties: opacity, colors, transform

```jsx
// Hover transition
<div className="transition-all duration-200 ease-in-out hover:scale-105">
  {/* Content */}
</div>
```

### Loading Animations
- Smooth spinner rotation
- Subtle pulse effects
- Progressive loading skeletons

## 📦 Layout Structure

### Page Layout
```jsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header />
  <main className="container mx-auto px-4 py-8">
    {/* Page content */}
  </main>
  <Footer />
</div>
```

### Container Widths
- Default: `max-w-7xl`
- Narrow: `