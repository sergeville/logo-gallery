# Logo Gallery

A modern, responsive logo gallery built with Next.js, TypeScript, and Tailwind CSS. Features include:

- 🎨 Beautiful, responsive grid layout
- 🌓 Dark mode support
- 🔍 Search and filter functionality
- ⚡️ Fast image loading with Next.js Image optimization
- 📱 Mobile-friendly design
- ✨ Smooth animations with Framer Motion
- 🎯 Accessible UI components

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/logo-gallery.git
cd logo-gallery
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `public/logos` directory and add your logo images.

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

### Adding Logos

1. Place your logo images in the `public/logos` directory
2. Update the logo data in `app/page.tsx` with your logo information:

```typescript
const logos = [
  {
    id: '1',
    name: 'Logo Name',
    url: '/logos/your-logo.svg',
    category: 'Category',
    description: 'Logo description',
  },
  // Add more logos...
];
```

### Customization

- Modify the theme in `tailwind.config.js`
- Update global styles in `app/globals.css`
- Customize components in the `app/components` directory

## Features

### Logo Image Component

The `LogoImage` component handles:
- Responsive image loading
- Error states
- Loading states
- Image optimization
- Dark mode compatibility

### Logo Gallery Component

The `LogoGallery` component provides:
- Grid/List view toggle
- Search functionality
- Sort options
- Smooth animations
- Responsive layout

## Documentation

### Design System
Our comprehensive design system documentation is available in [docs/DESIGN.md](docs/DESIGN.md). It covers:
- 🎨 UI/UX Guidelines
- 📐 Layout & Grid System
- 🎯 Navigation Structure
- 🌓 Dark Mode Implementation
- 📱 Responsive Design
- 🚀 Performance Optimizations
- 🔌 API Documentation

### Development Standards
Our development standards and conventions are documented in [docs/design/STANDARDS.md](docs/design/STANDARDS.md). Key areas include:
- 📦 Import Path Standards
- 🏗 Project Structure
- 💾 Database Connections
- 🔐 Authentication
- 🧪 Testing Guidelines
- 📝 Code Style
- 🔄 Git Practices

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

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
