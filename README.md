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

## Implementation Details

### Homepage (`app/page.tsx`)
The homepage is implemented as a client-side component with the following features:

- **Authentication State Management**
  ```typescript
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  ```

- **Conditional Rendering**
  - Shows loading skeleton while auth state is being determined
  - Displays personalized content for authenticated users
  - Shows sign-in prompt for guests

- **Authentication Modal**
  - Triggered by "Sign In to Get Started" button
  - Handles both sign-in and registration
  - Provides feedback during authentication process

### Authentication Flow
1. **Initial State**
   - User lands on homepage
   - Auth state is checked via `useAuth` hook
   - Loading skeleton shown during check

2. **Guest Experience**
   - Welcome message with app description
   - Sign-in prompt in Latest Uploads section
   - Modal-based authentication flow

3. **Authenticated Experience**
   - Personalized welcome message
   - Quick access to Upload and Gallery features
   - Session management via NextAuth.js

### Key Components
- **AuthModal**: Handles user authentication
- **useAuth Hook**: Manages authentication state
- **Layout**: Provides consistent structure
- **Navigation**: Adapts to auth state

### State Management
- Client-side state for modal visibility
- Server-side session management
- Loading states for smooth transitions

### Error Handling
- Form validation in auth modal
- Loading state management
- Graceful fallbacks for network issues

## File Management

The application stores uploaded logo files in the `/public/uploads` directory. This directory is automatically created if it doesn't exist.

### Synchronization Scripts

- `npm run check-logo-sync`: Check if database entries match files in uploads directory
- `npm run sync-to-local`: Sync database to match local files (treats `/public/uploads` as source of truth)
- `npm run cleanup-orphaned-files`: Remove files without database entries
- `npm run remove-broken-logos`: Remove database entries without files
