import { ObjectId } from 'mongodb';

export interface ValidationRule {
  field: string;
  description: string;
  validate: (value: any) => boolean;
  isRequired: boolean;
  errorMessage: string;
  autoFixable: boolean;
  severity: 'error' | 'warning';
}

// Enhanced User Validation Rules
export const userValidationRules: ValidationRule[] = [
  {
    field: 'email',
    description: 'Email format validation',
    validate: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    isRequired: true,
    errorMessage: 'Invalid email format',
    autoFixable: false,
    severity: 'error'
  },
  {
    field: 'username',
    description: 'Username format validation',
    validate: (username: string) => /^[a-zA-Z0-9_-]{3,20}$/.test(username),
    isRequired: true,
    errorMessage: 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens',
    autoFixable: false,
    severity: 'error'
  },
  {
    field: 'name',
    description: 'Name format validation',
    validate: (name: string) => /^[a-zA-Z\s-]{2,50}$/.test(name),
    isRequired: true,
    errorMessage: 'Name must be 2-50 characters and contain only letters, spaces, and hyphens',
    autoFixable: false,
    severity: 'error'
  },
  {
    field: 'profile.website',
    description: 'Website URL validation',
    validate: (url: string) => !url || /^https?:\/\/.+\..+/.test(url),
    isRequired: false,
    errorMessage: 'Invalid website URL format',
    autoFixable: true,
    severity: 'warning'
  },
  {
    field: 'profile.avatarUrl',
    description: 'Avatar URL validation',
    validate: (url: string) => !url || /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(url),
    isRequired: false,
    errorMessage: 'Invalid avatar URL format or unsupported file type',
    autoFixable: true,
    severity: 'warning'
  },
  {
    field: 'profile.bio',
    description: 'Bio length and content validation',
    validate: (bio: string) => !bio || (
      bio.length >= 10 && 
      bio.length <= 500 && 
      !/^\s+$/.test(bio) && // Not just whitespace
      !/[<>]/.test(bio) // No HTML tags
    ),
    isRequired: false,
    errorMessage: 'Bio must be between 10 and 500 characters and not contain HTML',
    autoFixable: false,
    severity: 'warning'
  },
  {
    field: 'profile.location',
    description: 'Location format validation',
    validate: (location: string) => !location || /^[a-zA-Z\s,.-]{2,100}$/.test(location),
    isRequired: false,
    errorMessage: 'Invalid location format',
    autoFixable: false,
    severity: 'warning'
  },
  {
    field: 'role',
    description: 'User role validation',
    validate: (role: string) => ['user', 'admin', 'moderator'].includes(role),
    isRequired: true,
    errorMessage: 'Invalid user role',
    autoFixable: true,
    severity: 'error'
  },
  {
    field: 'status',
    description: 'Account status validation',
    validate: (status: string) => ['active', 'inactive', 'suspended', 'pending'].includes(status),
    isRequired: true,
    errorMessage: 'Invalid account status',
    autoFixable: true,
    severity: 'error'
  },
  {
    field: 'lastLogin',
    description: 'Last login date validation',
    validate: (date: Date) => date instanceof Date && !isNaN(date.getTime()),
    isRequired: false,
    errorMessage: 'Invalid last login date',
    autoFixable: true,
    severity: 'warning'
  }
];

