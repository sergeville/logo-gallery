# Code Quality Guide

## Overview

This guide outlines the code quality tools and standards implemented in the Logo Gallery project to ensure consistent, maintainable, and high-quality code.

## Tools & Configuration

### ESLint

ESLint is configured with strict rules for:
- React & Next.js best practices
- TypeScript type checking
- Import organization
- Path alias enforcement
- Accessibility (jsx-a11y)
- Code style consistency

```bash
# Run ESLint check
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Prettier

Prettier ensures consistent code formatting across the project:
- 100 character line width
- 2 space indentation
- Single quotes
- Trailing commas in ES5 mode
- Consistent arrow function parentheses

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

### TypeScript

Strict TypeScript configuration enables:
- Strict null checks
- Strict function types
- No implicit any
- No implicit returns
- Consistent casing enforcement

```bash
# Run type checking
npm run type-check
```

### Lint Staged

Automatically runs checks on staged files:
- ESLint for .js, .jsx, .ts, .tsx files
- Prettier for all supported files
- Stylelint for CSS/SCSS files

### Pre-commit Hooks

Husky enforces code quality checks before commits:
1. Lint staged files
2. Run type checking
3. Ensure formatting consistency

## Running Quality Checks

### Complete Quality Check

```bash
npm run quality-check
```

This runs:
1. ESLint check
2. Prettier format check
3. TypeScript type check

### Individual Checks

```bash
# ESLint only
npm run lint

# Prettier only
npm run format:check

# TypeScript only
npm run type-check
```

## Best Practices

1. **Regular Checks**
   - Run `npm run quality-check` before pushing changes
   - Address all warnings and errors
   - Use IDE integrations for real-time feedback

2. **Code Style**
   - Follow ESLint and Prettier configurations
   - Use TypeScript types consistently
   - Follow import ordering rules
   - Use path aliases (@/) for imports

3. **Type Safety**
   - Avoid using `any` type
   - Provide explicit return types for functions
   - Use strict null checks
   - Define interfaces for component props

4. **Performance**
   - Follow React hooks rules
   - Use proper dependency arrays in useEffect
   - Avoid unnecessary re-renders
   - Follow import/export best practices

## IDE Integration

### VS Code

Recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

Settings:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### WebStorm

Enable:
- ESLint automatic fixes
- Prettier as default formatter
- TypeScript service
- Format on save

## Troubleshooting

### Common Issues

1. **ESLint Conflicts**
   - Check for conflicting rules
   - Update ESLint configuration
   - Clear ESLint cache

2. **Prettier Formatting**
   - Ensure .prettierrc is in root
   - Check for conflicting tools
   - Run format command manually

3. **Type Errors**
   - Check TypeScript configuration
   - Update type definitions
   - Add missing type declarations

## Continuous Integration

The quality checks are integrated into the CI pipeline:
1. ESLint check
2. Prettier check
3. TypeScript compilation
4. Unit tests
5. Build verification

## Future Improvements

1. **Additional Tools**
   - Add complexity checks
   - Implement bundle size limits
   - Add performance budgets
   - Enhance accessibility checks

2. **Automation**
   - Automated code review comments
   - Performance regression detection
   - Automated fix suggestions
   - Impact analysis reports

## Import Path Rules

### Overview

The project enforces strict rules for import paths to maintain consistency and improve code organization:

1. **Path Alias Usage**
   - Use `@/` path alias instead of relative imports
   - Example: `import { Button } from '@/components/Button'`
   - Avoid: `import { Button } from '../../components/Button'`

2. **Import Organization**
   - Imports are automatically sorted
   - Type imports are separated from value imports
   - Member imports are sorted alphabetically

3. **Restricted Patterns**
   ```typescript
   // ❌ Don't use relative imports
   import { utils } from '../utils'
   
   // ✅ Use path alias
   import { utils } from '@/utils'
   
   // ❌ Don't use index imports
   import { Button } from '@/components/Button/index'
   
   // ✅ Import directly
   import { Button } from '@/components/Button'
   
   // ❌ Don't use src/ imports
   import { config } from 'src/config'
   
   // ✅ Use @/ alias
   import { config } from '@/config'
   ```

4. **Type Imports**
   ```typescript
   // ❌ Don't mix type and value imports
   import { type User, getUser } from '@/types'
   
   // ✅ Separate type imports
   import type { User } from '@/types'
   import { getUser } from '@/types'
   ```

### Directory Structure

The path alias `@/` maps to the project root, with the following structure:
```
src/
├── components/     # React components
├── hooks/         # Custom hooks
├── lib/           # Core functionality
├── types/         # TypeScript types
├── utils/         # Utility functions
└── styles/        # CSS and style files
```

### ESLint Rules

The following ESLint rules are enforced:
1. `no-restricted-imports`: Prevents relative imports
2. `sort-imports`: Maintains consistent import ordering
3. `no-duplicate-imports`: Prevents multiple imports from same module
4. `@typescript-eslint/consistent-type-imports`: Enforces type import style

### Best Practices

1. **Organization**
   - Keep imports grouped by type
   - Place external imports before internal ones
   - Use explicit imports over namespace imports

2. **Path Aliases**
   - Use `@/` for all internal imports
   - Keep paths as short as possible
   - Use proper directory structure

3. **Types**
   - Use separate type imports
   - Define types close to their usage
   - Export types from dedicated files

4. **Performance**
   - Avoid circular dependencies
   - Use dynamic imports for code splitting
   - Import only what's needed

### Common Issues

1. **ESLint Errors**
   ```bash
   # Fix import path issues
   npm run lint:fix
   ```

2. **Path Resolution**
   - Ensure tsconfig.json has correct path mappings
   - Verify module resolution settings
   - Check for correct file extensions

3. **Type Imports**
   - Use explicit type imports
   - Keep type definitions organized
   - Avoid mixing types and values 