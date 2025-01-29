'use client';

import { useEffect } from 'react';
import { performanceMonitor } from '@/lib/services/PerformanceMonitoringService';

export function usePerformanceMonitoring() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Create a PerformanceObserver for LCP
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcp = lastEntry.startTime;
      updateMetrics({ lcp });
    });

    // Create a PerformanceObserver for FID
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      const fid = lastEntry.duration;
      updateMetrics({ fid });
    });

    // Create a PerformanceObserver for CLS
    const clsObserver = new PerformanceObserver((entryList) => {
      let clsValue = 0;
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      updateMetrics({ cls: clsValue });
    });

    // Start observing
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    fidObserver.observe({ entryTypes: ['first-input'] });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Get Navigation Timing API metrics
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    // Calculate TTFB
    const ttfb = navigationTiming.responseStart - navigationTiming.requestStart;

    // Calculate FCP
    const paintTiming = performance.getEntriesByType('paint').find(
      entry => entry.name === 'first-contentful-paint'
    );
    const fcp = paintTiming ? paintTiming.startTime : 0;

    // Initial metrics update
    updateMetrics({
      ttfb,
      fcp,
      navigationTiming
    });

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);
}

function updateMetrics(newMetrics: Partial<{
  ttfb: number;
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  navigationTiming: PerformanceNavigationTiming;
}>) {
  performanceMonitor.recordClientMetrics({
    ttfb: newMetrics.ttfb ?? 0,
    fcp: newMetrics.fcp ?? 0,
    lcp: newMetrics.lcp ?? 0,
    fid: newMetrics.fid ?? 0,
    cls: newMetrics.cls ?? 0,
    navigationTiming: newMetrics.navigationTiming
  });
} 