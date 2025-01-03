# Logo Gallery

A modern web application for managing and showcasing logos, built with Next.js, TypeScript, and MongoDB.

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

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## Docker Support

The project includes Docker configuration for both development and production environments:

- Development: `docker-compose up --build`
- Production: Use the Dockerfile with appropriate environment variables

## License

MIT
