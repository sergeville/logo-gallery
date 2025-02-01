import { readFileSync } from 'fs';
import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { parse as parseTypeScript } from '@typescript-eslint/typescript-estree';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateProject(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Get all test files
  const files = glob.sync('e2e/visual-tests/**/*.ts');

  files.forEach(file => {
    const content = readFileSync(file, 'utf-8');
    
    // Run all validations
    const fileOrgResult = validateFileOrganization(file);
    const namingResult = validateNamingConventions(file);
    const structureResult = validateComponentTestStructure(content);
    const testCasesResult = validateRequiredTestCases(content);
    const tsResult = validateTypeScriptStandards(content);
    const docResult = validateDocumentation(content);

    // Combine results
    result.errors.push(...fileOrgResult.errors);
    result.errors.push(...namingResult.errors);
    result.errors.push(...structureResult.errors);
    result.errors.push(...testCasesResult.errors);
    result.errors.push(...tsResult.errors);
    result.errors.push(...docResult.errors);

    result.warnings.push(...fileOrgResult.warnings);
    result.warnings.push(...namingResult.warnings);
    result.warnings.push(...structureResult.warnings);
    result.warnings.push(...testCasesResult.warnings);
    result.warnings.push(...tsResult.warnings);
    result.warnings.push(...docResult.warnings);
  });

  result.valid = result.errors.length === 0;
  return result;
}

export function validateFileOrganization(file: string): ValidationResult {
  const requiredDirs = [
    'e2e/visual-tests/components/',
    'e2e/visual-tests/middleware/',
    'e2e/visual-tests/utils/'
  ];

  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  const fileDir = file.split('/').slice(0, -1).join('/');
  if (!requiredDirs.some(dir => fileDir.startsWith(dir))) {
    result.valid = false;
    result.errors.push(`File ${file} is not in a required directory`);
  }

  return result;
}

export function validateNamingConventions(file: string): ValidationResult {
  const validPatterns = [
    /\.visual\.spec\.ts$/,
    /\.percy\.spec\.ts$/,
    /-utils\.ts$/
  ];

  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  if (!validPatterns.some(pattern => pattern.test(file))) {
    result.valid = false;
    result.errors.push(`File ${file} does not follow naming conventions`);
  }

  return result;
}

export function validateComponentTestStructure(content: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  if (!content.includes('test.describe(')) {
    result.warnings.push('Missing test.describe block');
  }

  if (!content.includes('preparePageForVisualTest')) {
    result.warnings.push('Missing preparePageForVisualTest setup');
  }

  if (!content.includes('testComponentStates')) {
    result.warnings.push('Consider using testComponentStates for state management');
  }

  return result;
}

export function validateRequiredTestCases(content: string): ValidationResult {
  const requiredTests = [
    'loading state',
    'error state',
    'empty state',
    'responsive',
    'accessibility'
  ];

  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  requiredTests.forEach(testCase => {
    if (!content.toLowerCase().includes(testCase.toLowerCase())) {
      result.warnings.push(`Missing ${testCase} test`);
    }
  });

  return result;
}

export function validateTypeScriptStandards(content: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  if (content.includes(': any')) {
    result.errors.push('Unexpected any type usage');
  }

  const functionDeclarations = content.match(/async\s+\w+\s*\([^)]*\)\s*{/g) || [];
  functionDeclarations.forEach(func => {
    if (!func.includes(': Promise<')) {
      result.errors.push('Missing explicit return type on async function');
    }
  });

  return result;
}

export function validateDocumentation(content: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  if (!content.includes('/**')) {
    result.warnings.push('Missing JSDoc comments');
  }

  const complexSetupIndicators = [
    'beforeEach',
    'beforeAll',
    'setup',
    'prepare',
    'initialize'
  ];

  if (complexSetupIndicators.some(indicator => content.includes(indicator)) && !content.includes('/**')) {
    result.warnings.push('Missing documentation for complex setup');
  }

  return result;
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
      const result: ValidationResult = { 
        name: 'File Organization',
        passed: true, 
        errors: [], 
        warnings: [] 
      };
      
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
      const result: ValidationResult = { 
        name: 'Naming Conventions',
        passed: true, 
        errors: [], 
        warnings: [] 
      };
      
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
      const result: ValidationResult = { 
        name: 'Component Test Structure',
        passed: true, 
        errors: [], 
        warnings: [] 
      };
      
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
      const result: ValidationResult = { 
        name: 'Required Test Cases',
        passed: true, 
        errors: [], 
        warnings: [] 
      };
      
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
      const result: ValidationResult = { 
        name: 'TypeScript Standards',
        passed: true, 
        errors: [], 
        warnings: [] 
      };
      
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
      const result: ValidationResult = { 
        name: 'Documentation',
        passed: true, 
        errors: [], 
        warnings: [] 
      };
      
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
        results.push(result);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        name: rule.name,
        passed: false,
        errors: [`Error validating ${rule.name}: ${errorMessage}`],
        warnings: []
      });
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
