# Project Standards and Conventions

## Import Path Standards

### Using the `@` Path Alias

All imports should use the `@` path alias instead of relative paths. This makes imports more consistent and easier to maintain.

```typescript
// ✅ Good
import { Button } from '@/app/components/Button';
import { useAuth } from '@/app/hooks/useAuth';
import { config } from '@/config/app.config';

// ❌ Bad
import { Button } from '../../components/Button';
import { useAuth } from '../hooks/useAuth';
import { config } from '../../../config/app.config';
```

### Import Order

Imports should be organized in the following order:
1. Built-in Node modules
2. External dependencies
3. Internal modules (using @/)
4. Parent/sibling modules
5. Type imports

Each group should be separated by a blank line and alphabetically sorted.

```typescript
// Built-in modules
import { useEffect } from 'react';

// External dependencies
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Internal modules
import { Button } from '@/app/components/Button';
import { useAuth } from '@/app/hooks/useAuth';
import { config } from '@/config/app.config';

// Types
import type { User } from '@/app/types';
```

### File Structure

- Components should be imported from `@/app/components`
- Hooks should be imported from `@/app/hooks`
- Types should be imported from `@/app/types`
- Configuration should be imported from `@/config`
- Services should be imported from `@/app/lib/services`
- Utils should be imported from `@/app/lib/utils`

### Index Imports

Avoid using `/index` in import paths. The bundler will automatically resolve index files.

```typescript
// ✅ Good
import { Button } from '@/app/components/Button';

// ❌ Bad
import { Button } from '@/app/components/Button/index';
```

### Type Imports

Use explicit type imports with the `type` keyword to help the bundler with tree-shaking.

```typescript
// ✅ Good
import type { User } from '@/app/types';

// ❌ Bad
import { User } from '@/app/types';
```

## Enforcement

These standards are enforced through:
1. ESLint rules in `.eslintrc.js`
2. TypeScript path aliases in `tsconfig.json`
3. Import checker and fixer scripts
4. Pre-commit hooks

Run `npm run fix-imports` to automatically fix import paths in your code.

## Directory Structure
```
app/
├── lib/           # Shared utilities, database connections, etc.
├── models/        # Database models
├── components/    # Reusable React components
└── api/          # API routes
```

## Database Connections

### MongoDB Connection
- Use the standard database connection from `@/lib/db`
- Always import `connectToDatabase` as a named import
```typescript
import { connectToDatabase } from '@/lib/db'
```

### Models
- Place all models in the `@/models` directory
- Use consistent model exports
```typescript
export const MyModel = mongoose.models.MyModel || 
  mongoose.model('MyModel', myModelSchema)
```

## API Routes
- Place all API routes under `app/api/`
- Use consistent error handling
```typescript
try {
  // ... logic ...
} catch (error) {
  console.error('Error description:', error)
  return NextResponse.json(
    { error: 'User-friendly error message' },
    { status: appropriate_status_code }
  )
}
```

## Component Standards
- Place reusable components in `@/components`
- Use TypeScript interfaces for props
```typescript
interface MyComponentProps {
  prop1: string;
  prop2?: number;
}

export default function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // ... component logic ...
}
```

## Authentication
- Use NextAuth.js for authentication
- Import auth utilities from `@/lib/auth`
- Check admin status using environment variables
```typescript
const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
```

## Environment Variables
- Use `.env.local` for local development
- Document all required environment variables in `.env.example`
- Use appropriate naming:
  - `NEXT_PUBLIC_*` for client-side variables
  - Regular names for server-side variables

## TypeScript
- Enable strict mode
- Use interfaces for data structures
- Use proper type imports
```typescript
import type { MyType } from '@/lib/types'
```

## Testing
- Place tests next to the files they test
- Use consistent naming: `*.test.tsx` or `*.test.ts`
- Follow the testing pattern:
```typescript
describe('Component/Feature Name', () => {
  beforeEach(() => {
    // Setup
  })

  it('should do something specific', () => {
    // Test
  })
})
```

## Code Style
- Use consistent formatting (Prettier)
- Follow ESLint rules
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

## Git Practices
- Use meaningful commit messages
- Follow conventional commits format
- Keep PRs focused and manageable in size

## Updates and Maintenance
- Review and update these standards as needed
- Document any deviations or exceptions
- Ensure new team members are familiar with these standards 