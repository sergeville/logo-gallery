// Test timeouts
export const TEST_TIMEOUTS = {
  ANIMATION: 300,
  API_CALL: 5000,
  IMAGE_LOAD: 1000,
  DEBOUNCE: 500,
  MODAL_TRANSITION: 200
} as const;

// Test image dimensions
export const TEST_IMAGE_DIMENSIONS = {
  THUMBNAIL: { width: 200, height: 200 },
  PREVIEW: { width: 400, height: 400 },
  FULL: { width: 800, height: 800 }
} as const;

// Responsive breakpoints
export const TEST_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

// Test file sizes
export const TEST_FILE_SIZES = {
  SMALL: 1024 * 100, // 100KB
  MEDIUM: 1024 * 1024, // 1MB
  LARGE: 1024 * 1024 * 5 // 5MB
} as const;

// Test error messages
export const TEST_ERROR_MESSAGES = {
  NETWORK: 'Network error occurred. Please check your connection',
  TIMEOUT: 'Request timed out. Please try again',
  UNAUTHORIZED: 'Unauthorized: Please log in to delete this logo',
  FORBIDDEN: 'Forbidden: You do not have permission to delete this logo',
  NOT_FOUND: 'Logo not found',
  CONFLICT: 'Logo is currently in use and cannot be deleted',
  RATE_LIMIT: 'Too many requests. Please try again later',
  SERVER_ERROR: 'Server error occurred. Please try again later',
  VALIDATION: 'Invalid input data',
  UNKNOWN: 'An unexpected error occurred'
} as const;

// Test HTTP status codes
export const TEST_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500
} as const;

// Test data limits
export const TEST_LIMITS = {
  MAX_TAGS: 10,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_NAME_LENGTH: 100,
  MAX_COLLECTION_SIZE: 50,
  MAX_BATCH_SIZE: 100
} as const;

// Test regex patterns
export const TEST_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_-]+$/,
  URL: /^https?:\/\/.+/
} as const;

// Test themes
export const TEST_THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
} as const;

// Test roles
export const TEST_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
} as const;

// Test API endpoints
export const TEST_ENDPOINTS = {
  LOGOS: '/api/logos',
  USERS: '/api/users',
  AUTH: '/api/auth',
  COLLECTIONS: '/api/collections'
} as const; 