import { ValidationFieldType } from '@/app/lib/types/validation-enums';

export interface ValidationRule {
  type: typeof ValidationFieldType[keyof typeof ValidationFieldType];
  field: string;
  name: string;
  code: string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  validate?: (value: any) => boolean;
} 