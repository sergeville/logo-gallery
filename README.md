# Logo Gallery

A modern, real-time logo voting and showcase platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🌓 Dark mode with system preference detection
- 🔍 Advanced search and filter functionality
- 📱 Mobile-friendly responsive design
- ✨ Smooth animations and transitions
- ♿️ Accessible UI components with ARIA support
- 🔒 Secure authentication with NextAuth.js
- 📤 Logo upload with automatic optimization
- ⚡️ Real-time data synchronization
- 🗳️ Multi-user voting system
- 🎨 Theme customization

## Prerequisites

- Node.js 18.17 or later
- Redis 7.0 or later
- PostgreSQL 14 or later
- pnpm (recommended) or npm

## Environment Setup

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/LogoGalleryDB

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret
GOOGLE_ID=your-google-id
GOOGLE_SECRET=your-google-secret

# Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up MongoDB:
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Verify MongoDB is running
mongosh
```

3. Create your `.env` file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
pnpm dev
```

Visit http://localhost:3000 to see your app.

## Architecture

### Database Design

The app uses MongoDB for data storage with the following collections:

#### Users Collection
- User authentication data
- Profile information
- Relationships with logos and votes

#### Logos Collection
- Logo metadata and storage paths
- User ownership information
- Tags and categories
- Vote tracking

#### Votes Collection
- User voting records
- Timestamp information
- Logo references

### Real-time Features

The app uses WebSocket-based real-time system for:
- Live vote updates
- User presence
- Real-time notifications
- Collaborative features

### Authentication System

Secure authentication powered by NextAuth.js with support for:
- Multiple providers (GitHub, Google)
- Email/Password
- Magic links
- Session management
- Role-based access control

### Logo Management

Advanced logo handling features:
- Automatic image optimization
- Multiple format support
- Responsive images
- Lazy loading
- Blur placeholder
- Error handling

### Voting System

Robust voting implementation with:
- Real-time vote tracking
- Anti-fraud measures
- Vote analytics
- User voting history
- Voting deadlines

## Development

### Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run linter
pnpm lint

# Format code
pnpm format
```

### Cache Management

For information about webpack cache management and troubleshooting, see [Webpack Cache Management](docs/webpack-cache-management.md).

Available cache-related commands:
```bash
# Clean all caches
pnpm clean-cache

# Start development with clean cache
pnpm dev:clean
```

### Project Structure

```
logo-gallery/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── components/        # Shared components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── providers/         # Context providers
│   └── types/             # TypeScript types
├── prisma/                # Database schema
├── public/                # Static assets
└── tests/                 # Test files
```

## Testing

The project includes:
- Unit tests with Jest
- Integration tests
- E2E tests with Playwright
- Visual regression tests
- Performance testing

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Performance

The app is optimized for performance:
- Server-side rendering
- Static page generation
- Image optimization
- Code splitting
- Bundle optimization
- Caching strategies
- CDN integration

## Security

Security measures include:
- CSRF protection
- XSS prevention
- Rate limiting
- Input validation
- Secure headers
- Content security policy
- OAuth 2.0 compliance

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support:
1. Check the [documentation](docs/README.md)
2. Search [existing issues](https://github.com/yourusername/logo-gallery/issues)
3. Create a new issue

## Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Contributors and maintainers
