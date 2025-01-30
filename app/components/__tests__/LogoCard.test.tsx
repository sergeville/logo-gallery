import React from 'react';
import { useTheme } from '@/app/components/ThemeProvider';

// Mock DeleteLogoButton component
jest.mock('@/app/components/DeleteLogoButton', () => ({
  __esModule: true,
  default: ({ logoId, onDelete }: { logoId: string; onDelete?: () => void }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const { theme } = useTheme();

    const handleDelete = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      try {
        setIsDeleting(true);
        setError(null);
        
        const response = await fetch(`/api/logos/${logoId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          
          // Handle specific HTTP status codes
          switch (response.status) {
            case 401:
              throw new Error('Unauthorized: Please log in to delete this logo');
            case 403:
              throw new Error('Forbidden: You do not have permission to delete this logo');
            case 404:
              throw new Error('Logo not found');
            case 409:
              throw new Error('Logo is currently in use and cannot be deleted');
            case 429:
              throw new Error('Too many requests. Please try again later');
            case 500:
              throw new Error('Server error occurred. Please try again later');
            default:
              throw new Error(data.message || 'Failed to delete logo');
          }
        }

        setIsOpen(false);
        onDelete?.();
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            setError('Request timed out. Please try again');
          } else if (error.name === 'TypeError') {
            setError('Network error occurred. Please check your connection');
          } else {
            setError(error.message || 'Failed to delete logo');
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsDeleting(false);
        clearTimeout(timeoutId);
      }
    };

    // Cleanup function for unmounting
    React.useEffect(() => {
      return () => {
        setIsOpen(false);
        setIsDeleting(false);
        setError(null);
      };
    }, []);

    return (
      <>
        <button
          data-testid="delete-button"
          onClick={() => setIsOpen(true)}
          className="text-gray-500 hover:text-red-600 transition-colors"
          aria-label="Delete logo"
          type="button"
        >
          Delete
        </button>

        {isOpen && (
          <div 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <div 
              className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4 ${
                isDeleting ? 'opacity-75' : ''
              }`}
            >
              <h3 
                id="dialog-title" 
                className="text-xl font-semibold mb-4 text-gray-900 dark:text-white"
              >
                Delete Logo
              </h3>
              <p 
                id="dialog-description"
                className="text-gray-600 dark:text-gray-300 mb-4"
              >
                Are you sure you want to delete this logo? This action cannot be undone.
              </p>
              {error && (
                <div 
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mb-4" 
                  role="alert"
                  aria-live="polite"
                >
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => {
                    setError(null);
                    setIsOpen(false);
                  }}
                  data-testid="cancel-button"
                  type="button"
                  className={`px-4 py-2 rounded ${
                    theme === 'dark' 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  aria-label="Cancel deletion"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  data-testid="confirm-delete-button"
                  type="button"
                  className={`px-4 py-2 rounded ${
                    isDeleting
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white`}
                  aria-label={isDeleting ? "Deleting logo..." : "Confirm deletion"}
                >
                  {isDeleting ? (
                    <span className="flex items-center gap-2">
                      <svg 
                        className="animate-spin h-4 w-4" 
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          fill="none" 
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                        />
                      </svg>
                      <span>Deleting...</span>
                    </span>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  },
})) 