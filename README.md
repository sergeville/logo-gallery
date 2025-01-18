# Logo Gallery

A modern web application for discovering and sharing beautiful logos. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🔐 Secure authentication with NextAuth.js
- 🌙 Dark mode support
- 📤 Logo upload and management
- ⭐ Rating system
- 🔍 Search and filter capabilities
- 🏷️ Tag-based organization
- ∞ Infinite scroll gallery

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- npm or yarn

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

3. Create a `.env.local` file with your environment variables:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
logo-gallery/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── components/        # Reusable components
│   ├── gallery/           # Gallery pages
│   └── upload/           # Upload functionality
├── public/                # Static files
└── types/                # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## Git Tags

- `v1.0.0-auth` - Initial release with authentication
- Main features implemented: Authentication, Dark Mode, Basic Layout

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'feat: add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License.
