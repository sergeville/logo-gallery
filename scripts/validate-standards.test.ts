import { validateFile, ValidationResult } from './validate-standards';
import * as fs from 'fs';
import { glob } from 'glob';
import { describe, test, expect } from '@jest/globals';
import { validateFileOrganization, validateNamingConventions, validateComponentTestStructure, validateRequiredTestCases, validateTypeScriptStandards, validateDocumentation } from './validate-standards';

// Mock dependencies
jest.mock('fs');
jest.mock('glob');
jest.mock('@typescript-eslint/typescript-estree', () => ({
  parse: jest.fn()
}));

describe('Standards Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.promises.readFile as jest.Mock).mockResolvedValue('');
    (fs.promises.access as jest.Mock).mockResolvedValue(undefined);
    (glob as unknown as jest.Mock).mockResolvedValue([]);
  });

  describe('File Organization Rule', () => {
    it('should validate required directories exist', async () => {
      const filePath = 'e2e/visual-tests/components/test.visual.spec.ts';
      (fs.promises.access as jest.Mock)
        .mockResolvedValueOnce(undefined) // components dir exists
        .mockRejectedValueOnce(new Error()) // middleware dir missing
        .mockResolvedValueOnce(undefined); // utils dir exists

      const results = await validateFile(filePath);
      const fileOrgResult = results.find(r => r.name === 'File Organization');

      expect(fileOrgResult).toBeDefined();
      expect(fileOrgResult?.errors).toContain('Missing middleware directory in e2e/visual-tests/');
    });
  });

  describe('Naming Conventions Rule', () => {
    it('should validate visual test file naming', async () => {
      const filePath = 'e2e/visual-tests/components/invalid-name.ts';
      
      const results = await validateFile(filePath);
      const namingResult = results.find(r => r.name === 'Naming Conventions');

      expect(namingResult).toBeDefined();
      expect(namingResult?.errors).toContain('Invalid file name: invalid-name.ts. Should end with .visual.spec.ts, .percy.spec.ts, or -utils.ts');
    });
  });

  describe('Component Test Structure Rule', () => {
    it('should validate test structure requirements', async () => {
      const filePath = 'e2e/visual-tests/components/test.visual.spec.ts';
      const mockContent = `
        import { test } from '@playwright/test';
        // Missing test.describe and preparePageForVisualTest
      `;
      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockContent);

      const results = await validateFile(filePath);
      const structureResult = results.find(r => r.name === 'Component Test Structure');

      expect(structureResult).toBeDefined();
      expect(structureResult?.errors).toContain(`Missing test.describe in ${filePath}`);
      expect(structureResult?.warnings).toContain(`Missing preparePageForVisualTest setup in ${filePath}`);
    });
  });

  describe('Required Test Cases Rule', () => {
    it('should validate required test states', async () => {
      const filePath = 'e2e/visual-tests/components/test.visual.spec.ts';
      const mockContent = `
        test.describe('Component', () => {
          // Missing loading, error, and empty states
        });
      `;
      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockContent);

      const results = await validateFile(filePath);
      const testCasesResult = results.find(r => r.name === 'Required Test Cases');

      expect(testCasesResult).toBeDefined();
      expect(testCasesResult?.warnings).toContain(`Missing loading state test in ${filePath}`);
      expect(testCasesResult?.warnings).toContain(`Missing error state test in ${filePath}`);
      expect(testCasesResult?.warnings).toContain(`Missing empty state test in ${filePath}`);
    });
  });

  describe('TypeScript Standards Rule', () => {
    it('should validate TypeScript best practices', async () => {
      const filePath = 'e2e/visual-tests/components/test.visual.spec.ts';
      const mockContent = `
        const badType: any = {};
        async function missingReturnType() {
          return Promise.resolve();
        }
      `;
      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockContent);

      const results = await validateFile(filePath);
      const tsResult = results.find(r => r.name === 'TypeScript Standards');

      expect(tsResult).toBeDefined();
      expect(tsResult?.errors).toContain(`Found 'any' type usage in ${filePath}`);
      expect(tsResult?.warnings).toContain(`Missing explicit return types in ${filePath}`);
    });
  });

  describe('Documentation Rule', () => {
    it('should validate documentation requirements', async () => {
      const filePath = 'e2e/visual-tests/components/test.visual.spec.ts';
      const mockContent = `
        test.describe('Component', () => {
          // Missing JSDoc comments
          test('complex setup without documentation', () => {
            setup: {
              // Complex setup without documentation
            }
          });
        });
      `;
      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockContent);

      const results = await validateFile(filePath);
      const docResult = results.find(r => r.name === 'Documentation');

      expect(docResult).toBeDefined();
      expect(docResult?.warnings).toContain(`Missing JSDoc comments in ${filePath}`);
      expect(docResult?.warnings).toContain(`Missing documentation for complex setup in ${filePath}`);
    });
  });

  describe('Error Handling', () => {
    it('should handle file read errors gracefully', async () => {
      const filePath = 'e2e/visual-tests/components/test.visual.spec.ts';
      (fs.promises.readFile as jest.Mock).mockRejectedValue(new Error('File read error'));

      const results = await validateFile(filePath);
      
      expect(results.some(r => r.errors.some(e => e.includes('File read error')))).toBe(true);
    });
  });

  describe('File Organization', () => {
    test('validates correct file organization', () => {
      const result = validateFileOrganization('e2e/visual-tests/components/button.visual.spec.ts');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Naming Conventions', () => {
    test('validates correct file names', () => {
      const validFiles = [
        'button.visual.spec.ts',
        'auth.percy.spec.ts',
        'test-utils.ts'
      ];

      validFiles.forEach(file => {
        const result = validateNamingConventions(file);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('invalidates incorrect file names', () => {
      const invalidFiles = [
        'button.test.ts',
        'auth.spec.js',
        'utils.tsx'
      ];

      invalidFiles.forEach(file => {
        const result = validateNamingConventions(file);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Component Test Structure', () => {
    test('validates correct test structure', () => {
      const validContent = `
        test.describe('Button Tests', () => {
          test.beforeEach(async ({ page }) => {
            await preparePageForVisualTest(page);
          });

          test('renders correctly', async ({ page }) => {
            await testComponentStates(page, '[data-testid="button"]', states);
          });
        });
      `;

      const result = validateComponentTestStructure(validContent);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Required Test Cases', () => {
    test('validates presence of all required test cases', () => {
      const validContent = `
        test('loading state', async ({ page }) => {
          // Test loading state
        });

        test('error state', async ({ page }) => {
          // Test error state
        });

        test('empty state', async ({ page }) => {
          // Test empty state
        });

        test('responsive layout', async ({ page }) => {
          // Test responsive layout
        });

        test('accessibility', async ({ page }) => {
          await runAccessibilityTest(page);
        });
      `;

      const result = validateRequiredTestCases(validContent);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('TypeScript Standards', () => {
    test('validates TypeScript standards compliance', () => {
      const validContent = `
        async function testButton(page: Page): Promise<void> {
          const button = page.locator('button');
          await expect(button).toBeVisible();
        }
      `;

      const result = validateTypeScriptStandards(validContent);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Documentation', () => {
    test('validates proper documentation', () => {
      const validContent = `
        /**
         * Tests the button component's visual appearance
         * @param page - The Playwright page object
         */
        async function testButton(page: Page): Promise<void> {
          // Complex setup
          await setupTestEnvironment();
          await prepareButtonState();
        }
      `;

      const result = validateDocumentation(validContent);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
}); 