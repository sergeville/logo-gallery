export interface TestObserver {
  onTestStart(testName: string): void;
  onTestPass(testName: string, duration: number): void;
  onTestFail(testName: string, error: Error): void;
  onValidationCheck(entity: string, field: string, value: any): void;
  onDatabaseOperation(operation: string, collection: string, count?: number): void;
  onCoverageReport(coverage: CoverageReport): void;
}

interface CoverageReport {
  statements: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  lines: CoverageMetric;
}

interface CoverageMetric {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
}

export class ConsoleTestObserver implements TestObserver {
  private testStartTimes: Map<string, number> = new Map();
  private indentLevel: number = 0;
  private testResults: Map<string, { duration: number; passed: boolean }> = new Map();
  private coverageData?: CoverageReport;
  
  private get indent(): string {
    return '  '.repeat(this.indentLevel);
  }

  private colors = {
    blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
    green: (text: string) => `\x1b[32m${text}\x1b[0m`,
    red: (text: string) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
    cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
    gray: (text: string) => `\x1b[90m${text}\x1b[0m`,
    white: (text: string) => `\x1b[97m${text}\x1b[0m`,
  };

  onTestStart(testName: string): void {
    this.testStartTimes.set(testName, Date.now());
    console.log(`${this.indent}${this.colors.blue('▶')} Starting: ${testName}`);
    this.indentLevel++;
  }

  onTestPass(testName: string, duration: number): void {
    this.indentLevel--;
    const startTime = this.testStartTimes.get(testName) || Date.now();
    const actualDuration = Date.now() - startTime;
    console.log(`${this.indent}${this.colors.green('✓')} Passed: ${testName} (${actualDuration}ms)`);
    this.testResults.set(testName, { duration: actualDuration, passed: true });
  }

  onTestFail(testName: string, error: Error): void {
    this.indentLevel--;
    console.log(`${this.indent}${this.colors.red('✗')} Failed: ${testName}`);
    console.log(`${this.indent}  ${this.colors.red('Error:')} ${error.message}`);
    this.testResults.set(testName, { duration: 0, passed: false });
  }

  onValidationCheck(entity: string, field: string, value: any): void {
    console.log(`${this.indent}${this.colors.yellow('⚡')} Validating ${entity}.${field}: ${JSON.stringify(value)}`);
  }

  onDatabaseOperation(operation: string, collection: string, count?: number): void {
    const countStr = count !== undefined ? ` (${count} items)` : '';
    console.log(`${this.indent}${this.colors.cyan('🔄')} ${operation} on ${collection}${countStr}`);
  }

  onCoverageReport(coverage: CoverageReport): void {
    this.coverageData = coverage;
    this.printCoverageSummary();
  }

  private printCoverageSummary(): void {
    if (!this.coverageData) return;

    console.log('\n' + this.colors.white('Coverage Summary:'));
    console.log(this.colors.gray('━'.repeat(50)));

    const metrics = {
      Statements: this.coverageData.statements,
      Branches: this.coverageData.branches,
      Functions: this.coverageData.functions,
      Lines: this.coverageData.lines
    };

    Object.entries(metrics).forEach(([name, metric]) => {
      const color = this.getCoverageColor(metric.pct);
      const bar = this.generateCoverageBar(metric.pct);
      console.log(
        `${this.colors.white(name.padEnd(12))} ${color(metric.pct.toFixed(2).padStart(6))}% ${bar} ` +
        `${this.colors.gray(`(${metric.covered}/${metric.total})`)}`
      );
    });

    console.log(this.colors.gray('━'.repeat(50)));
    this.printTestSummary();
  }

  private printTestSummary(): void {
    const totalTests = this.testResults.size;
    const passedTests = Array.from(this.testResults.values()).filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = Array.from(this.testResults.values()).reduce((sum, r) => sum + r.duration, 0);

    console.log(this.colors.white('\nTest Summary:'));
    console.log(
      `Total: ${totalTests} | ` +
      `${this.colors.green(`Passed: ${passedTests}`)} | ` +
      `${this.colors.red(`Failed: ${failedTests}`)} | ` +
      `Duration: ${totalDuration}ms`
    );
  }

  private getCoverageColor(percentage: number): (text: string) => string {
    if (percentage >= 90) return this.colors.green;
    if (percentage >= 70) return this.colors.yellow;
    return this.colors.red;
  }

  private generateCoverageBar(percentage: number): string {
    const width = 20;
    const filledCount = Math.round((percentage / 100) * width);
    const emptyCount = width - filledCount;
    
    return (
      this.colors.green('█'.repeat(filledCount)) +
      this.colors.gray('░'.repeat(emptyCount))
    );
  }
}

export class TestObserverManager {
  private static instance: TestObserverManager;
  private observers: TestObserver[] = [];

  private constructor() {}

  static getInstance(): TestObserverManager {
    if (!TestObserverManager.instance) {
      TestObserverManager.instance = new TestObserverManager();
    }
    return TestObserverManager.instance;
  }

  addObserver(observer: TestObserver): void {
    this.observers.push(observer);
  }

  removeObserver(observer: TestObserver): void {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notifyTestStart(testName: string): void {
    this.observers.forEach(observer => observer.onTestStart(testName));
  }

  notifyTestPass(testName: string, duration: number): void {
    this.observers.forEach(observer => observer.onTestPass(testName, duration));
  }

  notifyTestFail(testName: string, error: Error): void {
    this.observers.forEach(observer => observer.onTestFail(testName, error));
  }

  notifyValidationCheck(entity: string, field: string, value: any): void {
    this.observers.forEach(observer => observer.onValidationCheck(entity, field, value));
  }

  notifyDatabaseOperation(operation: string, collection: string, count?: number): void {
    this.observers.forEach(observer => observer.onDatabaseOperation(operation, collection, count));
  }

  notifyCoverageReport(coverage: CoverageReport): void {
    this.observers.forEach(observer => observer.onCoverageReport(coverage));
  }
} 