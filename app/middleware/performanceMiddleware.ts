import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { performanceMonitor } from '@/lib/services/PerformanceMonitoringService';

export async function performanceMiddleware(
  req: NextRequest,
  next: () => Promise<NextResponse>
) {
  const startTime = performance.now();

  try {
    const response = await next();
    const duration = performance.now() - startTime;

    // Record metrics asynchronously
    performanceMonitor.recordApiMetrics(req, response, duration).catch(error => {
      console.error('Failed to record performance metrics:', error);
    });

    return response;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    // Record error metrics
    performanceMonitor.recordApiMetrics(req, new NextResponse(null, { status: 500 }), duration).catch(err => {
      console.error('Failed to record error metrics:', err);
    });

    throw error;
  }
} 