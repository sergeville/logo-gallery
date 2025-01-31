import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface TestResult {
  title: string;
  status: 'passed' | 'failed' | 'pending';
  errors?: string[];
}

interface TestStatusUpdate {
  file: string;
  newStatus: '✅' | '❌' | '🚧' | '⏳' | '🔄';
  errors?: string[];
}

const TASKS_FILE = join(__dirname, '..', 'VISUAL_TEST_TASKS.md');

function runTests(testPath: string): TestResult[] {
  try {
    const output = execSync(`npm test -- ${testPath}`, { encoding: 'utf-8' });
    // Parse test results from output
    // This is a simplified example - adjust based on your test runner's output
    const results: TestResult[] = [];
    const lines = output.split('\n');
    
    let currentTest: Partial<TestResult> = {};
    
    lines.forEach(line => {
      if (line.includes('PASS')) {
        if (currentTest.title) {
          results.push({
            title: currentTest.title,
            status: 'passed'
          });
        }
        currentTest = {};
      } else if (line.includes('FAIL')) {
        if (currentTest.title) {
          results.push({
            title: currentTest.title,
            status: 'failed',
            errors: currentTest.errors
          });
        }
        currentTest = {};
      } else if (line.includes('Error:')) {
        if (!currentTest.errors) currentTest.errors = [];
        currentTest.errors.push(line);
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
    const filePattern = new RegExp(`(${update.file.replace(/\//g, '\\/')}.*?\\n.*?Status: )([^\\n]*)`, 's');
    const statusLine = content.match(filePattern);
    
    if (statusLine) {
      content = content.replace(
        filePattern,
        `$1${update.newStatus}${update.errors ? ' (See errors below)' : ''}`
      );
      
      // Add errors to the Issues section if any
      if (update.errors?.length) {
        const issuesSection = '### Known Issues';
        const issueEntry = `- [ ] ${update.file}:\n${update.errors.map(err => `  - ${err}`).join('\n')}`;
        
        if (content.includes(issuesSection)) {
          content = content.replace(
            issuesSection,
            `${issuesSection}\n${issueEntry}`
          );
        }
      }
    }
  });
  
  writeFileSync(TASKS_FILE, content);
}

function verifyTestStatus(): void {
  const testDirs = [
    'components/button',
    'components/input',
    'components/theme',
    'components/loading',
    'components/logo-gallery'
  ];
  
  const updates: TestStatusUpdate[] = [];
  
  testDirs.forEach(dir => {
    const results = runTests(`e2e/visual-tests/${dir}`);
    
    results.forEach(result => {
      const update: TestStatusUpdate = {
        file: `${dir}/${result.title}.visual.spec.ts`,
        newStatus: result.status === 'passed' ? '✅' :
                  result.status === 'failed' ? '❌' :
                  result.status === 'pending' ? '⏳' : '🚧'
      };
      
      if (result.errors?.length) {
        update.errors = result.errors;
      }
      
      updates.push(update);
    });
  });
  
  updateTasksFile(updates);
}

// Run verification if called directly
if (require.main === module) {
  verifyTestStatus();
}

export { verifyTestStatus, TestResult, TestStatusUpdate }; 