# Logo Ownership Model

## Core Concept

In the Logo Gallery application, the relationship between users and logos is established through the `ownerId` field. This document outlines the ownership model and its implications.

## Key Fields

- `logo.ownerId`: The ID of the user who owns/created the logo
- `session.user.id`: The ID of the currently signed-in user
- `logo.ownerName`: The display name of the logo owner

## Implementation Details

### Database Schema
```typescript
interface Logo {
  // ... other fields
  ownerId: string;    // References User.id
  ownerName: string;  // Display name of the owner
}

interface User {
  id: string;
  name: string;
  // ... other fields
}
```

### Testing and Mock Data

When creating test data, it's crucial to maintain the correct relationship between users and their logos:

```typescript
// Example from test-utils.tsx
const testUser = {
  id: 'test-user-id',
  name: 'Test User'
};

const testLogo = {
  ownerId: 'test-user-id',  // References the test user's ID
  ownerName: 'Test User'
};
```

## Usage Examples

### Checking Ownership
```typescript
// Example of ownership check
const canEdit = logo.ownerId === session.user.id;
```

### Filtering User's Logos
```typescript
// Example of filtering logos by owner
const userLogos = logos.filter(logo => logo.ownerId === session.user.id);
```

## Security Implications

1. Only the owner of a logo should be able to:
   - Edit the logo
   - Delete the logo
   - Update logo metadata

2. Admin users may have additional privileges to:
   - Change logo ownership
   - Moderate all logos regardless of ownership

## Testing Considerations

When writing tests:
1. Always verify ownership checks
2. Test with both matching and non-matching user IDs
3. Include admin role scenarios
4. Verify ownership transfer functionality

## Common Pitfalls

1. Don't confuse `logo.id` with `logo.ownerId`
2. Always verify ownership before allowing modifications
3. Remember that `ownerName` is for display only; use `ownerId` for logic
4. In test data, maintain consistent relationships between users and their logos 