import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoadingProps {
  type?: 'spinner' | 'skeleton' | 'progress';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  progress?: number;
  isLoading: boolean;
}

export const LoadingSpinner = ({ size = 'md', text }: Pick<LoadingProps, 'size' | 'text'>) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-2"
    >
      <svg
        className={`animate-spin text-primary-600 dark:text-primary-400 ${sizeClasses[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {text}
        </span>
      )}
    </motion.div>
  );
};

export const LoadingSkeleton = ({ size = 'md' }: Pick<LoadingProps, 'size'>) => {
  const sizeClasses = {
    sm: 'h-24 w-24',
    md: 'h-32 w-32',
    lg: 'h-48 w-48'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 ${sizeClasses[size]}`}
    >
      <div className="h-full w-full animate-pulse" />
    </motion.div>
  );
};

export const LoadingProgress = ({ progress = 0, text }: Pick<LoadingProps, 'progress' | 'text'>) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-xs"
    >
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block text-primary-600 dark:text-primary-400">
              {text || 'Loading...'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-primary-600 dark:text-primary-400">
              {Math.round(displayProgress)}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200 dark:bg-primary-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${displayProgress}%` }}
            transition={{ duration: 0.5 }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default function Loading({ type = 'spinner', ...props }: LoadingProps) {
  const components = {
    spinner: LoadingSpinner,
    skeleton: LoadingSkeleton,
    progress: LoadingProgress
  };

  const Component = components[type];
  return <Component {...props} />;
} 