// Enhanced Logo Validation Rules
export const logoValidationRules: ValidationRule[] = [
  {
    field: 'name',
    description: 'Logo name validation',
    validate: (name: string) => /^[\w\s-]{3,100}$/.test(name),
    isRequired: true,
    errorMessage: 'Logo name must be 3-100 characters and contain only letters, numbers, spaces, and hyphens',
    autoFixable: false,
    severity: 'error'
  },
  {
    field: 'description',
    description: 'Description validation',
    validate: (desc: string) => !desc || (
      desc.length >= 10 && 
      desc.length <= 1000 && 
      !/^\s+$/.test(desc) && 
      !/[<>]/.test(desc)
    ),
    isRequired: false,
    errorMessage: 'Description must be between 10 and 1000 characters and not contain HTML',
    autoFixable: false,
    severity: 'warning'
  },
  {
    field: 'imageUrl',
    description: 'Image URL validation',
    validate: (url: string) => /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg)$/i.test(url),
    isRequired: true,
    errorMessage: 'Invalid image URL format or unsupported file type',
    autoFixable: true,
    severity: 'error'
  },
  {
    field: 'thumbnailUrl',
    description: 'Thumbnail URL validation',
    validate: (url: string) => /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg)$/i.test(url),
    isRequired: true,
    errorMessage: 'Invalid thumbnail URL format or unsupported file type',
    autoFixable: true,
    severity: 'error'
  },
  {
    field: 'category',
    description: 'Category validation',
    validate: (category: string) => [
      'Technology', 'Business', 'Creative', 'Education',
      'Entertainment', 'Food & Beverage', 'Health', 'Sports',
      'Uncategorized'
    ].includes(category),
    isRequired: true,
    errorMessage: 'Invalid category',
    autoFixable: true,
    severity: 'error'
  },
  {
    field: 'tags',
    description: 'Tags validation',
    validate: (tags: string[]) => {
      if (!Array.isArray(tags) || tags.length < 1 || tags.length > 10) return false;
      return tags.every(tag => /^[a-zA-Z0-9-]{2,20}$/.test(tag));
    },
    isRequired: true,
    errorMessage: 'Tags must be an array of 1-10 items, each 2-20 characters long',
    autoFixable: true,
    severity: 'warning'
  },
  {
    field: 'dimensions',
    description: 'Dimensions validation',
    validate: (dims: any) => {
      if (!dims || typeof dims !== 'object') return false;
      const { width, height } = dims;
      if (typeof width !== 'number' || typeof height !== 'number') return false;
      if (width < 50 || width > 5000 || height < 50 || height > 5000) return false;
      const ratio = width / height;
      return ratio >= 1/3 && ratio <= 3;
    },
    isRequired: true,
    errorMessage: 'Invalid dimensions (must be between 50x50 and 5000x5000 with aspect ratio between 1:3 and 3:1)',
    autoFixable: true,
    severity: 'error'
  },
  {
    field: 'fileSize',
    description: 'File size validation',
    validate: (size: number) => size > 0 && size <= 10 * 1024 * 1024, // Max 10MB
    isRequired: true,
    errorMessage: 'File size must be between 1B and 10MB',
    autoFixable: true,
    severity: 'error'
  },
  {
    field: 'fileType',
    description: 'File type validation',
    validate: (type: string) => ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(type.toLowerCase()),
    isRequired: true,
    errorMessage: 'Unsupported file type',
    autoFixable: true,
    severity: 'error'
  },
  {
    field: 'metadata',
    description: 'Metadata validation',
    validate: (metadata: any) => {
      if (!metadata || typeof metadata !== 'object') return false;
      return (
        metadata.version && 
        typeof metadata.version === 'string' &&
        ['active', 'archived', 'draft'].includes(metadata.status)
      );
    },
    isRequired: true,
    errorMessage: 'Invalid or missing metadata',
    autoFixable: true,
    severity: 'warning'
  },
  {
    field: 'colors',
    description: 'Color palette validation',
    validate: (colors: string[]) => {
      if (!Array.isArray(colors) || colors.length === 0) return false;
      return colors.every(color => /^#[0-9A-Fa-f]{6}$/.test(color));
    },
    isRequired: false,
    errorMessage: 'Invalid color format (must be hex colors)',
    autoFixable: true,
    severity: 'warning'
  }
];

// Relationship Validation Rules
export const relationshipValidationRules = {
  maxLogosPerUser: 100,
  minLogosPerUser: 0,
  maxLogoAgeInDays: 365,
  maxUsersWithoutLogos: 0.2, // 20% of users can have no logos
  maxLogosPerCategory: 0.4, // No category should have more than 40% of all logos
  minTagsPerLogo: 1,
  maxTagsPerLogo: 10,
  maxLogoSizeRatio: 3, // Width/height ratio should not exceed 3:1 or 1:3
  requiredCategories: ['Technology', 'Business', 'Creative'], // Must have at least one logo in each
  maxDuplicateNames: 0, // No duplicate names allowed within same owner
  maxInactiveUserLogos: 10, // Inactive users can't have more than 10 logos
  minActiveUsersRatio: 0.7, // At least 70% of users should be active
  maxOrphanedLogos: 0, // No logos without valid owners allowed
};

// Add security validation rules
export const securityValidationRules: ValidationRule[] = [
  {
    field: 'password',
    description: 'Password strength validation',
    validate: (password: string) => 
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password),
    isRequired: true,
    errorMessage: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
    autoFixable: false,
    severity: 'error'
  },
  {
    field: 'lastPasswordChange',
    description: 'Password age validation',
    validate: (date: Date) => {
      if (!(date instanceof Date)) return false;
      const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days
      return (new Date().getTime() - date.getTime()) <= maxAge;
    },
    isRequired: true,
    errorMessage: 'Password must be changed every 90 days',
    autoFixable: false,
    severity: 'warning'
  },
  {
    field: 'failedLoginAttempts',
    description: 'Failed login attempts validation',
    validate: (attempts: number) => attempts < 5,
    isRequired: true,
    errorMessage: 'Account locked due to too many failed login attempts',
    autoFixable: true,
    severity: 'error'
  }
];

