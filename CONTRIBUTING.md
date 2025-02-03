# Contributing to Logo Gallery

Thank you for your interest in contributing to Logo Gallery! This document outlines our development standards and contribution guidelines.

## Development Standards

### Project Structure

```
app/
├── lib/        # Utilities, database connections, auth config
├── models/     # Database models
├── components/ # React components
├── api/        # API routes
├── tests/      # Unit tests
└── e2e/        # End-to-end and visual tests
```

### Code Standards

#### 1. Import Standards

- Use `@/` path alias for all imports from project root
- Use named imports for clarity

```typescript
// ✅ Correct
import { connectToDatabase } from '@/lib/db';
import { LogoModel } from '@/models/LogoModel';

// ❌ Incorrect
import db from '@/lib/db';
import { LogoModel } from '../../models/LogoModel';
```

#### 2. Database Operations

```typescript
try {
  await connectToDatabase();
  // DB operations
} catch (error) {
  console.error('DB Error:', error);
  throw new Error('Database operation failed');
}
```

#### 3. API Routes

- Place in `app/api/` directory
- Use consistent error handling:

```typescript
try {
  // Logic
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json({ error: 'User-friendly message' }, { status: appropriate_code });
}
```

#### 4. Authentication

- Use NextAuth.js for authentication
- Protect routes with middleware
- Check session status:

```typescript
const session = await getServerSession(authConfig);
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### TypeScript Guidelines

- Enable strict mode
- Define interfaces for data structures
- Use proper type imports
- Avoid 'any' type
- Document complex types
- Use zod for runtime type validation

### Testing Requirements

- Write unit tests for components and utilities
- Implement visual regression tests
- Use Playwright for E2E testing
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test error cases
- Update visual snapshots when needed

### Component Development

- Use TypeScript interfaces for props
- Implement error boundaries
- Follow React best practices
- Use proper state management
- Document complex components
- Support dark mode
- Ensure responsive design

### Performance Considerations

- Optimize database queries
- Use proper caching
- Implement lazy loading
- Optimize images with Next.js Image
- Monitor performance metrics
- Optimize SVGs with SVGR
- Use debouncing for search inputs

### Security Standards

- Validate all inputs
- Sanitize data
- Use environment variables
- Implement rate limiting
- Follow OWASP guidelines
- Secure file uploads
- Validate image types

### Code Style

- Use ESLint rules
- Follow Prettier config
- Write clear comments
- Use meaningful names
- Keep functions small
- Use Husky pre-commit hooks

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
test: add visual regression tests
```

### Pull Requests

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Update documentation
5. Run visual tests
6. Submit PR against `develop`
7. Wait for review

## Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local`
3. Install dependencies: `npm install`
4. Run development server: `npm run dev`
5. Run tests: `npm run test:visual`

### Environment Variables

Required variables:

- `MONGODB_URI`: MongoDB connection string
- `NEXTAUTH_SECRET`: NextAuth.js secret
- `NEXTAUTH_URL`: NextAuth.js URL
- `NEXT_PUBLIC_API_URL`: API base URL

## Visual Testing

1. Run visual tests: `npm run test:visual`
2. Update snapshots if needed: `npm run test:visual:update`
3. Check visual differences in test results
4. Document visual changes in PR

## Documentation

- Update README.md for major changes
- Add JSDoc comments for functions
- Document API endpoints
- Keep documentation up to date
- Update visual test documentation
- Document error tracking

## Questions?

Feel free to open an issue for:

- Feature proposals
- Bug reports
- Documentation improvements
- Visual test failures
- General questions

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
