# Logo Gallery

A Next.js application for showcasing and voting on logos.

## Features

- Logo showcase with voting system
- Admin dashboard for logo management
- User authentication
- Responsive design
- Performance optimized

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/logo-gallery.git
cd logo-gallery
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local` with your configuration

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Project structure
- Code standards
- Development workflow
- Testing requirements
- Documentation guidelines

Before submitting a pull request, please:
1. Read the contributing guidelines
2. Check existing issues/PRs
3. Follow our coding standards
4. Include tests and documentation

## Documentation

### Core Documentation
- [API Documentation](docs/api.md)
- [Development Setup](docs/development.md)
- [Testing Guide](docs/testing.md)
- [Deployment Guide](docs/deployment.md)
- [Design Standards](STANDARDS.md)
- [Database Schema](docs/DATABASE.md)
- [TODO List](docs/TODO.md)

### Design Documentation
- [Authentication Flow](docs/design/auth-signin.md)
- [Upload Form](docs/design/upload-form.md)

### Testing Documentation
- [Test Data Generation](docs/test-data.md)

### Component Documentation
- [Vote Component](app/vote/README.md)

### Additional Resources
- [Command Reference](cmd.md)

Each document covers specific aspects of the project:
- Import path conventions
- Project structure
- Code style guidelines
- Database schema
- Authentication flow
- Testing patterns
- Component specifications
- Development workflows

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- All contributors who have helped shape this project

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
