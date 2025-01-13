# Logo Gallery

A modern web application for managing and showcasing logos, built with Next.js, TypeScript, and MongoDB.

## Documentation

- [Database Configuration](docs/database.md) - Complete guide for database setup across all environments
- [Testing Guide](TESTING.md) - Testing setup and guidelines
- [Changelog](CHANGELOG.md) - Version history and changes
- [Implementation Guide](implementation-guide.md) - Development guidelines and practices

## Features

- User authentication (login/register)
- Logo upload and management
- Dark mode support
- Responsive design
- Rating system
- Tag-based organization

## Tech Stack

- Next.js 14
- TypeScript
- MongoDB
- Tailwind CSS
- Docker

## Getting Started

### Prerequisites

- Node.js 18 or later
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sergeville/logo-gallery.git
cd logo-gallery
```

2. Install dependencies:
```bash
npm install
```

3. Start the development environment:
```bash
docker-compose up --build
```

The application will be available at http://localhost:3000

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=mongodb://mongodb:27017/logo-gallery
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Environment Setup

1. Initial Setup
```bash
# Copy the example environment file for development
cp .env.example .env.development

# Edit .env.development with your development settings:
MONGODB_URI=mongodb://localhost:27017/LogoGalleryDevelopmentDB
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

2. Environment-Specific Files
Each environment has its own configuration file:
- Development: `.env.development`
- Test: `.env.test`
- Production: `.env.production`

3. Database Names
Each environment uses its own database:
- Development: `LogoGalleryDevelopmentDB`
- Test: `LogoGalleryTestDB`
- Production: `LogoGalleryProductionDB`

For detailed configuration instructions, see:
- [Database Documentation](docs/database.md)
- [Environment Configuration Guide](docs/database.md#environment-specific-configurations)

## Development

To start the development server:
```bash
# Start with development environment
NODE_ENV=development npm run dev

# Or using Docker
docker-compose up --build
```

## Docker Support

The project includes Docker configuration for both development and production environments:

- Development: `docker-compose up --build`
- Production: Use the Dockerfile with appropriate environment variables

## License

MIT

## Development Guidelines

### Database Changes
Before making any changes to the database structure, types, or related code, please refer to our [Database Validation Checklist](docs/VALIDATION_CHECKLIST.md). This checklist helps maintain consistency across:
- Database schemas
- TypeScript types
- Test data generation
- Model relationships
- Environment configurations

### Documentation
- [Database Configuration](docs/database.md) - Database setup and configuration
- [Validation Checklist](docs/VALIDATION_CHECKLIST.md) - Checklist for database changes
