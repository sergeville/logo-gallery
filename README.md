# Logo Gallery

A modern web application for managing and sharing logo designs with comprehensive validation, testing, and database integration.

## Features

- User management with profile support
- Logo upload and management
- Rating system
- Comments with mentions
- Collections with sharing capabilities
- Favorites system
- Comprehensive validation
- Extensive test coverage

## Tech Stack

- TypeScript
- MongoDB
- Jest for testing
- Faker.js for test data generation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
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
├── scripts/
│   ├── seed/
│   │   ├── __tests__/        # Test files
│   │   ├── types.ts          # TypeScript interfaces
│   │   ├── db-helper.ts      # Database operations
│   │   ├── seed-utils.ts     # Seeding utilities
│   │   └── test-observer.ts  # Test reporting
│   └── migrations/           # Database migrations
├── docs/                     # Documentation
├── CHANGELOG.md             # Change history
└── README.md               # This file
```

## Testing

The project includes comprehensive tests covering:
- Input validation
- Data relationships
- Edge cases
- Error conditions
- Performance with large datasets

Run tests with:
```bash
npm run test:seed
```

Current test coverage:
- Statements: 94.71%
- Branches: 84.71%
- Functions: 94.48%
- Lines: 94.52%

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
- Rating: 0-5 range
- Description: Max 1000 chars

### Relationships
- Comments: Max 1000 chars, max 10 mentions
- Collections: Max 50 per user, max 1000 logos per collection
- Favorites: Max 100 per user

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
