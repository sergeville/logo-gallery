# Contributing to Logo Gallery

This guide will help you contribute to the Logo Gallery project effectively while maintaining high code quality standards.

## Development Guidelines

### 1. Easy to Follow with Clear Steps

- Break down complex tasks into smaller, manageable steps
- Use conventional commits format:
  ```
  <type>(<scope>): <description>

  [optional body]

  [optional footer(s)]
  ```
  Types: feat, fix, docs, style, refactor, test, chore
  Example:
  ```
  feat(upload): implement drag-and-drop logo upload
  
  - Add drag-and-drop zone component
  - Implement file validation
  - Add progress indicator
  
  Closes #123
  ```
- Document setup steps clearly:
  ```bash
  # Install dependencies
  pnpm install

  # Setup environment
  cp .env.example .env.local
  
  # Run development server
  pnpm dev
  
  # Run tests
  pnpm test
  ```

### 2. Code Quality Tools

- ESLint with strict configuration
- Prettier for consistent formatting
- Husky for pre-commit hooks
- lint-staged for staged files
- TypeScript in strict mode
- Example configuration:
  ```json
  {
    "scripts": {
      "lint": "eslint . --ext .ts,.tsx",
      "format": "prettier --write .",
      "type-check": "tsc --noEmit",
      "test": "jest",
      "prepare": "husky install"
    }
  }
  ```

### 3. Testing Standards

- Unit tests with Jest and React Testing Library
- Integration tests for API routes
- E2E tests with Playwright
- Visual regression tests
- Example test structure:
  ```typescript
  describe('LogoUploader', () => {
    it('validates file size and type', async () => {
      const file = new File(['logo'], 'logo.png', { type: 'image/png' });
      const { getByTestId, findByText } = render(<LogoUploader />);
      
      const dropzone = getByTestId('dropzone');
      await userEvent.upload(dropzone, file);
      
      expect(await findByText('File uploaded successfully')).toBeInTheDocument();
    });

    it('shows error for invalid file type', async () => {
      const file = new File(['invalid'], 'doc.pdf', { type: 'application/pdf' });
      const { getByTestId, findByText } = render(<LogoUploader />);
      
      const dropzone = getByTestId('dropzone');
      await userEvent.upload(dropzone, file);
      
      expect(await findByText('Invalid file type')).toBeInTheDocument();
    });
  });
  ```

### 4. Performance Monitoring

- Implement Lighthouse CI
- Monitor Core Web Vitals
- Use performance budgets
- Example performance budget:
  ```json
  {
    "performance-budget": {
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 300
        },
        {
          "resourceType": "total",
          "budget": 1000
        }
      ],
      "resourceCounts": [
        {
          "resourceType": "third-party",
          "budget": 10
        }
      ]
    }
  }
  ```

### 5. Backed by Concrete Examples

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

### 6. Technically Thorough

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

### 7. Following Best Practices

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

### 8. Considering Multiple Solutions

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

### 9. Focused on Long-term Code Quality

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

### Security Best Practices

1. **Input Validation**
   - Validate all user inputs
   - Use Zod schemas
   - Sanitize HTML content
   - Example:
     ```typescript
     const LogoSchema = z.object({
       title: z.string().min(1).max(100),
       description: z.string().max(500).optional(),
       file: z.instanceof(File).refine(
         (file) => ALLOWED_TYPES.includes(file.type),
         'Invalid file type'
       )
     });
     ```

2. **Authentication & Authorization**
   - Use NextAuth.js middleware
   - Implement RBAC
   - Rate limiting
   - Example:
     ```typescript
     export const config = {
       matcher: ['/api/upload', '/api/logos/:path*']
     };
     
     export function middleware(request: NextRequest) {
       const token = await getToken({ req: request });
       if (!token) {
         return new NextResponse(
           JSON.stringify({ error: 'Unauthorized' }),
           { status: 401 }
         );
       }
     }
     ```

3. **Data Protection**
   - Use environment variables
   - Implement proper CORS
   - Set security headers
   - Example:
     ```typescript
     // next.config.js
     const securityHeaders = [
       {
         key: 'X-DNS-Prefetch-Control',
         value: 'on'
       },
       {
         key: 'Strict-Transport-Security',
         value: 'max-age=63072000; includeSubDomains; preload'
       }
     ];
     ```

## Getting Help

- Check existing documentation in `/docs`