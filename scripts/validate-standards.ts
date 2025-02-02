import { glob } from 'glob';

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
export async function validateProject(): Promise<ValidationResult> {
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
  validateProject()
    .then(result => {
      if (!result.valid) {
        console.error('Validation failed:');
        result.errors.forEach(error => console.error(`- ${error}`));
        result.warnings.forEach(warning => console.warn(`- ${warning}`));
        process.exit(1);
      } else {
        console.log('Validation passed!');
        if (result.warnings.length > 0) {
          console.warn('\nWarnings:');
          result.warnings.forEach(warning => console.warn(`- ${warning}`));
        }
      }
    })
    .catch(error => {
      console.error('Validation script failed:', error);
      process.exit(1);
    });
}