// Add performance validation rules
export const performanceValidationRules: ValidationRule[] = [
  {
    field: 'imageSize',
    description: 'Image size optimization validation',
    validate: (size: number) => size <= 500 * 1024, // 500KB
    isRequired: true,
    errorMessage: 'Image size exceeds recommended limit of 500KB',
    autoFixable: true,
    severity: 'warning'
  },
  {
    field: 'cacheControl',
    description: 'Cache control validation',
    validate: (headers: any) => headers?.['cache-control']?.includes('max-age='),
    isRequired: true,
    errorMessage: 'Missing cache control headers',
    autoFixable: true,
    severity: 'warning'
  }
];

// Add data quality validation rules
export const dataQualityValidationRules: ValidationRule[] = [
  {
    field: 'description',
    description: 'Description quality validation',
    validate: (desc: string) => {
      if (!desc) return true;
      const words = desc.split(/\s+/).filter(w => w.length > 0);
      return words.length >= 10 && // At least 10 words
             words.every(w => w.length <= 30) && // No extremely long words
             !/(.)\1{4,}/.test(desc); // No character repeated more than 4 times
    },
    isRequired: false,
    errorMessage: 'Description quality does not meet standards',
    autoFixable: false,
    severity: 'warning'
  },
  {
    field: 'tags',
    description: 'Tag quality validation',
    validate: (tags: string[]) => {
      if (!Array.isArray(tags)) return false;
      const commonTags = new Set(['logo', 'brand', 'design', 'art']);
      return tags.length >= 3 && // At least 3 tags
             tags.some(tag => commonTags.has(tag.toLowerCase())); // At least one common tag
    },
    isRequired: true,
    errorMessage: 'Tags should include at least 3 tags with one common category',
    autoFixable: true,
    severity: 'warning'
  }
];

// Add accessibility validation rules
export const accessibilityValidationRules: ValidationRule[] = [
  {
    field: 'altText',
    description: 'Alt text validation',
    validate: (alt: string) => {
      if (!alt) return false;
      return alt.length >= 5 && alt.length <= 125 && // Length between 5-125 chars
             !alt.toLowerCase().includes('image of') && // Avoid redundant phrases
             !/^\s*$/.test(alt); // Not just whitespace
    },
    isRequired: true,
    errorMessage: 'Invalid or missing alt text',
    autoFixable: false,
    severity: 'error'
  },
  {
    field: 'contrast',
    description: 'Color contrast validation',
    validate: (contrast: { background: string; foreground: string }) => {
      // Simplified WCAG contrast calculation
      const toRGB = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
      };
      
      const getLuminance = ([r, g, b]: number[]) => {
        const [rs, gs, bs] = [r / 255, g / 255, b / 255];
        const [rl, gl, bl] = [
          rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4),
          gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4),
          bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4)
        ];
        return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
      };

      const bg = getLuminance(toRGB(contrast.background));
      const fg = getLuminance(toRGB(contrast.foreground));
      const ratio = (Math.max(bg, fg) + 0.05) / (Math.min(bg, fg) + 0.05);
      
      return ratio >= 4.5; // WCAG AA standard
    },
    isRequired: true,
    errorMessage: 'Insufficient color contrast ratio',
    autoFixable: true,
    severity: 'error'
  }
];

// Enhanced relationship validation rules
export const enhancedRelationshipRules = {
  ...relationshipValidationRules,
  maxCollaboratorsPerLogo: 5,
  maxLogoVersions: 10,
  maxInactiveTime: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  requiredMetadataFields: ['creator', 'lastModified', 'version'],
  versioningRules: {
    requireSemanticVersioning: true,
    maxMajorVersion: 10,
    requireChangeLog: true
  },
  collaborationRules: {
    requireOwnerApproval: true,
    maxPendingInvites: 3,
    minCollaboratorRole: 'editor'
  },
  qualityThresholds: {
    minResolution: { width: 100, height: 100 },
    maxResolution: { width: 4000, height: 4000 },
    minFileSize: 1024, // 1KB
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedAspectRatios: [1, 16/9, 4/3, 3/2],
    allowedFileTypes: ['svg', 'png', 'jpg', 'webp'],
    preferredFormat: 'svg'
  }
};

// Helper Functions
export function validateField(value: any, rule: ValidationRule): boolean {
  if (!rule.isRequired && (value === undefined || value === null || value === '')) {
    return true;
  }
  return rule.validate(value);
}

export function getFieldValue(obj: any, field: string): any {
  return field.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

export function validateObjectId(id: any): boolean {
  if (!id) return false;
  try {
    return ObjectId.isValid(id);
  } catch {
    return false;
  }
}

export function validateDateRange(date: Date, maxAgeInDays: number = 365): boolean {
  if (!(date instanceof Date) || isNaN(date.getTime())) return false;
  const now = new Date();
  const minDate = new Date(now.getTime() - maxAgeInDays * 24 * 60 * 60 * 1000);
  return date >= minDate && date <= now;
} 