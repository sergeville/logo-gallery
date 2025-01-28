# Logo Gallery

A modern web application for managing and sharing logo designs with comprehensive validation, testing, and database integration.

## Features

- User authentication with NextAuth.js
- User profile management
- Logo upload and management
- Responsive image handling with fallbacks
- Modern UI with horizontal navigation
- Comprehensive validation
- MongoDB integration
- Extensive test coverage
- Visual regression testing

## Tech Stack

- Next.js 14
- TypeScript
- MongoDB with Mongoose
- NextAuth.js for authentication
- Tailwind CSS for styling
- Jest for testing
- Playwright for visual testing
- Image optimization with next/image

## Development

We follow strict development guidelines to ensure code quality and maintainability. Please read our [Contributing Guidelines](docs/CONTRIBUTING.md) before starting development. These guidelines include:

- Easy to follow steps with clear examples
- Technically thorough implementations
- Best practices and coding standards
- Long-term code quality focus
- Multiple solution considerations

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
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

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` and set your MongoDB connection string:
```
MONGODB_TEST_URI=mongodb://localhost:27017/LogoGalleryTest
```

4. Run tests:
```bash
npm run test:seed
```

## Project Structure

```
logo-gallery/
├── app/                     # Next.js app directory
│   ├── api/                # API routes
│   ├── components/         # React components
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript types
├── docs/                   # Documentation
│   ├── DATABASE.md        # Database schema and structure
│   ├── DESIGN.md          # Application design and architecture
│   ├── mongodb-setup.md   # MongoDB setup guide
│   ├── test-data.md       # Test data documentation
│   ├── database-testing.md # Database testing guide
│   ├── VALIDATION_CHECKLIST.md # Input validation rules
│   └── TODO.md            # Development roadmap
├── public/                 # Static assets
└── README.md              # This file
```

## Documentation

The project includes comprehensive documentation in the `docs` directory:

- **[Database Schema](docs/DATABASE.md)**: Database structure, relationships, and validation rules
- **[Design Document](docs/DESIGN.md)**: Application architecture, design decisions, and patterns
- **[MongoDB Setup](docs/mongodb-setup.md)**: Step-by-step guide for setting up MongoDB
- **[Test Data](docs/test-data.md)**: Documentation for test data generation and usage
- **[Database Testing](docs/database-testing.md)**: Guide for database testing procedures
- **[Visual Testing](docs/guides/VISUAL_TESTING.md)**: Guide for visual regression testing
- **[Validation Checklist](docs/VALIDATION_CHECKLIST.md)**: Complete list of input validation rules
- **[Development Roadmap](docs/TODO.md)**: Planned features and improvements
- **[Contributing Guidelines](docs/CONTRIBUTING.md)**
- **[Changelog](docs/CHANGELOG.md)**
- **[API Documentation](docs/API.md)**
- **[Path Aliases](docs/PATH_ALIASES.md)**: Guide for using path aliases and import configurations

## Testing

The project includes comprehensive tests covering:
- Unit tests with Jest
- Integration tests
- End-to-end tests with Playwright
- Visual regression tests
- Input validation
- Data relationships
- Edge cases
- Error conditions
- Performance with large datasets

Run tests with:
```bash
# Run unit and integration tests
npm run test

# Run visual regression tests
npm run test:visual

# Update visual test snapshots
npm run test:visual:update

# Run visual tests with UI
npm run test:visual:ui
```

Current test coverage:
- Statements: 94.71%
- Branches: 84.71%
- Functions: 94.48%
- Lines: 94.52%
- Visual Components: 100%

## Validation Rules

### Users
- Username: 3-50 chars, alphanumeric with dash/underscore
- Email: Standard email format
- Profile:
  - Bio: Max 500 chars
  - Location: Max 100 chars
  - Skills: Max 20 items

### Logos
- Name: 3-100 chars, alphanumeric with spaces/dash/underscore
- Tags: 1-50 tags, each 2-30 chars
- Description: Max 1000 chars

### Relationships
- Comments: Max 1000 chars, max 10 mentions
- Collections: Max 50 per user, max 1000 logos per collection

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
