#!/usr/bin/env node

import { glob } from 'glob';
import { execSync } from 'child_process';

export interface ValidationResult {
  valid: boolean;
  name?: string;
  passed?: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule {
  name: string;
  validate: (filePath: string) => Promise<ValidationResult>;
}

// Quick validation functions
function validateImportPaths(): boolean {
  try {
    execSync('npm run fix-imports', { stdio: 'inherit' });
    console.log('✅ Import paths follow standards');
    return true;
  } catch {
    console.error('❌ Import path validation failed');
    return false;
  }
}

function validateTypeScript(): boolean {
  try {
    execSync('npm run type-check', { stdio: 'inherit' });
    console.log('✅ TypeScript validation passed');
    return true;
  } catch {
    console.error('❌ TypeScript validation failed');
    return false;
  }
}

function validateESLint(): boolean {
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ ESLint validation passed');
    return true;
  } catch {
    console.error('❌ ESLint validation failed');
    return false;
  }
}

function validatePrettier(): boolean {
  try {
    execSync('npm run format', { stdio: 'inherit' });
    console.log('✅ Prettier formatting passed');
    return true;
  } catch {
    console.error('❌ Prettier formatting failed');
    return false;
  }
}

// Validation rules based on our standards
const rules: ValidationRule[] = [
  {
    name: 'File Organization',
    validate: async (filePath: string): Promise<ValidationResult> => {
      const result: ValidationResult = {
        valid: true,
        name: 'File Organization',
        errors: [],
        warnings: [],
      };

      // Check file organization
      const fileDir = filePath.split('/').slice(0, -1).join('/');
      const requiredDirs = ['app/lib/__tests__/', 'e2e/flows/', 'e2e/tests/', 'e2e/utils/'];

      if (!requiredDirs.some(dir => fileDir.startsWith(dir))) {
        result.errors.push(`File ${filePath} is not in a required directory`);
      }

      result.valid = result.errors.length === 0;
      return result;
    },
  },
  {
    name: 'Naming Conventions',
    validate: async (filePath: string): Promise<ValidationResult> => {
      const result: ValidationResult = {
        valid: true,
        name: 'Naming Conventions',
        passed: true,
        errors: [],
        warnings: [],
      };

      const validPatterns = [/\.test\.ts$/, /\.spec\.ts$/, /-utils\.ts$/];

      if (!validPatterns.some(pattern => pattern.test(filePath))) {
        result.errors.push(`File ${filePath} does not follow naming conventions`);
        result.valid = false;
      }

      return result;
    },
  },
];

// Main validation function
async function validateStandards(): Promise<void> {
  console.log('🔍 Validating against project standards...\n');

  // Run quick validations first
  const quickResults = [
    validateImportPaths(),
    validateTypeScript(),
    validateESLint(),
    validatePrettier(),
  ];

  const quickSuccess = quickResults.every(Boolean);

  // Run detailed validations
  const detailedResult = await validateProject();

  if (quickSuccess && detailedResult.valid) {
    console.log('\n✨ All standards validation passed!');
    process.exit(0);
  } else {
    console.error('\n❌ Standards validation failed. Please fix the issues above.');
    if (detailedResult.errors.length > 0) {
      console.error('\nDetailed validation errors:');
      detailedResult.errors.forEach(error => console.error(`- ${error}`));
    }
    if (detailedResult.warnings.length > 0) {
      console.warn('\nWarnings:');
      detailedResult.warnings.forEach(warning => console.warn(`- ${warning}`));
    }
    process.exit(1);
  }
}

// Project validation function
async function validateProject(): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    name: 'Project Validation',
    errors: [],
    warnings: [],
  };

  try {
    // Get all test files
    const files = glob.sync('app/lib/__tests__/**/*.ts');
    files.push(...glob.sync('e2e/**/*.ts'));

    // Run all rules on each file
    for (const file of files) {
      for (const rule of rules) {
        const ruleResult = await rule.validate(file);
        result.errors.push(...ruleResult.errors);
        result.warnings.push(...ruleResult.warnings);
      }
    }

    result.valid = result.errors.length === 0;
    return result;
  } catch (error) {
    result.valid = false;
    result.errors.push(
      `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return result;
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateStandards().catch((error: unknown) => {
    if (error instanceof Error) {
      console.error('Error running validation:', error.message);
    } else {
      console.error('Error running validation:', error);
    }
    process.exit(1);
  });
}
