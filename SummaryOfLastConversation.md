### Authentication Debugging and Password Case Sensitivity

#### Issue: Password Authentication Failing
- **Symptom**: User authentication failing despite correct credentials
- **Root Cause**: Password case sensitivity mismatch between stored hash and login attempt
- **Debug Process**:
  1. Added detailed logging in NextAuth options:
     ```typescript
     console.log('🔍 [NextAuth] User lookup result:', { 
       found: !!user, 
       email: credentials.email,
       passwordLength: user?.password?.length 
     });
     
     console.log('🔐 [NextAuth] Password comparison:', { 
       providedPassword: credentials.password,
       storedHash: user.password,
     });
     ```
  2. Discovered password case mismatch: "password123" vs "Password123"

#### Solution:
1. Generated new bcrypt hash for exact password:
   ```javascript
   const bcrypt = require('bcrypt');
   const hash = await bcrypt.hash('Password123', 10);
   ```
2. Updated user record with correct hash:
   ```javascript
   db.users.updateOne(
     { email: "test2@example.com" },
     { $set: { password: "$NEW_HASH" }}
   );
   ```

#### Key Learnings:
- Always verify exact password case when debugging auth issues
- Use detailed logging to track auth flow
- Store password hashes with exact case sensitivity
- Test auth with exact credentials used in hash generation 

### Logo Transformation Error Handling

#### Issue: Failed to Load Logos
- **Symptom**: Error "Cannot read properties of undefined (reading 'toString')"
- **Root Cause**: Logo transformation function not handling missing or undefined values
- **Impact**: Logos failing to load when certain fields are missing from database records

#### Solution:
Updated the `transformLogo` function to safely handle missing or undefined values:
```typescript
export function transformLogo(dbLogo: WithId<Logo>): ClientLogo {
  return {
    id: dbLogo._id?.toString() || new ObjectId().toString(),
    name: dbLogo.name || 'Untitled Logo',
    description: dbLogo.description || '',
    imageUrl: dbLogo.imageUrl || '',
    thumbnailUrl: dbLogo.thumbnailUrl || dbLogo.imageUrl || '',
    // ... other fields with safe fallbacks
  };
}
```

#### Key Changes:
1. Added null checks with optional chaining (`?.`)
2. Provided default values for all fields
3. Added type checking for numeric values
4. Ensured array fields are properly initialized
5. Added fallback dates for timestamp fields

#### Benefits:
- Prevents runtime errors from missing data
- Provides meaningful defaults for missing fields
- Maintains data consistency in the UI
- Improves error resilience 

### Static File Serving Configuration

#### Issue: Blurry/Missing Logo Images
- **Symptom**: 404 errors when trying to load images from `/uploads` directory
- **Root Cause**: Incorrect rewrite rule in Next.js configuration attempting to serve files from `/public/uploads`
- **Impact**: Images not loading properly, showing as blurry placeholders

#### Solution:
Removed unnecessary rewrite rule from `next.config.js` as Next.js automatically serves files from the `public` directory:
```javascript
const nextConfig = {
  // ... other config
  
  // Files in public directory are served at the root path
  // No need for rewrites or special configuration
  assetPrefix: '',
}
```

#### Key Points:
1. Next.js automatically serves static files from the `public` directory at the root URL
2. No rewrite rules needed for public files
3. Files in `public/uploads` are directly accessible at `/uploads`
4. Keep the directory structure clean:
   ```
   public/
     uploads/
       image1.jpg
       image2.png
   ```

#### Benefits:
- Proper image loading and display
- Better performance without unnecessary rewrites
- Simplified configuration
- Standard Next.js static file serving 