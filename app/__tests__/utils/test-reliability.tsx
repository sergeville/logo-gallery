import React from 'react';
import { act, waitFor } from '@testing-library/react';
import { TEST_TIMEOUTS } from '../constants';

/**
 * Waits for all pending timers and animations to complete
 */
export const waitForAnimations = async (): Promise<void> => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, TEST_TIMEOUTS.ANIMATION));
  });
};

interface PendingRequest {
  url: string;
  method: string;
  status: 'pending' | 'complete' | 'error';
}

/**
 * Waits for all pending network requests to complete
 * @param timeout - Optional timeout in milliseconds
 */
export const waitForNetwork = async (timeout = TEST_TIMEOUTS.API_CALL): Promise<void> => {
  await waitFor(
    () => {
      const pendingRequests =
        (global as { pendingRequests?: PendingRequest[] }).pendingRequests || [];
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
export const waitForImages = async (container: HTMLElement): Promise<void> => {
  const images = container.getElementsByTagName('img');
  if (images.length === 0) return;

  await Promise.all(
    Array.from(images).map(
      img =>
        new Promise<null>((resolve, reject) => {
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

interface GlobalWithFetch extends NodeJS.Global {
  fetch: {
    mockClear?: () => void;
  };
}

interface GlobalWithEventListeners extends NodeJS.Global {
  __TEST_EVENT_LISTENERS__?: Array<() => void>;
}

/**
 * Cleans up after each test
 */
export const cleanupTest = async (): Promise<void> => {
  jest.clearAllTimers();
  jest.clearAllMocks();

  const globalWithFetch = global as GlobalWithFetch;
  if (typeof globalWithFetch.fetch.mockClear === 'function') {
    globalWithFetch.fetch.mockClear();
  }

  (global as { pendingRequests?: unknown[] }).pendingRequests = [];
  window.localStorage.clear();
  window.sessionStorage.clear();

  document.cookie.split(';').forEach(cookie => {
    document.cookie = cookie
      .replace(/^ +/, '')
      .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
  });

  const globalWithListeners = global as GlobalWithEventListeners;
  const cleanup = globalWithListeners.__TEST_EVENT_LISTENERS__;
  if (cleanup) {
    cleanup.forEach(fn => fn());
    globalWithListeners.__TEST_EVENT_LISTENERS__ = [];
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
): void => {
  element.addEventListener(eventName, handler);

  const globalWithListeners = global as GlobalWithEventListeners;
  if (!globalWithListeners.__TEST_EVENT_LISTENERS__) {
    globalWithListeners.__TEST_EVENT_LISTENERS__ = [];
  }

  globalWithListeners.__TEST_EVENT_LISTENERS__.push(() => {
    element.removeEventListener(eventName, handler);
  });
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render(): JSX.Element {
    if (this.state.hasError) {
      return React.createElement('div', { 'data-testid': 'error-boundary' },
        React.createElement('h1', null, 'Something went wrong.'),
        React.createElement('pre', null, this.state.error?.message)
      );
    }

    return React.createElement(React.Fragment, null, this.props.children);
  }
}

interface ReliabilityTestUtils {
  wrapWithErrorBoundary: (
    Component: React.ComponentType<unknown>,
    props?: Record<string, unknown>
  ) => React.ReactElement;
}

export function setupReliabilityTest(): ReliabilityTestUtils {
  const originalConsoleError = console.error;
  const errorLog: string[] = [];

  beforeAll(() => {
    console.error = (...args: unknown[]) => {
      errorLog.push(args.join(' '));
    };
  });

  afterEach(() => {
    errorLog.length = 0;
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  function wrapWithErrorBoundary(
    Component: React.ComponentType<unknown>,
    props: Record<string, unknown> = {}
  ): React.ReactElement {
    return React.createElement(
      ErrorBoundary,
      null,
      React.createElement(Component, props)
    );
  }

  return { wrapWithErrorBoundary };
}

interface AsyncTestUtils {
  withTimeout: <T>(operation: () => Promise<T>) => Promise<T>;
}

/**
 * Sets up timeout handling for async tests
 * @param timeout - Timeout in milliseconds
 */
export function setupAsyncTest(timeout = TEST_TIMEOUTS.API_CALL): AsyncTestUtils {
  jest.setTimeout(timeout);

  return {
    withTimeout: async <T>(operation: () => Promise<T>): Promise<T> => {
      const timeoutPromise = new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out')), timeout);
      });

      return Promise.race([operation(), timeoutPromise]);
    },
  };
}
