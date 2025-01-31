# Logo Gallery

A modern, responsive logo gallery built with Next.js, TypeScript, and Tailwind CSS. Features include:

- 🎨 Beautiful, responsive grid layout
- 🌓 Dark mode support
- 🔍 Search and filter functionality
- ⚡️ Fast image loading with Next.js Image optimization
- 📱 Mobile-friendly design
- ✨ Smooth animations with Framer Motion
- 🎯 Accessible UI components
- 🔐 Authentication with NextAuth.js
- 📤 Logo upload functionality
- 🖼️ SVG support and optimization
- 🧪 Visual regression testing
- 🚀 Performance optimizations

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- MongoDB (for user data and logo storage)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/logo-gallery.git
cd logo-gallery
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in required environment variables (MongoDB URI, NextAuth secret, etc.)

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

### Authentication
- User registration and login
- OAuth providers support
- Protected routes and API endpoints
- Session management

### Logo Management
- Upload logos with metadata
- Edit logo information
- Delete logos
- Automatic image optimization
- SVG support with SVGR

### Gallery Features
- Responsive grid layout
- Search and filtering
- Sort by various criteria
- Infinite scroll
- Dark mode support

### Visual Testing
- Visual regression testing with Playwright
- Snapshot comparison
- Cross-browser testing
- Mobile responsive testing

## Documentation

### Project Structure
- `app/` - Next.js app directory with route handlers and pages
- `components/` - Reusable React components
- `lib/` - Utility functions and configuration
- `public/` - Static assets and uploaded logos
- `docs/` - Project documentation
- `e2e/` - End-to-end and visual tests

### Key Documentation Files
- [Design System](docs/DESIGN.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Visual Testing Guide](docs/VISUAL_TESTING.md)
- [Error Tracking](ERROR_TRACKING.md)
- [Development Standards](docs/development/STANDARDS.md)

## Development

### Running Tests
```bash
# Run visual tests
npm run test:visual

# Update visual snapshots
npm run test:visual:update
```

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- Husky for pre-commit hooks
- TypeScript for type safety

### Performance Optimization
- Image optimization with Next.js Image
- SVG optimization with SVGR
- Code splitting and lazy loading
- Caching strategies

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Image Handling Examples

This repository contains a collection of React hooks and utilities for handling images in web applications. These examples demonstrate common image-related tasks such as optimization, preloading, validation, caching, and compression.

## Features

### 1. Image Optimization Hook (`useImageOptimization`)
- Resize images to specified dimensions
- Convert images to different formats (WebP, JPEG, PNG)
- Adjust image quality
- Handle both File and Blob inputs

### 2. Image Preloading Hook (`useImagePreload`)
- Preload single or multiple images
- Cache preloaded images
- Clear preload cache when needed
- Prevent duplicate preloading

### 3. Image Validation Hook (`useImageValidation`)
- Validate image dimensions
- Check file size limits
- Verify allowed formats
- Get image dimensions

### 4. Image Cache Hook (`useImageCache`)
- Cache images with size limits
- Automatic cache cleanup
- Age-based cache invalidation
- Memory-efficient storage

### 5. Image Compression Utility
- Target size-based compression
- Automatic quality adjustment
- Compression ratio calculation
- Original vs compressed size comparison

## Installation

```bash
npm install
# or
yarn
```

## Usage Examples

### Image Optimization

```typescript
import { useImageOptimization } from './hooks-and-utilities';

function ImageUploader() {
  const { optimizeImage } = useImageOptimization();

  const handleUpload = async (file: File) => {
    const optimized = await optimizeImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 85,
      format: 'webp'
    });
    // Use optimized image...
  };
}
```

### Image Preloading

```typescript
import { useImagePreload } from './hooks-and-utilities';

function ImageGallery() {
  const { preloadImages } = useImagePreload();

  useEffect(() => {
    const urls = ['image1.jpg', 'image2.jpg'];
    preloadImages(urls).then(() => {
      console.log('Images preloaded');
    });
  }, []);
}
```

### Image Validation

```typescript
import { useImageValidation } from './hooks-and-utilities';

function ImageUploader() {
  const { validateImage } = useImageValidation();

  const handleUpload = async (file: File) => {
    const result = await validateImage(file, {
      maxWidth: 2000,
      maxHeight: 2000,
      maxSize: 5 * 1024 * 1024,
      allowedFormats: ['image/jpeg', 'image/png', 'image/webp']
    });

    if (result.valid) {
      // Process valid image...
    } else {
      console.error(result.error);
    }
  };
}
```

### Image Caching

```typescript
import { useImageCache } from './hooks-and-utilities';

function ImageViewer() {
  const { cacheImage, getCachedImage } = useImageCache();

  const loadImage = async (url: string) => {
    const cached = getCachedImage(url);
    if (cached) {
      return URL.createObjectURL(cached);
    }

    const response = await fetch(url);
    const blob = await response.blob();
    await cacheImage(url, blob, {
      maxSize: 50 * 1024 * 1024,
      maxAge: 24 * 60 * 60 * 1000
    });
    return URL.createObjectURL(blob);
  };
}
```

### Image Compression

```typescript
import { compressImage } from './hooks-and-utilities';

async function handleImageUpload(file: File) {
  const result = await compressImage(file, 1024 * 1024); // Target size: 1MB
  console.log(`Compression ratio: ${result.compressionRatio}`);
  console.log(`Original size: ${result.originalSize} bytes`);
  console.log(`Compressed size: ${result.compressedSize} bytes`);
  // Use result.blob...
}
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT
