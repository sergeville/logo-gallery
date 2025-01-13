import { ObjectId } from 'mongodb';

export interface AutoFixResult {
  field: string;
  fixApplied: string;
  oldValue: any;
  newValue: any;
  description: string;
  action: string;
}

export function generateAutoFixes(document: any, errorMessage: string, details?: any): AutoFixResult[] {
  const fixes: AutoFixResult[] = [];

  switch (errorMessage) {
    case 'Invalid createdAt date':
    case 'Invalid updatedAt date': {
      const dateField = errorMessage.includes('created') ? 'createdAt' : 'updatedAt';
      fixes.push({
        field: dateField,
        oldValue: document[dateField],
        newValue: new Date(),
        fixApplied: 'Set to current date',
        description: `Update ${dateField} to current date`,
        action: `Set ${dateField} to current timestamp`
      });
      break;
    }

    case 'Invalid dimensions': {
      if (details?.width <= 0 || details?.height <= 0) {
        fixes.push({
          field: 'dimensions',
          oldValue: document.dimensions,
          newValue: {
            width: Math.max(50, details?.width || 50),
            height: Math.max(50, details?.height || 50)
          },
          fixApplied: 'Set minimum dimensions to 50x50',
          description: 'Dimensions must be at least 50x50',
          action: 'Adjust dimensions to meet minimum requirements'
        });
      }
      break;
    }

    case 'Invalid file size': {
      if (details?.fileSize <= 0) {
        fixes.push({
          field: 'fileSize',
          oldValue: document.fileSize,
          newValue: 1024, // Default to 1KB
          fixApplied: 'Set default file size',
          description: 'File size must be a positive number',
          action: 'Set file size to default value (1KB)'
        });
      }
      break;
    }

    case 'Duplicate logo names': {
      if (details?.name) {
        fixes.push({
          field: 'name',
          oldValue: document.name,
          newValue: `${document.name}-${new ObjectId().toString().slice(0, 4)}`,
          fixApplied: 'Added unique suffix to name',
          description: 'Logo name must be unique',
          action: 'Add unique identifier to name'
        });
      }
      break;
    }

    case 'Invalid tags array': {
      if (!Array.isArray(document.tags) || document.tags.length === 0) {
        fixes.push({
          field: 'tags',
          oldValue: document.tags,
          newValue: ['uncategorized'],
          fixApplied: 'Added default tag',
          description: 'At least one tag is required',
          action: 'Add default uncategorized tag'
        });
      }
      break;
    }

    case 'Invalid category': {
      const validCategories = [
        'Technology', 'Business', 'Creative', 'Education',
        'Entertainment', 'Food & Beverage', 'Health', 'Sports'
      ];
      if (!validCategories.includes(document.category)) {
        fixes.push({
          field: 'category',
          oldValue: document.category,
          newValue: 'Uncategorized',
          fixApplied: 'Set to default category',
          description: 'Category must be from predefined list',
          action: 'Set to default Uncategorized category'
        });
      }
      break;
    }

    case 'Invalid URL format': {
      const urlField = details?.field || 'url';
      const url = document[urlField];
      if (typeof url === 'string' && !url.startsWith('http')) {
        fixes.push({
          field: urlField,
          oldValue: url,
          newValue: `https://${url.replace(/^[\/\\]+/, '')}`,
          fixApplied: 'Added https:// prefix',
          description: 'URL must start with http:// or https://',
          action: 'Add https:// prefix to URL'
        });
      }
      break;
    }

    case 'Invalid aspect ratio': {
      const { width, height } = document.dimensions || {};
      if (width && height) {
        const ratio = width / height;
        if (ratio > 3) {
          fixes.push({
            field: 'dimensions',
            oldValue: document.dimensions,
            newValue: { width: height * 3, height },
            fixApplied: 'Adjusted width to maintain max 3:1 ratio',
            description: 'Aspect ratio exceeds maximum of 3:1',
            action: 'Adjust width to maintain maximum aspect ratio'
          });
        } else if (ratio < 1/3) {
          fixes.push({
            field: 'dimensions',
            oldValue: document.dimensions,
            newValue: { width, height: width * 3 },
            fixApplied: 'Adjusted height to maintain max 1:3 ratio',
            description: 'Aspect ratio exceeds maximum of 1:3',
            action: 'Adjust height to maintain maximum aspect ratio'
          });
        }
      }
      break;
    }

    case 'Invalid file type': {
      const validTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
      if (!validTypes.includes(document.fileType?.toLowerCase())) {
        fixes.push({
          field: 'fileType',
          oldValue: document.fileType,
          newValue: 'png',
          fixApplied: 'Set to default file type (png)',
          description: 'File type must be one of: jpg, jpeg, png, gif, svg',
          action: 'Set to default PNG file type'
        });
      }
      break;
    }

    case 'Missing metadata': {
      const now = new Date();
      if (!document.metadata) {
        fixes.push({
          field: 'metadata',
          oldValue: undefined,
          newValue: {
            createdAt: now,
            updatedAt: now,
            version: '1.0',
            status: 'active'
          },
          fixApplied: 'Added default metadata',
          description: 'Metadata object is required',
          action: 'Add default metadata structure'
        });
      }
      break;
    }

    case 'Invalid color format': {
      if (Array.isArray(document.colors)) {
        const fixedColors = document.colors.map((color: string) => {
          if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
            return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
          }
          if (/^[0-9A-Fa-f]{6}$/.test(color)) {
            return `#${color}`;
          }
          return '#000000';
        });
        fixes.push({
          field: 'colors',
          oldValue: document.colors,
          newValue: fixedColors,
          fixApplied: 'Normalized color formats to 6-digit hex',
          description: 'Colors must be in 6-digit hex format',
          action: 'Convert all colors to 6-digit hex format'
        });
      }
      break;
    }

    case 'Invalid bio content': {
      if (document.profile?.bio) {
        const sanitizedBio = document.profile.bio
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        fixes.push({
          field: 'profile.bio',
          oldValue: document.profile.bio,
          newValue: sanitizedBio,
          fixApplied: 'Removed HTML and normalized whitespace',
          description: 'Bio contains invalid HTML or excess whitespace',
          action: 'Clean and normalize bio text'
        });
      }
      break;
    }

    case 'Invalid role': {
      fixes.push({
        field: 'role',
        oldValue: document.role,
        newValue: 'user',
        fixApplied: 'Set to default user role',
        description: 'Role must be a valid user role',
        action: 'Set to default user role'
      });
      break;
    }

    case 'Invalid status': {
      fixes.push({
        field: 'status',
        oldValue: document.status,
        newValue: 'pending',
        fixApplied: 'Set to pending status',
        description: 'Status must be a valid state',
        action: 'Set to default pending status'
      });
      break;
    }
  }

  return fixes;
}

export function applyAutoFixes(document: any, fixes: AutoFixResult[]): any {
  const updatedDoc = { ...document };
  
  fixes.forEach(fix => {
    if (fix.field.includes('.')) {
      // Handle nested fields
      const parts = fix.field.split('.');
      let current = updatedDoc;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = fix.newValue;
    } else {
      updatedDoc[fix.field] = fix.newValue;
    }
  });

  return updatedDoc;
}

export function validateAutoFix(document: any, fix: AutoFixResult): boolean {
  switch (fix.field) {
    case 'dimensions':
      const { width, height } = fix.newValue;
      return width >= 50 && width <= 5000 && height >= 50 && height <= 5000;

    case 'fileSize':
      return fix.newValue > 0 && fix.newValue <= 10 * 1024 * 1024; // Max 10MB

    case 'name':
      return typeof fix.newValue === 'string' && 
             fix.newValue.length >= 3 && 
             fix.newValue.length <= 100;

    case 'tags':
      return Array.isArray(fix.newValue) && 
             fix.newValue.length > 0 && 
             fix.newValue.every(tag => typeof tag === 'string');

    case 'category':
      return typeof fix.newValue === 'string' && fix.newValue.length > 0;

    case 'fileType':
      return ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fix.newValue.toLowerCase());

    default:
      return true;
  }
} 