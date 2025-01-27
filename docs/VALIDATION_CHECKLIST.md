# Validation System Documentation

## Overview

The validation system provides a unified way to validate user and logo data across the application. It uses a consistent type system and provides detailed error reporting.

## Types

### ValidationResult
```typescript
interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  fixes: FixSuggestion[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

interface FixSuggestion {
  field: string;
  action: string;
  value?: any;
}
```

## Validation Functions

### User Validation
- `validateUser(user: Partial<ClientUser>): ValidationResult`
  - Validates email format
  - Validates required name field
  - Returns validation result with errors, warnings, and fixes

### Logo Validation
- `validateLogo(logo: Partial<ClientLogo>): ValidationResult`
  - Validates image URL format
  - Validates required description field
  - Validates required name field
  - Returns validation result with errors, warnings, and fixes

## Error Codes

### User Validation Codes
- `INVALID_EMAIL_FORMAT`: Invalid email address format
- `MISSING_NAME`: Required name field is missing
- `INVALID_PASSWORD`: Password does not meet requirements

### Logo Validation Codes
- `INVALID_URL_FORMAT`: Invalid image URL format
- `MISSING_DESCRIPTION`: Required description field is missing
- `MISSING_NAME`: Required name field is missing

## Usage Examples

### Validating a User
```typescript
const user = {
  email: 'test@example.com',
  name: 'Test User'
};

const result = validateUser(user);
if (result.errors.length > 0) {
  console.error('Validation failed:', result.errors);
}
```

### Validating a Logo
```typescript
const logo = {
  name: 'Test Logo',
  imageUrl: 'https://example.com/logo.png',
  description: 'A test logo'
};

const result = validateLogo(logo);
if (result.errors.length > 0) {
  console.error('Validation failed:', result.errors);
}
```

## Testing

The validation system includes comprehensive tests:
- Unit tests for individual validation functions
- Integration tests with the database
- Test helpers for validation in test data generation

## Recent Updates

- Consolidated validation types between app/lib/validation and scripts/seed/validation
- Added proper error codes and messages
- Improved type safety throughout the validation system
- Enhanced test coverage for validation functions
- Added support for warning messages and fix suggestions

# Database and Type System Validation Checklist

## When Making Changes to Database Structure

### 1. Mongoose Models (`src/lib/models/`)
- [ ] Update model interfaces (IUser, ILogo, etc.)
- [ ] Update Mongoose schemas to match interfaces
- [ ] Ensure all required fields are properly marked
- [ ] Verify index definitions match query patterns
- [ ] Check relationships between models (refs)
- [ ] Validate timestamps configuration

### 2. TypeScript Types (`scripts/test-data/types/`)
- [ ] Update type definitions to match model interfaces
- [ ] Ensure consistent naming conventions
- [ ] Verify field types match Mongoose schema types
- [ ] Check optional vs required fields consistency

### 3. Test Data Generators (`scripts/test-data/generators/`)
- [ ] Update generator functions to match new types
- [ ] Verify ObjectId usage for IDs and references
- [ ] Check data ranges and constraints
- [ ] Update specific test cases
- [ ] Verify relationship integrity in generated data

### 4. Database Population (`scripts/test-data/populate-db.ts`)
- [ ] Update collection names if changed
- [ ] Verify index creation matches model definitions
- [ ] Check insertion order for relationships
- [ ] Verify data cleanup procedures
- [ ] Test population script end-to-end

### 5. Environment Configuration
- [ ] Update environment variables if needed
- [ ] Check database names across environments
- [ ] Verify connection settings
- [ ] Test configuration loading

## Cross-Cutting Concerns

### Type Consistency
- [ ] Check for consistent ID types (ObjectId)
- [ ] Verify Date handling
- [ ] Check array types
- [ ] Verify optional vs required fields
- [ ] Ensure consistent use of interfaces vs types

### Database Operations
- [ ] Verify indexes support query patterns
- [ ] Check for proper error handling
- [ ] Validate connection management
- [ ] Test transaction requirements
- [ ] Verify cascade operations

### Testing
- [ ] Update test fixtures
- [ ] Check mock data consistency
- [ ] Verify test database setup
- [ ] Test data generation
- [ ] Validate cleanup procedures

## File Locations to Check

```
src/lib/models/           # Mongoose models and interfaces
scripts/test-data/types/  # TypeScript type definitions
scripts/test-data/        # Test data generation
docs/                     # Documentation updates
```

## Common Issues to Watch For

1. Type mismatches between Mongoose and TypeScript
2. Inconsistent ID handling (string vs ObjectId)
3. Missing or incorrect indexes
4. Incomplete test data generation
5. Broken relationships between collections
6. Environment-specific configuration issues

## Before Committing Changes

1. Run the test data population script
2. Verify database structure
3. Run type checking
4. Test affected queries
5. Update documentation

## Documentation Updates

- [ ] Update API documentation if endpoints affected
- [ ] Update schema documentation
- [ ] Update test data documentation
- [ ] Update environment setup instructions
- [ ] Add migration notes if needed

Remember to run through this checklist whenever making changes to:
- Database schema
- Type definitions
- Test data generation
- Database operations
- Model relationships 