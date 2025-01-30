import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { performanceMonitor } from '@/app/lib/services/PerformanceMonitoringService';

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
    
    // Record error metrics and return error response
    const errorResponse = NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
    
    performanceMonitor.recordApiMetrics(req, errorResponse, duration).catch(err => {
      console.error('Failed to record error metrics:', err);
    });

    return errorResponse;
  }
} 