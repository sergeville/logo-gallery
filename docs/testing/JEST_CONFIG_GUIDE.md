# Jest Configuration Guide

## Table of Contents
1. [Overview](#overview)
2. [Module Resolution](#module-resolution)
3. [ESM Support](#esm-support)
4. [Best Practices](#best-practices)
5. [Common Issues](#common-issues)
6. [Examples](#examples)

## Overview

This guide covers the Jest configuration used in our project, with a focus on handling ESM modules and proper path resolution.

## Module Resolution

### Path Aliases
We use path aliases to make imports cleaner and more maintainable. These are configured in both TypeScript and Jest:

```javascript
moduleNameMapper: {
  // Internal path aliases
  '^@/(.*)$': '<rootDir>/app/$1',
  '^@/app/(.*)$': '<rootDir>/app/$1',
  '^@/lib/(.*)$': '<rootDir>/app/lib/$1',
  '^@/components/(.*)$': '<rootDir>/app/components/$1',
  // ... more aliases
}
```

### Library Resolution
For third-party libraries, we handle both CommonJS and ESM modules:

```javascript
moduleNameMapper: {
  // Testing libraries
  '^@testing-library/react$': require.resolve('@testing-library/react'),
  '^@testing-library/dom$': require.resolve('@testing-library/dom'),

  // ESM packages
  '^lodash-es$': 'lodash',
  '^lodash-es/(.*)$': 'lodash/$1',
}
```

## ESM Support

### Configuration
To properly handle ESM modules, we use the following configuration:

```javascript
transform: {
  '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
    presets: [
      ['@babel/preset-env', {
        targets: { node: 'current' },
        modules: 'commonjs'
      }],
      '@babel/preset-typescript',
      ['@babel/preset-react', { runtime: 'automatic' }]
    ],
    plugins: [
      ['@babel/plugin-transform-modules-commonjs', { 
        strict: true,
        allowTopLevelThis: true
      }]
    ]
  }]
}
```

### Transform Ignore Patterns
We specify which node_modules should be transformed:

```javascript
transformIgnorePatterns: [
  'node_modules/(?!(' + [
    'lodash-es',
    'lucide-react',
    '@testing-library/react',
    '@testing-library/dom',
    '@babel/runtime'
  ].join('|') + ')/)'
]
```

## Best Practices

### 1. Module Mapping Organization
- Group related mappings together
- Keep internal path aliases first
- Use explicit paths for package resolution
- Document any special cases or workarounds

### 2. ESM Package Handling
- Use CommonJS versions when available
- Transform ESM modules that don't provide CommonJS builds
- Check package.json exports field for correct paths
- Handle package-specific quirks through moduleNameMapper

### 3. Import Strategy
- Use consistent import style (ES imports for TypeScript)
- Avoid mixing require and import statements
- Handle package-specific quirks through moduleNameMapper
- Use proper file extensions in imports

### 4. Configuration Organization
- Group related configurations together
- Use clear section comments
- Keep the configuration maintainable
- Document complex transformations

## Common Issues

### 1. ESM Import Errors
```
Cannot use import statement outside a module
```
**Solution**: Add the package to transformIgnorePatterns and ensure proper module transformation.

### 2. Module Resolution Errors
```
Cannot find module 'package-name'
```
**Solution**: Check moduleNameMapper and ensure correct paths in package resolution.

### 3. Package Export Issues
```
Package subpath './dist/...' is not defined by "exports"
```
**Solution**: Check package.json exports field and use correct subpath exports.

## Examples

### Testing ESM Modules
```typescript
import React from 'react';
import { render } from '@testing-library/react';
import { Check } from 'lucide-react';
import { cloneDeep } from 'lodash-es';

describe('ESM Import Test', () => {
  it('should import and use ESM modules correctly', () => {
    const { container } = render(<Check />);
    expect(container.firstChild).toBeTruthy();
    
    const obj = { a: { b: 2 } };
    const cloned = cloneDeep(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
  });
});
```

### Custom Module Resolution
For packages with specific needs, use explicit paths:

```javascript
moduleNameMapper: {
  '^lucide-react$': '<rootDir>/node_modules/lucide-react/dist/cjs/lucide-react.js',
  '^lucide-react/(.*)$': '<rootDir>/node_modules/lucide-react/dist/cjs/$1'
}
```

## Maintenance

### Regular Updates
1. Keep dependencies up to date
2. Check for ESM compatibility when updating packages
3. Review and update transformIgnorePatterns as needed
4. Monitor test performance and optimize configurations

### Troubleshooting
1. Check package.json exports field
2. Verify module resolution paths
3. Review babel configuration
4. Test with minimal reproduction cases 