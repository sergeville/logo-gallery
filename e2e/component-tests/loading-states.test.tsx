import { test, expect } from '@playwright/experimental-ct-react';
import { LoadingSpinner, LoadingSkeleton, LoadingProgress } from '../../app/components/LoadingStates';
import { ErrorBoundary } from '../../app/components/ErrorBoundary';

test.describe('Loading States Components', () => {
  test('LoadingSpinner renders in all sizes', async ({ mount }) => {
    const sizes = ['sm', 'md', 'lg'] as const;
    
    for (const size of sizes) {
      const component = await mount(
        <LoadingSpinner size={size} text={`${size} spinner`} />
      );
      
      await expect(component).toBeVisible();
      await expect(component).toHaveScreenshot(`spinner-${size}.png`);
      
      // Check text content
      const text = await component.textContent();
      expect(text).toContain(`${size} spinner`);
    }
  });

  test('LoadingSkeleton animates properly', async ({ mount }) => {
    const component = await mount(<LoadingSkeleton size="md" />);
    
    // Take screenshots at different animation frames
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 100));
      await expect(component).toHaveScreenshot(`skeleton-frame-${i}.png`);
    }
  });

  test('LoadingProgress updates correctly', async ({ mount }) => {
    const progress = [0, 25, 50, 75, 100];
    
    for (const value of progress) {
      const component = await mount(
        <LoadingProgress 
          progress={value} 
          text={`Loading: ${value}%`} 
        />
      );
      
      await expect(component).toBeVisible();
      await expect(component).toHaveScreenshot(`progress-${value}.png`);
      
      // Check progress text
      const text = await component.textContent();
      expect(text).toContain(`${value}%`);
    }
  });

  test('ErrorBoundary handles errors gracefully', async ({ mount }) => {
    const ThrowError = () => {
      throw new Error('Test error');
      return null;
    };

    const component = await mount(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Check error UI
    await expect(component).toBeVisible();
    await expect(component).toHaveScreenshot('error-boundary.png');
    
    // Verify error message
    const text = await component.textContent();
    expect(text).toContain('Something went wrong');
    
    // Test retry functionality
    await component.getByText('Try again').click();
    await expect(component).toHaveScreenshot('error-boundary-retry.png');
  });

  test('Components handle dark mode correctly', async ({ mount }) => {
    // Enable dark mode
    await mount(
      <div className="dark">
        <div className="space-y-4">
          <LoadingSpinner size="md" text="Dark mode spinner" />
          <LoadingSkeleton size="md" />
          <LoadingProgress progress={50} text="Dark mode progress" />
        </div>
      </div>
    );

    // Take screenshots of all components in dark mode
    await expect(page).toHaveScreenshot('dark-mode-components.png');
  });

  test('Components are accessible', async ({ mount }) => {
    const component = await mount(
      <div>
        <LoadingSpinner size="md" text="Loading..." />
        <LoadingSkeleton size="md" />
        <LoadingProgress progress={50} text="Progress" />
      </div>
    );

    // Check ARIA attributes
    await expect(component.getByRole('progressbar')).toBeVisible();
    await expect(component.getByText('Loading...')).toHaveAttribute('aria-live', 'polite');
    
    // Run accessibility audit
    const violations = await component.evaluate(async (element) => {
      const { default: axe } = await import('axe-core');
      return axe.run(element);
    });
    
    expect(violations.violations).toEqual([]);
  });
}); 