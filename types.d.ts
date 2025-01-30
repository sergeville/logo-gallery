declare module 'cloudinary' {
  export const v2: any;
}

declare module 'react-intersection-observer' {
  export function useInView(options?: any): [any, boolean, any];
}

declare module '@tanstack/react-virtual' {
  export function useVirtualizer(options: any): any;
}

// Add missing type declarations for internal modules
declare module '@/config/cache.config' {
  export const cacheConfig: any;
  export const cacheServiceConfig: any;
}

declare module '@/config/cdn.config' {
  export const cdnConfig: any;
}

declare module '@/config/image.config' {
  export const imageConfig: any;
}

declare module '@/lib/validation' {
  export interface ValidationError {
    code: string;
    field: string;
    message: string;
  }
  
  export interface ValidationResult {
    errors: ValidationError[];
    warnings: ValidationError[];
    fixes: ValidationError[];
  }
}

declare module '@/components/ui/*';
declare module '@/hooks/*';
declare module '@/lib/services/*';
declare module '@/lib/models/*'; 