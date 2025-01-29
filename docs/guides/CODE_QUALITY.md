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