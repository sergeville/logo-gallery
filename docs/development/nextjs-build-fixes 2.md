# Next.js Build Issues Resolution Guide

## 1. ESLint Configuration Fix

Create or update `.eslintrc.js`:

```javascript
module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Add any specific rules here
  },
  ignorePatterns: ['.next/*', 'node_modules/*']
}
```

## 2. Route Handler Type Fix

Update `app/api/images/[...path]/route.ts`:

```typescript
import { type NextRequest } from 'next/server'
 
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Your handler code here
}
```

## 3. Clean Build Process

Run these commands in order:

```bash
# Remove build artifacts and dependencies
rm -rf .next
rm -rf node_modules

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install
```

## 4. Version Verification and Updates

Check and update Next.js version:

```bash
# Check current version
npm list next

# Update to latest version if needed
npm install next@latest
```

## 5. Type Checking

Run standalone type check:

```bash
npx tsc --noEmit
```

## 6. ESLint Debugging

Debug ESLint configuration:

```bash
npx eslint --debug .
```

## Troubleshooting Checklist

1. [ ] Verified ESLint configuration is correct
2. [ ] Confirmed route handler types match Next.js documentation
3. [ ] Cleaned and rebuilt project
4. [ ] Checked for version compatibility
5. [ ] Run type checking independently
6. [ ] Debugged ESLint configuration

## Notes

- If issues persist after implementing these fixes, check for:
  - Hidden ESLint configurations in package.json
  - Conflicting types in other route files
  - Incompatible dependency versions
  - TypeScript configuration issues in tsconfig.json

## Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [ESLint Configuration Documentation](https://eslint.org/docs/user-guide/configuring)
