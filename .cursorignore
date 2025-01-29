# Cursor AI Custom Instructions

<custom_instructions>
Always respond in a way that follows these standards:

1. Code Organization:
   - Use `@/` path alias for all imports from project root
   - Follow directory structure:
     ```
     app/
     ├── lib/        # Utilities, database connections
     ├── models/     # Database models
     ├── components/ # React components
     ├── api/        # API routes
     └── tests/      # Test files
     ```

2. Import Standards:
   - Use named imports for clarity
   - Correct: `import { connectToDatabase } from '@/lib/db'`
   - Incorrect: `import db from '@/lib/db'`
   - Group imports: React/Next.js, external packages, internal modules

3. Database Practices:
   - Use named exports for database functions
   - Handle connections with proper error handling
   - Follow MongoDB best practices:
     ```typescript
     try {
       await connectToDatabase()
       // DB operations
     } catch (error) {
       console.error('DB Error:', error)
       throw error
     }
     ```

4. API Route Standards:
   - Place in `app/api/` directory
   - Use consistent error handling pattern:
     ```typescript
     try {
       // Logic
     } catch (error) {
       console.error('Error:', error)
       return NextResponse.json(
         { error: 'User-friendly message' },
         { status: appropriate_code }
       )
     }
     ```

5. Authentication:
   - Use NextAuth.js consistently
   - Protect routes properly
   - Check admin status:
     ```typescript
     const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
     ```

6. Error Handling:
   - Use try/catch blocks
   - Log errors properly
   - Return appropriate status codes
   - Provide user-friendly messages
   - Never expose sensitive information

7. TypeScript Usage:
   - Enable strict mode
   - Define interfaces/types
   - Use proper type imports
   - Avoid 'any' type
   - Document complex types

8. Testing Standards:
   - Write tests for all features
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)
   - Mock external dependencies
   - Test error cases

9. Component Guidelines:
   - Use TypeScript interfaces for props
   - Implement error boundaries
   - Follow React best practices
   - Use proper state management
   - Document complex components

10. Performance:
    - Optimize database queries
    - Use proper caching
    - Implement lazy loading
    - Optimize images
    - Monitor performance metrics

11. Security:
    - Validate all inputs
    - Sanitize data
    - Use environment variables
    - Implement rate limiting
    - Follow OWASP guidelines

12. Code Style:
    - Use ESLint rules
    - Follow Prettier config
    - Write clear comments
    - Use meaningful names
    - Keep functions small

13. Git Practices:
    - Write clear commit messages
    - Use feature branches
    - Review code before merging
    - Keep PRs focused
    - Follow conventional commits

14. Documentation:
    - Document setup steps
    - Maintain README
    - Add JSDoc comments
    - Document API endpoints
    - Keep docs updated

15. Environment:
    - Use `.env.local` for development
    - Document all env variables
    - Use appropriate naming:
      - `NEXT_PUBLIC_*` for client
      - Regular names for server

16. Maintenance:
    - Regular dependency updates
    - Code cleanup
    - Performance monitoring
    - Error tracking
    - Regular backups

17. Task Completion:
    - Commit all changes after completing each task
    - Use conventional commit messages:
      ```
      type(scope): description

      [optional body]
      [optional footer]
      ```
    - Types: feat, fix, docs, style, refactor, test, chore
    - Scope should match the task area
    - Description should be clear and concise
    - Include task reference in body if applicable
    - Example commits:
      ```
      feat(image): add CDN integration with Cloudflare
      fix(cache): resolve memory leak in cache service
      docs(api): update endpoint documentation
      test(visual): add Percy.io integration
      ```
</custom_instructions> 