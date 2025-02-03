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
import { connectToDatabase } from '@/lib/db';
```

### Models

- Place all models in the `@/models` directory
- Use consistent model exports

```typescript
export const MyModel = mongoose.models.MyModel || mongoose.model('MyModel', myModelSchema);
```

## API Routes

- Place all API routes under `app/api/`
- Use consistent error handling

```typescript
try {
  // ... logic ...
} catch (error) {
  console.error('Error description:', error);
  return NextResponse.json(
    { error: 'User-friendly error message' },
    { status: appropriate_status_code }
  );
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
const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
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
import type { MyType } from '@/lib/types';
```

## Testing

- Place tests next to the files they test
- Use consistent naming: `*.test.tsx` or `*.test.ts`
- Follow the testing pattern:

```typescript
describe('Component/Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something specific', () => {
    // Test
  });
});
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

## Visual Testing Standards

1. **Screenshot Management**

```typescript
// Configure screenshot directory
const screenshotDir = 'e2e/screenshots';

// Take component screenshot
test('component visual test', async ({ page }) => {
  await page.goto('/test-page');
  await expect(page).toHaveScreenshot('component.png', {
    mask: ['.dynamic-content'],
    threshold: 0.1,
  });
});
```

2. **Visual Test Categories**

- Component States
  - Default state
  - Hover state
  - Active state
  - Disabled state
  - Error state
- Responsive Design
  - Mobile viewport
  - Tablet viewport
  - Desktop viewport
- Theme Variations
  - Light theme
  - Dark theme
  - High contrast

3. **Visual Error Documentation**

```markdown
## Visual Error Report

- **Component**: [Name]
- **State**: [State being tested]
- **Expected**: [Screenshot link]
- **Actual**: [Screenshot link]
- **Diff**: [Screenshot link]
- **Browser**: [Browser info]
- **Viewport**: [Dimensions]
```

4. **Visual Test Organization**

```typescript
describe('Visual Tests', () => {
  describe('Component States', () => {
    test.each([
      ['default', {}],
      ['hover', { hover: true }],
      ['active', { pressed: true }],
      ['disabled', { disabled: true }],
    ])('%s state', async (state, props) => {
      await expect(page).toHaveScreenshot(`${component}-${state}.png`);
    });
  });
});
```

5. **Visual Regression Process**
   a. Baseline Creation
   - Create initial screenshots
   - Document component states
   - Set threshold values

b. Comparison

- Run tests against baseline
- Generate diff images
- Track changes

c. Review

- Review visual changes
- Update baselines if needed
- Document decisions

6. **Visual Test Documentation**

```markdown
## Component: [Name]

### Test Coverage

- [ ] Default state
- [ ] Interactive states
- [ ] Responsive design
- [ ] Theme variations

### Known Issues

- Issue 1: [Description]
  - Status: [Open/Fixed]
  - Priority: [High/Medium/Low]
```
