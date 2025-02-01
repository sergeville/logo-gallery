import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { parse as parseTypeScript } from '@typescript-eslint/typescript-estree';

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

interface ValidationRule {
  name: string;
  validate: (filePath: string) => Promise<ValidationResult>;
}

// Utility function to read file content
async function readFile(filePath: string): Promise<string> {
  return fs.promises.readFile(filePath, 'utf-8');
}

// Utility function to check if a file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Validation rules based on our standards
const rules: ValidationRule[] = [
  {
    name: 'File Organization',
    validate: async (filePath: string) => {
      const result: ValidationResult = { passed: true, errors: [], warnings: [] };
      
      // Check visual test file structure
      const visualTestFiles = await glob('e2e/visual-tests/**/*.ts');
      const hasComponentsDir = await fileExists('e2e/visual-tests/components');
      const hasMiddlewareDir = await fileExists('e2e/visual-tests/middleware');
      const hasUtilsDir = await fileExists('e2e/visual-tests/utils');

      if (!hasComponentsDir) {
        result.errors.push('Missing components directory in e2e/visual-tests/');
      }
      if (!hasMiddlewareDir) {
        result.errors.push('Missing middleware directory in e2e/visual-tests/');
      }
      if (!hasUtilsDir) {
        result.errors.push('Missing utils directory in e2e/visual-tests/');
      }

      return result;
    }
  },
  {
    name: 'Naming Conventions',
    validate: async (filePath: string) => {
      const result: ValidationResult = { passed: true, errors: [], warnings: [] };
      
      if (filePath.includes('visual-tests')) {
        const fileName = path.basename(filePath);
        if (fileName.endsWith('.ts')) {
          if (!fileName.match(/\.(visual|percy)\.spec\.ts$/) && !fileName.endsWith('-utils.ts')) {
            result.errors.push(`Invalid file name: ${fileName}. Should end with .visual.spec.ts, .percy.spec.ts, or -utils.ts`);
          }
        }
      }

      return result;
    }
  },
  {
    name: 'Component Test Structure',
    validate: async (filePath: string) => {
      const result: ValidationResult = { passed: true, errors: [], warnings: [] };
      
      if (filePath.match(/\.(visual|percy)\.spec\.ts$/)) {
        const content = await readFile(filePath);
        const ast = parseTypeScript(content, { jsx: true });

        // Check for test.describe usage
        if (!content.includes('test.describe(')) {
          result.errors.push(`Missing test.describe in ${filePath}`);
        }

        // Check for beforeEach with preparePageForVisualTest
        if (!content.includes('preparePageForVisualTest')) {
          result.warnings.push(`Missing preparePageForVisualTest setup in ${filePath}`);
        }

        // Check for proper test state handling
        if (!content.includes('testComponentStates')) {
          result.warnings.push(`Consider using testComponentStates for state management in ${filePath}`);
        }
      }

      return result;
    }
  },
  {
    name: 'Required Test Cases',
    validate: async (filePath: string) => {
      const result: ValidationResult = { passed: true, errors: [], warnings: [] };
      
      if (filePath.match(/\.(visual|percy)\.spec\.ts$/)) {
        const content = await readFile(filePath);

        // Check for required test states
        const requiredStates = ['loading', 'error', 'empty'];
        for (const state of requiredStates) {
          if (!content.toLowerCase().includes(state)) {
            result.warnings.push(`Missing ${state} state test in ${filePath}`);
          }
        }

        // Check for responsive testing
        if (!content.includes('VIEWPORT_SIZES')) {
          result.warnings.push(`Missing responsive testing in ${filePath}`);
        }

        // Check for accessibility testing
        if (!content.includes('axe.run')) {
          result.warnings.push(`Missing accessibility testing in ${filePath}`);
        }
      }

      return result;
    }
  },
  {
    name: 'TypeScript Standards',
    validate: async (filePath: string) => {
      const result: ValidationResult = { passed: true, errors: [], warnings: [] };
      
      if (filePath.endsWith('.ts')) {
        const content = await readFile(filePath);
        const ast = parseTypeScript(content, { jsx: true });

        // Check for explicit return types
        if (!content.includes(': Promise<void>') && !content.includes(': void')) {
          result.warnings.push(`Missing explicit return types in ${filePath}`);
        }

        // Check for proper interface/type usage
        if (content.includes('any')) {
          result.errors.push(`Found 'any' type usage in ${filePath}`);
        }
      }

      return result;
    }
  },
  {
    name: 'Documentation',
    validate: async (filePath: string) => {
      const result: ValidationResult = { passed: true, errors: [], warnings: [] };
      
      if (filePath.match(/\.(visual|percy)\.spec\.ts$/)) {
        const content = await readFile(filePath);

        // Check for test descriptions
        if (!content.includes('/**') || !content.includes('*/')) {
          result.warnings.push(`Missing JSDoc comments in ${filePath}`);
        }

        // Check for complex setup documentation
        if (content.includes('setup:') && !content.match(/\/\*\*[\s\S]*?setup/)) {
          result.warnings.push(`Missing documentation for complex setup in ${filePath}`);
        }
      }

      return result;
    }
  }
];

async function validateFile(filePath: string): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  for (const rule of rules) {
    try {
      const result = await rule.validate(filePath);
      if (!result.passed || result.errors.length > 0 || result.warnings.length > 0) {
        results.push({
          ...result,
          name: rule.name
        } as ValidationResult);
      }
    } catch (error) {
      results.push({
        passed: false,
        errors: [`Error validating ${rule.name}: ${error.message}`],
        warnings: [],
        name: rule.name
      } as ValidationResult);
    }
  }

  return results;
}

async function validateStandards(): Promise<void> {
  console.log('🔍 Validating project against standards...\n');

  const files = await glob('e2e/visual-tests/**/*.ts');
  let hasErrors = false;
  let hasWarnings = false;

  for (const file of files) {
    const results = await validateFile(file);
    
    if (results.length > 0) {
      console.log(`\n📄 ${file}`);
      
      for (const result of results) {
        if (result.errors.length > 0) {
          hasErrors = true;
          console.log(`  ❌ ${result.name}:`);
          result.errors.forEach(error => console.log(`    - ${error}`));
        }
        
        if (result.warnings.length > 0) {
          hasWarnings = true;
          console.log(`  ⚠️  ${result.name}:`);
          result.warnings.forEach(warning => console.log(`    - ${warning}`));
        }
      }
    }
  }

  console.log('\n📊 Validation Summary:');
  if (hasErrors) {
    console.log('❌ Found standard violations that need to be fixed');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Found warnings that should be reviewed');
    process.exit(0);
  } else {
    console.log('✅ All standards are met');
    process.exit(0);
  }
}

// Run validation if called directly
if (require.main === module) {
  validateStandards().catch(error => {
    console.error('Error running validation:', error);
    process.exit(1);
  });
}

export { validateStandards, validateFile, ValidationResult, ValidationRule };
