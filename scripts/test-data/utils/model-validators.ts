import { IUser } from '../../../src/lib/models/User';
import { ILogo } from '../../../src/lib/models/Logo';
import {
  ValidationResult,
  createValidationResult,
  addError,
  addWarning,
  validateObjectId,
  validateEmail,
  validateUrl,
  validateDateRange,
  validateRequiredFields,
  validateArrayMinLength,
  generateFixSuggestions,
  FixSuggestion
} from './validation-utils';

export function validateUser(user: any): ValidationResult {
  const result = createValidationResult();

  // Check if user exists
  if (!user) {
    addError(result, 'User object is required', { field: 'user' }, [{
      description: 'User object is missing',
      action: 'Provide a valid user object with required fields',
      example: '{ email: "user@example.com", username: "user123", name: "John Doe" }',
      autoFixable: false
    }]);
    return result;
  }

  // Required fields validation
  const requiredFields = ['email', 'username', 'name', 'password'];
  const missingFields = validateRequiredFields(user, requiredFields);
  if (missingFields.length > 0) {
    missingFields.forEach(field => {
      addError(result, `${field} is required`, { field }, [{
        description: `Missing ${field}`,
        action: `Add required ${field} field`,
        example: field === 'email' ? 'user@example.com' : `${field} value`,
        autoFixable: false
      }]);
    });
  }

  // Email validation
  if (user.email && !validateEmail(user.email)) {
    addError(result, 'Invalid email format', { field: 'email' }, [{
      description: 'Invalid email format',
      action: 'Update email to match standard format',
      example: 'user@example.com',
      autoFixable: false
    }]);
  }

  // Username validation
  if (user.username && (user.username.length < 3 || user.username.length > 30)) {
    addError(result, 'Invalid username length', { field: 'username' }, [{
      description: 'Username length out of bounds',
      action: 'Update username to be between 3-30 characters',
      example: 'username123',
      autoFixable: false
    }]);
  }

  // Password validation
  if (user.password && user.password.length < 8) {
    addError(result, 'Password too short', { field: 'password' }, [{
      description: 'Password length insufficient',
      action: 'Update password to be at least 8 characters',
      example: 'password with 8+ chars',
      autoFixable: false
    }]);
  }

  // Profile validation
  if (user.profile) {
    if (user.profile.website && !validateUrl(user.profile.website)) {
      addError(result, 'Invalid website URL', { field: 'profile.website' }, [{
        description: 'Website URL format invalid',
        action: 'Update website URL to include protocol',
        example: 'https://example.com',
        autoFixable: true
      }]);
    }

    if (user.profile.bio && user.profile.bio.length > 500) {
      addError(result, 'Bio too long', { field: 'profile.bio' }, [{
        description: 'Bio exceeds maximum length',
        action: 'Truncate bio to 500 characters',
        example: 'Bio text (max 500 chars)',
        autoFixable: true
      }]);
    }

    if (user.profile.avatarUrl && !validateUrl(user.profile.avatarUrl)) {
      addError(result, 'Invalid avatar URL', { field: 'profile.avatarUrl' }, [{
        description: 'Avatar URL format invalid',
        action: 'Update avatar URL to include protocol',
        example: 'https://example.com/avatar.jpg',
        autoFixable: true
      }]);
    }
  }

  return result;
}

