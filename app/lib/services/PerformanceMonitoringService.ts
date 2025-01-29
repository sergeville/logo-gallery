import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface PerformanceMetrics {
  timestamp: number;
  url: string;
  duration: number;
  memory?: {
    heapUsed: number;
    heapTotal: number;
  };
  resourceTiming?: PerformanceResourceTiming[];
  errors?: {
    message: string;
    count: number;
  }[];
}

interface PageLoadMetrics {
  ttfb: number;              // Time to First Byte
  fcp: number;              // First Contentful Paint
  lcp: number;              // Largest Contentful Paint
  fid: number;              // First Input Delay
  cls: number;              // Cumulative Layout Shift
  navigationTiming: any;    // Navigation Timing API data
}

class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetricsAge = 24 * 60 * 60 * 1000; // 24 hours
  private readonly maxMetricsCount = 10000;

  private constructor() {
    this.cleanupOldMetrics();
  }

  public static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  public async recordApiMetrics(req: NextRequest, res: NextResponse, duration: number): Promise<void> {
    const metric: PerformanceMetrics = {
      timestamp: Date.now(),
      url: req.url,
      duration,
      memory: this.getMemoryUsage(),
    };

    this.metrics.push(metric);
    await this.reportMetricsToAnalytics(metric);
  }

  public recordClientMetrics(metrics: PageLoadMetrics): void {
    // Send metrics to analytics service
    console.log('Page Load Metrics:', metrics);
  }

  public getMetricsSummary(timeWindow?: number): {
    avgResponseTime: number;
    p95ResponseTime: number;
    errorRate: number;
    requestsPerMinute: number;
  } {
    const relevantMetrics = timeWindow
      ? this.metrics.filter(m => Date.now() - m.timestamp <= timeWindow)
      : this.metrics;

    if (relevantMetrics.length === 0) {
      return {
        avgResponseTime: 0,
        p95ResponseTime: 0,
        errorRate: 0,
        requestsPerMinute: 0
      };
    }

    const durations = relevantMetrics.map(m => m.duration).sort((a, b) => a - b);
    const p95Index = Math.floor(durations.length * 0.95);
    const errorCount = relevantMetrics.reduce((count, m) => count + (m.errors?.length || 0), 0);
    const timeRange = (relevantMetrics[relevantMetrics.length - 1].timestamp - relevantMetrics[0].timestamp) / 1000 / 60;

    return {
      avgResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95ResponseTime: durations[p95Index],
      errorRate: errorCount / relevantMetrics.length,
      requestsPerMinute: relevantMetrics.length / (timeRange || 1)
    };
  }

  private getMemoryUsage(): { heapUsed: number; heapTotal: number } | undefined {
    if (typeof process !== 'undefined') {
      const memory = process.memoryUsage();
      return {
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal
      };
    }
    return undefined;
  }

  private async reportMetricsToAnalytics(metrics: PerformanceMetrics): Promise<void> {
    try {
      // In a real implementation, send to your analytics service
      // Example: await analyticsService.sendMetrics(metrics);
      console.log('Performance Metrics:', metrics);
    } catch (error) {
      console.error('Failed to report metrics:', error);
    }
  }

  private cleanupOldMetrics(): void {
    setInterval(() => {
      const now = Date.now();
      this.metrics = this.metrics
        .filter(m => now - m.timestamp <= this.maxMetricsAge)
        .slice(-this.maxMetricsCount);
    }, 60 * 60 * 1000); // Run every hour
  }
}

export const performanceMonitor = PerformanceMonitoringService.getInstance(); 