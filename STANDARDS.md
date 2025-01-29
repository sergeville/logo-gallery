# Project Standards and Conventions

## Import Path Standards

### Path Aliases
- Use `@/` path alias for imports from the project root
- Example: `import { connectToDatabase } from '@/lib/db'`

```typescript
// ✅ Correct
import { MyComponent } from '@/components/MyComponent'
import { connectToDatabase } from '@/lib/db'
import { VotingSettings } from '@/models/VotingSettings'

// ❌ Incorrect
import { MyComponent } from '../../components/MyComponent'
import { connectToDatabase } from 'lib/db'
import { VotingSettings } from '../models/VotingSettings'
```

### Directory Structure
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