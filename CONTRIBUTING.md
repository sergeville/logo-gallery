# Contributing to Logo Gallery

Thank you for your interest in contributing to Logo Gallery! This document outlines our development standards and contribution guidelines.

## Development Standards

### Project Structure
```
app/
├── lib/        # Utilities, database connections
├── models/     # Database models
├── components/ # React components
├── api/        # API routes
└── tests/      # Test files
```

### Code Standards

#### 1. Import Standards
- Use `@/` path alias for all imports from project root
- Use named imports for clarity
```typescript
// ✅ Correct
import { connectToDatabase } from '@/lib/db'
import { VotingSettings } from '@/models/VotingSettings'

// ❌ Incorrect
import db from '@/lib/db'
import { VotingSettings } from '../../models/VotingSettings'
```

#### 2. Database Operations
```typescript
try {
  await connectToDatabase()
  // DB operations
} catch (error) {
  console.error('DB Error:', error)
  throw error
}
```

#### 3. API Routes
- Place in `app/api/` directory
- Use consistent error handling:
```typescript
try {
  // Logic
} catch (error) {
  console.error('Error:', error)
  return NextResponse.json(
    { error: 'User-friendly message' },
    { status: appropriate_code }
  )
}
```

#### 4. Authentication
- Use NextAuth.js
- Check admin status:
```typescript
const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
```

### TypeScript Guidelines
- Enable strict mode
- Define interfaces for data structures
- Use proper type imports
- Avoid 'any' type
- Document complex types

### Testing Requirements
- Write tests for all features
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test error cases

### Component Development
- Use TypeScript interfaces for props
- Implement error boundaries
- Follow React best practices
- Use proper state management
- Document complex components

### Performance Considerations
- Optimize database queries
- Use proper caching
- Implement lazy loading
- Optimize images
- Monitor performance metrics

### Security Standards
- Validate all inputs
- Sanitize data
- Use environment variables
- Implement rate limiting
- Follow OWASP guidelines

### Code Style
- Use ESLint rules
- Follow Prettier config
- Write clear comments
- Use meaningful names
- Keep functions small

## Git Workflow

### Branches
- `main`: Production-ready code
- `develop`: Development branch
- Feature branches: `feature/your-feature-name`
- Bug fixes: `fix/bug-description`

### Commit Messages
Follow conventional commits format:
```
feat: add logo voting feature
fix: resolve database connection issue
docs: update API documentation
test: add tests for voting component
```

### Pull Requests
1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Update documentation
5. Submit PR against `develop`
6. Wait for review

## Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local`
3. Install dependencies: `npm install`
4. Run development server: `npm run dev`

### Environment Variables
- Use `.env.local` for development
- Document all variables in `.env.example`
- Use appropriate naming:
  - `NEXT_PUBLIC_*` for client-side
  - Regular names for server-side

## Documentation
- Update README.md for major changes
- Add JSDoc comments for functions
- Document API endpoints
- Keep documentation up to date

## Questions?
Feel free to open an issue for:
- Feature proposals
- Bug reports
- Documentation improvements
- General questions

## License
By contributing, you agree that your contributions will be licensed under the project's license. 