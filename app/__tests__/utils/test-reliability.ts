import { act, waitFor } from '@testing-library/react';
import { TEST_TIMEOUTS } from '../constants';

/**
 * Waits for all pending timers and animations to complete
 */
export const waitForAnimations = async () => {
  // Wait for any CSS transitions to complete
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, TEST_TIMEOUTS.ANIMATION));
  });
};

/**
 * Waits for all pending network requests to complete
 * @param timeout - Optional timeout in milliseconds
 */
export const waitForNetwork = async (timeout = TEST_TIMEOUTS.API_CALL) => {
  await waitFor(
    () => {
      const pendingRequests = (global as any).pendingRequests || [];
      if (pendingRequests.length > 0) {
        throw new Error('Waiting for network requests to complete');
      }
    },
    { timeout }
  );
};

/**
 * Waits for images to load
 * @param container - DOM element containing images
 */
export const waitForImages = async (container: HTMLElement) => {
  const images = container.getElementsByTagName('img');
  if (images.length === 0) return;

  await Promise.all(
    Array.from(images).map(
      img =>
        new Promise((resolve, reject) => {
          if (img.complete) {
            resolve(null);
          } else {
            img.addEventListener('load', () => resolve(null));
            img.addEventListener('error', () => reject(new Error('Image failed to load')));
          }
        })
    )
  );
};

/**
 * Cleans up after each test
 */
export const cleanupTest = async () => {
  // Clear all timers
  jest.clearAllTimers();
  
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset fetch mocks if using jest-fetch-mock
  if (typeof global.fetch.mockClear === 'function') {
    global.fetch.mockClear();
  }

  // Clear any pending network requests
  (global as any).pendingRequests = [];

  // Clear local storage
  window.localStorage.clear();
  
  // Clear session storage
  window.sessionStorage.clear();

  // Clear cookies
  document.cookie.split(';').forEach(cookie => {
    document.cookie = cookie
      .replace(/^ +/, '')
      .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
  });

  // Remove any added event listeners
  const cleanup = (global as any).__TEST_EVENT_LISTENERS__;
  if (cleanup) {
    cleanup.forEach((fn: () => void) => fn());
    (global as any).__TEST_EVENT_LISTENERS__ = [];
  }
};

/**
 * Tracks event listeners for cleanup
 * @param element - DOM element
 * @param eventName - Name of the event
 * @param handler - Event handler function
 */
export const trackEventListener = (
  element: Element | Window | Document,
  eventName: string,
  handler: EventListenerOrEventListenerObject
) => {
  element.addEventListener(eventName, handler);
  
  if (!(global as any).__TEST_EVENT_LISTENERS__) {
    (global as any).__TEST_EVENT_LISTENERS__ = [];
  }
  
  (global as any).__TEST_EVENT_LISTENERS__.push(() => {
    element.removeEventListener(eventName, handler);
  });
};

/**
 * Sets up error boundary testing
 * @param ErrorBoundary - Error boundary component
 * @returns Test utilities for error boundary
 */
export const setupErrorBoundaryTest = (ErrorBoundary: React.ComponentType<any>) => {
  const consoleError = console.error;
  beforeAll(() => {
    // Suppress console.error for expected error boundary errors
    console.error = (...args: any[]) => {
      if (/React will try to recreate this component tree/.test(args[0])) {
        return;
      }
      consoleError(...args);
    };
  });

  afterAll(() => {
    console.error = consoleError;
  });

  return {
    /**
     * Wraps a component with error boundary for testing
     * @param Component - Component to test
     * @param props - Component props
     */
    wrapWithErrorBoundary: (Component: React.ComponentType<any>, props = {}) => (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    ),
  };
};

/**
 * Sets up timeout handling for async tests
 * @param timeout - Timeout in milliseconds
 */
export const setupAsyncTest = (timeout = TEST_TIMEOUTS.API_CALL) => {
  // Increase Jest timeout for this test
  jest.setTimeout(timeout);

  return {
    /**
     * Wraps an async operation with timeout
     * @param operation - Async operation to perform
     */
    withTimeout: async <T>(operation: () => Promise<T>): Promise<T> => {
      const timeoutPromise = new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out')), timeout);
      });

      return Promise.race([operation(), timeoutPromise]);
    },
  };
}; 