/**
 * Shared Test Patterns
 * 
 * This file contains reusable test patterns and utilities for common testing scenarios
 * across the Logo Gallery application. These patterns help maintain consistency and
 * reduce duplication in our test suites.
 */

import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

/**
 * Modal Testing Patterns
 */
export const modalTestPatterns = {
  // Verify modal opens and closes correctly
  verifyModalBehavior: async (openButtonTestId: string, modalRole = 'dialog') => {
    // Open modal
    const openButton = screen.getByTestId(openButtonTestId);
    fireEvent.click(openButton);
    expect(screen.getByRole(modalRole)).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByTestId('cancel-button');
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole(modalRole)).not.toBeInTheDocument();
    });
  },

  // Test modal accessibility features
  verifyModalAccessibility: (modalRole = 'dialog') => {
    const modal = screen.getByRole(modalRole);
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby');
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  }
};

/**
 * Form Testing Patterns
 */
export const formTestPatterns = {
  // Fill out a form with given field values
  fillForm: async (fields: { [key: string]: string }) => {
    for (const [fieldName, value] of Object.entries(fields)) {
      const input = screen.getByLabelText(fieldName);
      await userEvent.type(input, value);
    }
  },

  // Verify form validation messages
  verifyValidation: async (submitButtonTestId: string, expectedErrors: string[]) => {
    const submitButton = screen.getByTestId(submitButtonTestId);
    fireEvent.click(submitButton);
    
    for (const error of expectedErrors) {
      expect(await screen.findByText(error)).toBeInTheDocument();
    }
  }
};

/**
 * Image Testing Patterns
 */
export const imageTestPatterns = {
  // Verify image loading states
  verifyImageLoadingStates: async (imageTestId: string) => {
    // Loading state
    expect(screen.getByTestId(`${imageTestId}-loading`)).toBeInTheDocument();
    
    // Loaded state
    const image = await screen.findByTestId(imageTestId);
    expect(image).toBeInTheDocument();
    expect(screen.queryByTestId(`${imageTestId}-loading`)).not.toBeInTheDocument();
  },

  // Verify image error state
  verifyImageErrorState: async (imageTestId: string, errorMessage: string) => {
    const errorElement = await screen.findByTestId(`${imageTestId}-error`);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent(errorMessage);
  }
};

/**
 * Theme Testing Patterns
 */
export const themeTestPatterns = {
  // Verify component appearance in both light and dark modes
  verifyThemeStyles: (elementTestId: string, themeClasses: { light: string; dark: string }) => {
    const element = screen.getByTestId(elementTestId);
    
    // Light mode
    expect(element).toHaveClass(themeClasses.light);
    
    // Dark mode
    act(() => {
      document.documentElement.classList.add('dark');
    });
    expect(element).toHaveClass(themeClasses.dark);
    
    // Cleanup
    act(() => {
      document.documentElement.classList.remove('dark');
    });
  }
};

/**
 * Authentication Testing Patterns
 */
export const authTestPatterns = {
  // Verify component behavior based on authentication state
  verifyAuthBehavior: async (
    authenticatedElements: string[],
    unauthenticatedElements: string[]
  ) => {
    // Authenticated state
    for (const element of authenticatedElements) {
      expect(screen.getByTestId(element)).toBeInTheDocument();
    }
    
    // Unauthenticated state
    for (const element of unauthenticatedElements) {
      expect(screen.queryByTestId(element)).not.toBeInTheDocument();
    }
  }
};

/**
 * API Testing Patterns
 */
export const apiTestPatterns = {
  // Mock API response with loading and error states
  mockApiResponse: async <T>(
    promise: Promise<T>,
    loadingTestId: string,
    successTestId: string,
    errorTestId?: string
  ) => {
    // Loading state
    expect(screen.getByTestId(loadingTestId)).toBeInTheDocument();
    
    try {
      const result = await promise;
      // Success state
      expect(screen.getByTestId(successTestId)).toBeInTheDocument();
      expect(screen.queryByTestId(loadingTestId)).not.toBeInTheDocument();
      return result;
    } catch (error) {
      // Error state
      if (errorTestId) {
        expect(screen.getByTestId(errorTestId)).toBeInTheDocument();
        expect(screen.queryByTestId(loadingTestId)).not.toBeInTheDocument();
      }
      throw error;
    }
  }
}; 