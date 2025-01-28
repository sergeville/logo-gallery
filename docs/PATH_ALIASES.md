# Path Aliases Configuration

This document outlines how path aliases are configured and used in the Logo Gallery project.

## Overview

The project uses the `@` path alias to provide absolute imports from the project root. This improves code maintainability and readability by eliminating complex relative paths.

## Configuration Files

### 1. TypeScript Configuration (`tsconfig.json`)

The base TypeScript configuration includes the path alias mapping:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### 2. E2E Testing Configuration (`tsconfig.e2e.json`)

Specific configuration for Playwright E2E tests:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "types": ["node", "@playwright/test"]
  },
  "include": ["e2e/**/*.ts", "playwright.*.ts"],
  "exclude": ["node_modules"]
}
```

### 3. Jest Configuration (`jest.config.ts`)

Module name mapping for Jest tests:

```typescript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1'
}
```

### 4. Next.js Configuration

Next.js automatically supports the path aliases defined in `tsconfig.json`. No additional configuration is needed in `next.config.js`.

## Usage Examples

### 1. Importing Constants

Instead of using relative paths:
```typescript
import { LOCALHOST_URL } from '../../config/constants';
```

Use the `@` alias:
```typescript
import { LOCALHOST_URL } from '@/config/constants';
```

### 2. Test Files

The `@` alias is particularly useful in test files that may be deeply nested:

```typescript
// Before
import { testConfig } from '../../../config/test';

// After
import { testConfig } from '@/config/test';
```

### 3. Component Imports

```typescript
// Before
import { Button } from '../../../components/ui/Button';

// After
import { Button } from '@/components/ui/Button';
```

## When to Use Path Aliases

### Recommended:
- Importing from configuration files
- Accessing shared utilities or constants
- Cross-module imports
- Deep imports that would require multiple directory traversals
- Importing shared components
- Accessing global types and interfaces

### Not Recommended:
- Imports within the same directory (use relative imports)
- Test utility imports (keep relative for clarity)
- Closely related module imports
- Local component imports (within the same feature module)

## Files Using Path Aliases

The following files have been updated to use the `@` alias:

1. E2E Test Files:
   - `e2e/visual/vote.spec.ts`
   - `e2e/visual/layout.spec.ts`
   - `e2e/visual/components.spec.ts`
   - `e2e/utils/fixtures.ts`

2. Configuration Files:
   - `playwright.config.ts`
   - `config/environments/test.ts`
   - `config/test/testing.ts`

## Environment Variables

While not directly related to path aliases, the project uses environment variables for configuration with localhost fallbacks:

```typescript
export const LOCALHOST_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
```

## IDE Setup

### VS Code
1. TypeScript path aliases are automatically supported
2. For better IntelliSense, ensure you have:
   ```json
   {
     "typescript.preferences.importModuleSpecifier": "non-relative"
   }
   ```
   in your VS Code settings

### WebStorm/IntelliJ
1. Path aliases are automatically recognized from `tsconfig.json`
2. Enable "Use path mappings from tsconfig.json" in Settings > Languages & Frameworks > TypeScript

### Vim/Neovim
1. Install `typescript-language-server`
2. Configure LSP to read `tsconfig.json`
3. For CoC users, no additional configuration needed

## Common Pitfalls

1. **Mixed Import Styles**
   ```typescript
   // Inconsistent - Avoid this
   import { Button } from '@/components/ui/Button';
   import { Input } from '../../components/ui/Input';
   ```

2. **Incorrect Alias Usage**
   ```typescript
   // Wrong
   import { utils } from '@utils/helpers';
   
   // Correct
   import { utils } from '@/utils/helpers';
   ```

3. **Missing Type Definitions**
   ```typescript
   // Add to tsconfig.json if using custom paths
   {
     "compilerOptions": {
       "typeRoots": ["./node_modules/@types", "./types"]
     }
   }
   ```

## Best Practices

1. **Consistency**: Use the `@` alias for imports from the project root
2. **Module Boundaries**: Keep relative imports for closely related files
3. **Test Files**: Use relative imports for test utilities
4. **Configuration**: Always import configuration files using the `@` alias
5. **Component Libraries**: Use aliases for shared component imports
6. **Type Definitions**: Keep global types under `@/types`

## Troubleshooting

If path aliases are not working:

1. Check TypeScript configuration:
   ```bash
   tsc --noEmit # Should show no errors related to imports
   ```

2. Verify Jest configuration:
   ```bash
   jest --showConfig # Check moduleNameMapper section
   ```

3. Ensure Playwright configuration is using the correct tsconfig:
   ```typescript
   // playwright.config.ts
   typescript: {
     config: path.join(__dirname, 'tsconfig.e2e.json'),
   }
   ```

4. Clear TypeScript cache:
   ```bash
   rm -rf node_modules/.cache/typescript
   ```

5. Restart your IDE/TypeScript server

## Maintenance

When adding new configuration files or shared utilities:

1. Consider if they should be imported using the `@` alias
2. Update this documentation if new patterns emerge
3. Keep the usage consistent across similar files
4. Run the test suite to ensure imports are working correctly
5. Review imports during code reviews for consistency
6. Use automated tools to enforce import patterns 