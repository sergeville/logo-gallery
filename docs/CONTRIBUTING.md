# Contributing to Logo Gallery

This guide will help you contribute to the Logo Gallery project effectively while maintaining high code quality standards.

## Development Guidelines

### 1. Easy to Follow with Clear Steps

- Break down complex tasks into smaller, manageable steps
- Use descriptive commit messages following the format:
  ```
  feat(scope): add logo upload validation
  
  - Add file size validation
  - Implement mime type checking
  - Add error messages for invalid uploads
  ```
- Document setup steps clearly:
  ```bash
  # Example setup
  npm install
  cp .env.example .env.local
  npm run dev
  ```

### 2. Backed by Concrete Examples

- Include code examples in documentation
- Provide usage examples in component files
- Add test cases that serve as documentation:

```typescript
// Example test case
describe('LogoCard', () => {
  it('should handle image loading errors gracefully', () => {
    const { getByTestId } = render(
      <LogoCard 
        logo={{
          _id: '123',
          imageUrl: 'invalid-url.jpg',
          title: 'Test Logo'
        }}
      />
    );
    
    expect(getByTestId('error-fallback')).toBeInTheDocument();
  });
});
```

### 3. Technically Thorough

- Write comprehensive tests (unit, integration, e2e)
- Handle edge cases and error scenarios
- Document technical decisions and trade-offs
- Use TypeScript with strict mode enabled
- Implement proper error handling:

```typescript
try {
  await uploadLogo(file);
} catch (error) {
  if (error instanceof ValidationError) {
    handleValidationError(error);
  } else if (error instanceof StorageError) {
    handleStorageError(error);
  } else {
    captureException(error);
    showGenericError();
  }
}
```

### 4. Following Best Practices

- Follow the [Next.js Best Practices](https://nextjs.org/docs/pages/building-your-application/routing/middleware#nextjs-middleware)
- Use React patterns effectively:
  - Custom hooks for reusable logic
  - Component composition over inheritance
  - Proper state management
- Implement proper TypeScript practices:
  ```typescript
  // Use specific types instead of 'any'
  interface Logo {
    _id: string;
    title: string;
    imageUrl: string;
    dimensions?: {
      width: number;
      height: number;
    };
  }
  ```

### 5. Considering Multiple Solutions

Before implementing a feature, consider:
- Performance implications
- Scalability requirements
- Maintenance overhead
- User experience impact

Example decision matrix:
```markdown
| Solution           | Pros                  | Cons                 | Decision |
|-------------------|----------------------|---------------------|----------|
| Client-side crop  | Immediate feedback   | Browser memory     | ✅ Choose |
| Server-side crop  | Lower client load    | Additional request | ❌ Reject |
```

### 6. Focused on Long-term Code Quality

- Write self-documenting code:
  ```typescript
  // Bad
  const h = 42;
  
  // Good
  const MAX_IMAGE_HEIGHT_PX = 42;
  ```
- Use meaningful variable names
- Add JSDoc comments for complex functions:
  ```typescript
  /**
   * Processes and optimizes an uploaded logo image
   * @param {File} file - The uploaded image file
   * @param {Object} options - Processing options
   * @param {number} options.maxWidth - Maximum width in pixels
   * @param {number} options.quality - JPEG quality (0-100)
   * @returns {Promise<ProcessedImage>} Processed image data
   * @throws {ValidationError} If file is invalid
   */
  async function processLogoImage(file: File, options: ProcessOptions): Promise<ProcessedImage>
  ```

## Code Review Guidelines

### Pull Request Checklist

1. Code Quality
   - [ ] Follows TypeScript best practices
   - [ ] Includes appropriate tests
   - [ ] Has meaningful comments
   - [ ] Handles errors appropriately

2. Documentation
   - [ ] Updates relevant documentation
   - [ ] Includes inline comments where needed
   - [ ] Updates changelog if needed

3. Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] E2E tests pass
   - [ ] Visual regression tests pass

4. Performance
   - [ ] No unnecessary re-renders
   - [ ] Efficient database queries
   - [ ] Proper image optimization

## Security Guidelines

### Role-Based Access Control

When contributing code that involves user actions or sensitive operations:

1. **API Routes**
   - Always protect routes with appropriate permissions
   - Use the `createPermissionMiddleware` helper
   - Example:
     ```typescript
     export const POST = createPermissionMiddleware('create:logo')(async (req) => {
       // Handle request
     });
     ```

2. **UI Components**
   - Use `PermissionGate` for protected content
   - Use `useRBAC` hook for conditional rendering
   - Example:
     ```typescript
     <PermissionGate permission="edit:logo">
       <EditButton />
     </PermissionGate>
     ```

3. **New Features**
   - Define required permissions in `roles.config.ts`
   - Document permission requirements
   - Add appropriate test coverage

See [RBAC Guide](./guides/RBAC.md) for detailed implementation guidelines.

## Getting Help

- Check existing documentation in `/docs`