export function validateLogo(logo: any, userIds: string[]): ValidationResult {
  const result = createValidationResult();

  // Logo validation
  if (!logo) {
    addError(result, 'Logo object is required', { field: 'logo' }, [{
      description: 'Logo object is missing',
      action: 'Provide a valid logo object',
      example: '{ name: "logo", imageUrl: "..." }',
      autoFixable: false
    }]);
    return result;
  }

  // Required fields validation
  const requiredFields = ['name', 'imageUrl', 'thumbnailUrl', 'dimensions', 'fileType'];
  const missingFields = validateRequiredFields(logo, requiredFields);
  if (missingFields.length > 0) {
    missingFields.forEach(field => {
      addError(result, `${field} is required`, { field }, [{
        description: `Missing ${field}`,
        action: `Add required ${field} field`,
        example: field === 'imageUrl' ? 'https://example.com/logo.png' : `${field} value`,
        autoFixable: false
      }]);
    });
  }

  // URL validations
  if (logo.imageUrl && !validateUrl(logo.imageUrl)) {
    addError(result, 'Invalid image URL', { field: 'imageUrl' }, [{
      description: 'Image URL format invalid',
      action: 'Update image URL to include protocol',
      example: 'https://example.com/logo.png',
      autoFixable: true
    }]);
  }

  if (logo.thumbnailUrl && !validateUrl(logo.thumbnailUrl)) {
    addError(result, 'Invalid thumbnail URL', { field: 'thumbnailUrl' }, [{
      description: 'Thumbnail URL format invalid',
      action: 'Update thumbnail URL to include protocol',
      example: 'https://example.com/thumbnail.jpg',
      autoFixable: true
    }]);
  }

  // Dimensions validation
  if (logo.dimensions) {
    if (logo.dimensions.width <= 0) {
      addError(result, 'Invalid width', { field: 'dimensions.width' }, [{
        description: 'Width must be positive',
        action: 'Set width to a positive number',
        example: '100',
        autoFixable: true
      }]);
    }
    if (logo.dimensions.height <= 0) {
      addError(result, 'Invalid height', { field: 'dimensions.height' }, [{
        description: 'Height must be positive',
        action: 'Set height to a positive number',
        example: '100',
        autoFixable: true
      }]);
    }
  }

  // File type validation
  if (logo.fileType && !['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(logo.fileType.toLowerCase())) {
    addError(result, 'Invalid file type', { field: 'fileType' }, [{
      description: 'Unsupported file type',
      action: 'Change file type to supported format',
      example: 'png, jpg, jpeg, gif, svg',
      autoFixable: true
    }]);
  }

  // Colors validation
  if (logo.colors && (!Array.isArray(logo.colors) || logo.colors.some((color: string) => !/^#[0-9A-F]{6}$/i.test(color)))) {
    addError(result, 'Invalid colors', { field: 'colors' }, [{
      description: 'Invalid color format',
      action: 'Convert colors to 6-digit hex format',
      example: '#RRGGBB',
      autoFixable: true
    }]);
  }

  // Validate ObjectId
  if (!validateObjectId(logo._id)) {
    addError(result, 'Invalid logo _id', { _id: logo._id }, [{
      description: 'Logo ID is not a valid MongoDB ObjectId',
      action: 'Ensure the _id is a valid 24-character hex string',
      example: '507f1f77bcf86cd799439011',
      autoFixable: false
    }]);
  }

  // Validate owner reference
  if (!userIds.includes(logo.ownerId.toString())) {
    addError(result, 'Invalid owner reference', { ownerId: logo.ownerId }, [{
      description: 'Logo owner ID does not reference an existing user',
      action: 'Update the ownerId to reference a valid user',
      example: userIds[0],
      autoFixable: false
    }]);
  }

  // Validate dates
  if (!validateDateRange(logo.createdAt)) {
    addError(result, 'Invalid createdAt date', { createdAt: logo.createdAt }, [{
      description: 'Creation date is outside allowed range',
      action: 'Update the date to be within the last year',
      example: new Date().toISOString(),
      autoFixable: true
    }]);
  }
  if (!validateDateRange(logo.updatedAt)) {
    addError(result, 'Invalid updatedAt date', { updatedAt: logo.updatedAt }, [{
      description: 'Update date is outside allowed range',
      action: 'Update the date to be within the last year',
      example: new Date().toISOString(),
      autoFixable: true
    }]);
  }

  // Validate dimensions
  if (!logo.dimensions || typeof logo.dimensions !== 'object') {
    addError(result, 'Missing or invalid dimensions', { field: 'dimensions' }, [{
      description: 'Logo dimensions are missing or invalid',
      action: 'Add valid width and height dimensions',
      example: '{ width: 800, height: 600 }',
      autoFixable: false
    }]);
  } else {
    if (typeof logo.dimensions.width !== 'number' || logo.dimensions.width <= 0) {
      addError(result, 'Invalid width in dimensions', { width: logo.dimensions.width }, [{
        description: 'Logo width is invalid',
        action: 'Set a positive numeric width value',
        example: '{ width: 800 }',
        autoFixable: false
      }]);
    }
    if (typeof logo.dimensions.height !== 'number' || logo.dimensions.height <= 0) {
      addError(result, 'Invalid height in dimensions', { height: logo.dimensions.height }, [{
        description: 'Logo height is invalid',
        action: 'Set a positive numeric height value',
        example: '{ height: 600 }',
        autoFixable: false
      }]);
    }
  }

  // Validate tags
  if (!validateArrayMinLength(logo.tags, 1)) {
    addWarning(result, 'Logo should have at least one tag', { field: 'tags' }, [{
      description: 'Logo has no tags',
      action: 'Add at least one relevant tag',
      example: '{ tags: ["brand", "technology"] }',
      autoFixable: false
    }]);
  }

  // Validate file size
  if (typeof logo.fileSize !== 'number' || logo.fileSize <= 0) {
    addError(result, 'Invalid file size', { fileSize: logo.fileSize }, [{
      description: 'Logo file size is invalid',
      action: 'Set a positive numeric file size in bytes',
      example: '{ fileSize: 1024 }',
      autoFixable: false
    }]);
  }

  return result;
}

export function validateRelationships(users: any[], logos: any[]): ValidationResult {
  const result = createValidationResult();

  // Get all user IDs
  const userIds = new Set(users.map(u => u._id.toString()));

  // Check for orphaned logos
  const orphanedLogos = logos.filter(logo => !userIds.has(logo.ownerId.toString()));
  if (orphanedLogos.length > 0) {
    addError(result, 'Found orphaned logos', {
      count: orphanedLogos.length,
      logos: orphanedLogos.map(l => ({ id: l._id, ownerId: l.ownerId })),
    }, [{
      description: 'Some logos reference non-existent users',
      action: 'Either create the missing users or reassign logos to existing users',
      example: `Update logo.ownerId to one of: ${Array.from(userIds).slice(0, 3).join(', ')}...`,
      autoFixable: false
    }]);
  }

  // Check user distribution
  const logosByUser = new Map<string, number>();
  logos.forEach(logo => {
    const ownerId = logo.ownerId.toString();
    logosByUser.set(ownerId, (logosByUser.get(ownerId) || 0) + 1);
  });

  // Check for users without logos
  const usersWithoutLogos = users.filter(u => !logosByUser.has(u._id.toString()));
  if (usersWithoutLogos.length > 0) {
    addWarning(result, 'Found users without logos', {
      count: usersWithoutLogos.length,
      users: usersWithoutLogos.map(u => ({ id: u._id, username: u.username })),
    }, [{
      description: 'Some users have no associated logos',
      action: 'Consider adding logos for these users or marking them as inactive',
      example: 'Create sample logos or update user status',
      autoFixable: false
    }]);
  }

  // Check for uneven distribution
  const avgLogosPerUser = logos.length / users.length;
  const threshold = avgLogosPerUser * 2;
  logosByUser.forEach((count, userId) => {
    if (count > threshold) {
      addWarning(result, `User has unusually high number of logos`, {
        userId,
        count,
        average: avgLogosPerUser,
      }, [{
        description: 'User has significantly more logos than average',
        action: 'Review if this is intentional or redistribute logos',
        example: `Consider limiting to ${Math.ceil(threshold)} logos or distributing excess to other users`,
        autoFixable: false
      }]);
    }
  });

  // Check logo categories distribution
  const categoryCounts = new Map<string, number>();
  logos.forEach(logo => {
    const category = logo.category;
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
  });

  const totalLogos = logos.length;
  categoryCounts.forEach((count, category) => {
    const percentage = (count / totalLogos) * 100;
    if (percentage > 40) {
      addWarning(result, 'Category overrepresentation', {
        category,
        count,
        percentage: percentage.toFixed(1) + '%'
      }, [{
        description: `Category "${category}" has too many logos (${percentage.toFixed(1)}%)`,
        action: 'Redistribute logos across other categories',
        example: 'Move some logos to related categories to maintain better distribution',
        autoFixable: false
      }]);
    }
  });

  // Check for duplicate logo names within same owner
  const duplicateNames = new Map<string, Set<string>>();
  logos.forEach(logo => {
    const key = `${logo.ownerId}_${logo.name}`;
    if (!duplicateNames.has(key)) {
      duplicateNames.set(key, new Set());
    }
    duplicateNames.get(key)?.add(logo._id.toString());
  });

  duplicateNames.forEach((ids, key) => {
    if (ids.size > 1) {
      const [ownerId, name] = key.split('_');
      addWarning(result, 'Duplicate logo names for same owner', {
        ownerId,
        name,
        logoIds: Array.from(ids)
      }, [{
        description: 'Multiple logos with same name under one user',
        action: 'Make logo names unique per user by adding distinguishing suffixes',
        example: `Rename to "${name}-1", "${name}-2", etc.`,
        autoFixable: true
      }]);
    }
  });

  return result;
} 