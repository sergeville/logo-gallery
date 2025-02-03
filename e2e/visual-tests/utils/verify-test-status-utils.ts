import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { Page } from '@playwright/test';

export interface TestResult {
  name: string;
  duration: number;
  status: 'passed' | 'failed' | 'skipped';
  error?: Error;
}

export interface TestStatusUpdate {
  total: number;
  completed: number;
  passed: number;
  failed: number;
  skipped: number;
  currentTest?: string;
  status?: 'passed' | 'failed' | 'pending';
  errors?: string[];
}

const TASKS_FILE = join(__dirname, '..', 'VISUAL_TEST_TASKS.md');

function runTests(testPath: string): TestResult[] {
  try {
    const output = execSync(`npm test -- ${testPath}`, { encoding: 'utf-8' });
    const results: TestResult[] = [];
    const lines = output.split('\n');

    let currentTest: Partial<TestResult> = {};

    lines.forEach(line => {
      if (line.includes('PASS')) {
        if (currentTest.name) {
          results.push({
            name: currentTest.name,
            status: 'passed',
            duration: currentTest.duration || 0,
          });
        }
        currentTest = {};
      } else if (line.includes('FAIL')) {
        if (currentTest.name) {
          results.push({
            name: currentTest.name,
            status: 'failed',
            duration: currentTest.duration || 0,
            error: currentTest.error,
          });
        }
        currentTest = {};
      } else if (line.includes('Error:')) {
        if (!currentTest.error) currentTest.error = new Error(line);
      }
    });

    return results;
  } catch (error) {
    console.error('Error running tests:', error);
    return [];
  }
}

function updateTasksFile(updates: TestStatusUpdate[]): void {
  let content = readFileSync(TASKS_FILE, 'utf-8');

  updates.forEach(update => {
    if (!update.currentTest) return;

    const filePattern = new RegExp(
      `(${update.currentTest.replace(/\//g, '\\/')}.*?\\n.*?Status: )([^\\n]*)`,
      's'
    );
    const statusLine = content.match(filePattern);

    if (statusLine) {
      content = content.replace(
        filePattern,
        `$1${update.status === 'passed' ? '✅' : update.status === 'failed' ? '❌' : '⏳'}${update.errors?.length ? ' (See errors below)' : ''}`
      );

      if (update.errors?.length) {
        const issuesSection = '### Known Issues';
        const issueEntry = `- [ ] ${update.currentTest}:\n${update.errors.map(err => `  - ${err}`).join('\n')}`;

        if (content.includes(issuesSection)) {
          content = content.replace(issuesSection, `${issuesSection}\n${issueEntry}`);
        }
      }
    }
  });

  writeFileSync(TASKS_FILE, content);
}

export async function verifyTestStatusOnPage(
  page: Page,
  expectedStatus: TestStatusUpdate
): Promise<void> {
  await page.waitForFunction(
    status => {
      const statusElement = document.querySelector('.test-status');
      if (!statusElement) return false;

      const currentStatus = {
        total: parseInt(statusElement.getAttribute('data-total') || '0', 10),
        completed: parseInt(statusElement.getAttribute('data-completed') || '0', 10),
        passed: parseInt(statusElement.getAttribute('data-passed') || '0', 10),
        failed: parseInt(statusElement.getAttribute('data-failed') || '0', 10),
        skipped: parseInt(statusElement.getAttribute('data-skipped') || '0', 10),
        currentTest: statusElement.getAttribute('data-current-test'),
      };

      return (
        currentStatus.total === status.total &&
        currentStatus.completed === status.completed &&
        currentStatus.passed === status.passed &&
        currentStatus.failed === status.failed &&
        currentStatus.skipped === status.skipped &&
        (!status.currentTest || currentStatus.currentTest === status.currentTest)
      );
    },
    expectedStatus,
    { timeout: 10000 }
  );
}

export async function waitForTestCompletion(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const statusElement = document.querySelector('.test-status');
      if (!statusElement) return false;

      const total = parseInt(statusElement.getAttribute('data-total') || '0', 10);
      const completed = parseInt(statusElement.getAttribute('data-completed') || '0', 10);

      return total > 0 && completed === total;
    },
    { timeout: 30000 }
  );
}

export async function getTestResults(page: Page): Promise<TestResult[]> {
  return page.evaluate(() => {
    const resultElements = document.querySelectorAll('.test-result');
    return Array.from(resultElements).map(element => ({
      name: element.getAttribute('data-test-name') || '',
      status: element.getAttribute('data-status') as 'passed' | 'failed' | 'skipped',
      duration: parseFloat(element.getAttribute('data-duration') || '0'),
      error: element.hasAttribute('data-error')
        ? new Error(element.getAttribute('data-error') || '')
        : undefined,
    }));
  });
}

export function processTestResults(results: TestResult[]): TestStatusUpdate[] {
  return results.map(result => ({
    total: 1,
    completed: 1,
    passed: result.status === 'passed' ? 1 : 0,
    failed: result.status === 'failed' ? 1 : 0,
    skipped: result.status === 'skipped' ? 1 : 0,
    currentTest: result.name,
    status: result.status === 'skipped' ? 'pending' : result.status,
    errors: result.error ? [result.error.message] : undefined,
  }));
}

// Run verification if called directly
if (require.main === module) {
  const testDirs = [
    'components/button',
    'components/input',
    'components/theme',
    'components/loading',
    'components/logo-gallery',
  ];

  const results = testDirs.flatMap(dir => runTests(`e2e/visual-tests/${dir}`));
  const updates = processTestResults(results);
  updateTasksFile(updates);
}
