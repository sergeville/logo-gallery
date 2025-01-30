import { performance } from 'perf_hooks';

interface TestMetrics {
  testName: string;
  duration: number;
  networkCalls: number;
  renderCount: number;
  memoryUsage: number;
}

interface PerformanceThresholds {
  maxDuration?: number;
  maxNetworkCalls?: number;
  maxRenderCount?: number;
  maxMemoryUsage?: number;
}

class TestPerformanceMonitor {
  private metrics: TestMetrics[] = [];
  private currentTest: TestMetrics | null = null;
  private networkCalls = 0;
  private renderCount = 0;
  private startTime = 0;
  private thresholds: PerformanceThresholds = {};

  constructor(thresholds: PerformanceThresholds = {}) {
    this.thresholds = {
      maxDuration: 5000, // 5 seconds
      maxNetworkCalls: 10,
      maxRenderCount: 20,
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
      ...thresholds
    };
  }

  startTest(testName: string) {
    this.currentTest = {
      testName,
      duration: 0,
      networkCalls: 0,
      renderCount: 0,
      memoryUsage: 0
    };
    this.networkCalls = 0;
    this.renderCount = 0;
    this.startTime = performance.now();
  }

  endTest() {
    if (!this.currentTest) return;

    this.currentTest.duration = performance.now() - this.startTime;
    this.currentTest.networkCalls = this.networkCalls;
    this.currentTest.renderCount = this.renderCount;
    this.currentTest.memoryUsage = process.memoryUsage().heapUsed;

    this.metrics.push(this.currentTest);
    this.validateMetrics(this.currentTest);
    this.currentTest = null;
  }

  trackNetworkCall() {
    this.networkCalls++;
  }

  trackRender() {
    this.renderCount++;
  }

  private validateMetrics(metrics: TestMetrics) {
    const violations: string[] = [];

    if (this.thresholds.maxDuration && metrics.duration > this.thresholds.maxDuration) {
      violations.push(
        `Test "${metrics.testName}" exceeded duration threshold: ${metrics.duration}ms (max: ${this.thresholds.maxDuration}ms)`
      );
    }

    if (this.thresholds.maxNetworkCalls && metrics.networkCalls > this.thresholds.maxNetworkCalls) {
      violations.push(
        `Test "${metrics.testName}" exceeded network calls threshold: ${metrics.networkCalls} (max: ${this.thresholds.maxNetworkCalls})`
      );
    }

    if (this.thresholds.maxRenderCount && metrics.renderCount > this.thresholds.maxRenderCount) {
      violations.push(
        `Test "${metrics.testName}" exceeded render count threshold: ${metrics.renderCount} (max: ${this.thresholds.maxRenderCount})`
      );
    }

    if (this.thresholds.maxMemoryUsage && metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      violations.push(
        `Test "${metrics.testName}" exceeded memory usage threshold: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB (max: ${Math.round(this.thresholds.maxMemoryUsage / 1024 / 1024)}MB)`
      );
    }

    if (violations.length > 0) {
      console.warn('Performance violations detected:\n' + violations.join('\n'));
    }
  }

  getMetrics() {
    return this.metrics;
  }

  generateReport() {
    const report = {
      summary: {
        totalTests: this.metrics.length,
        totalDuration: 0,
        totalNetworkCalls: 0,
        totalRenderCount: 0,
        averageMemoryUsage: 0,
        slowestTest: '',
        maxMemoryTest: ''
      },
      details: this.metrics.map(metric => ({
        ...metric,
        memoryUsageMB: Math.round(metric.memoryUsage / 1024 / 1024)
      }))
    };

    let maxDuration = 0;
    let maxMemory = 0;
    let totalMemory = 0;

    this.metrics.forEach(metric => {
      report.summary.totalDuration += metric.duration;
      report.summary.totalNetworkCalls += metric.networkCalls;
      report.summary.totalRenderCount += metric.renderCount;
      totalMemory += metric.memoryUsage;

      if (metric.duration > maxDuration) {
        maxDuration = metric.duration;
        report.summary.slowestTest = metric.testName;
      }

      if (metric.memoryUsage > maxMemory) {
        maxMemory = metric.memoryUsage;
        report.summary.maxMemoryTest = metric.testName;
      }
    });

    report.summary.averageMemoryUsage = Math.round(totalMemory / this.metrics.length / 1024 / 1024);

    return report;
  }

  reset() {
    this.metrics = [];
    this.currentTest = null;
    this.networkCalls = 0;
    this.renderCount = 0;
  }
}

// Create singleton instance
export const performanceMonitor = new TestPerformanceMonitor();

// React component wrapper for tracking renders
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return class WithPerformanceTracking extends React.Component<P> {
    componentDidMount() {
      performanceMonitor.trackRender();
    }

    componentDidUpdate() {
      performanceMonitor.trackRender();
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
};

// Jest hooks for automatic performance monitoring
export const setupPerformanceMonitoring = () => {
  beforeEach(function() {
    // Use test name from jest
    performanceMonitor.startTest(this.currentTest?.title || 'Unknown test');
  });

  afterEach(() => {
    performanceMonitor.endTest();
  });

  afterAll(() => {
    const report = performanceMonitor.generateReport();
    console.log('\nTest Performance Report:');
    console.table(report.summary);
    console.log('\nTest Details:');
    console.table(report.details);
    performanceMonitor.reset();
  });
};

// Network request tracking
export const trackNetworkRequest = () => {
  performanceMonitor.trackNetworkCall();
}; 