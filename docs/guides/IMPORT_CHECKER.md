# Import Path Checker

## Overview

The Import Path Checker is a tool that helps maintain consistent import paths across the project by:
1. Detecting non-compliant import paths
2. Suggesting fixes for issues
3. Automatically fixing import paths

## Usage

### Checking Import Paths

To check for import path issues:

```bash
npm run check:imports
```

This will:
- Scan all TypeScript and JavaScript files
- Report any non-compliant import paths
- Show suggested fixes
- Provide a summary of issues found

### Fixing Import Paths

To automatically fix import path issues:

```bash
# Show what would be fixed (dry run)
npm run fix:imports:dry

# Actually fix the issues
npm run fix:imports
```

## What It Checks

1. **Relative Imports**
   ```typescript
   // ❌ Don't use relative imports
   import { Button } from '../../components/Button';
   
   // ✅ Use path alias
   import { Button } from '@/components/Button';
   ```

2. **Index Imports**
   ```typescript
   // ❌ Don't use index imports
   import { Button } from '@/components/Button/index';
   
   // ✅ Import directly
   import { Button } from '@/components/Button';
   ```

3. **src/ Imports**
   ```typescript
   // ❌ Don't use src/ imports
   import { config } from 'src/config';
   
   // ✅ Use @/ alias
   import { config } from '@/config';
   ```

## Configuration

The tool recognizes the following directory mappings:
```typescript
{
  components: '@/components/',
  hooks: '@/hooks/',
  lib: '@/lib/',
  types: '@/types/',
  utils: '@/utils/',
  styles: '@/styles/',
}
```

## Integration with CI/CD

Add the import checker to your CI pipeline:

```yaml
jobs:
  quality:
    steps:
      - name: Check Import Paths
        run: npm run check:imports
```

## Common Issues

1. **Path Resolution**
   - Ensure tsconfig.json has correct path mappings
   - Verify all imports use forward slashes
   - Check file extensions match

2. **False Positives**
   - External package imports are ignored
   - Test files follow the same rules
   - Node.js built-in modules are allowed

3. **Performance**
   - Large projects may take longer
   - Use .gitignore patterns to skip files
   - Run checks incrementally in CI

## Best Practices

1. **Regular Checks**
   - Run checker before commits
   - Fix issues immediately
   - Keep path aliases consistent

2. **Code Organization**
   - Group related files together
   - Use meaningful directory names
   - Keep directory structure flat

3. **Maintenance**
   - Update path mappings as needed
   - Review ignored patterns regularly
   - Keep documentation current

## Troubleshooting

### Common Errors

1. **Parse Errors**
   ```
   Error parsing file: Unexpected token
   ```
   - Check file syntax
   - Verify TypeScript configuration
   - Ensure file is valid

2. **Path Resolution**
   ```
   Cannot find module
   ```
   - Check path alias configuration
   - Verify file exists
   - Check case sensitivity

3. **Performance Issues**
   ```
   Process timed out
   ```
   - Reduce scope of check
   - Update ignore patterns
   - Run on changed files only

## Contributing

To enhance the import checker:

1. Add new rules in `import-checker.ts`
2. Update tests to cover new cases
3. Document changes in this guide
4. Submit a pull request

## Future Improvements

1. **Enhanced Features**
   - Batch processing mode
   - Interactive fixing
   - Custom rule configuration
   - Import organization

2. **Integration**
   - IDE plugins
   - Git hooks
   - Build process
   - Automated PR comments

3. **Performance**
   - Incremental checking
   - Parallel processing
   - Caching mechanisms
   - Selective fixing 