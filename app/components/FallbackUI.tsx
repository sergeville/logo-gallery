import { ExclamationTriangleIcon, WifiIcon, ShieldExclamationIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface FallbackProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export const GenericFallback = ({ title, message, icon, action }: FallbackProps) => (
  <motion.div
    {...fadeIn}
    className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg"
  >
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 text-red-500">
        {icon || <ExclamationTriangleIcon className="h-6 w-6" />}
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </div>
    {action && (
      <button
        onClick={action.onClick}
        className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
      >
        {action.label}
      </button>
    )}
  </motion.div>
);

export const NetworkErrorFallback = ({ onRetry }: { onRetry: () => void }) => (
  <GenericFallback
    title="Connection Error"
    message="Please check your internet connection and try again."
    icon={<WifiIcon className="h-6 w-6" />}
    action={{ label: "Retry Connection", onClick: onRetry }}
  />
);

export const AuthErrorFallback = ({ onLogin }: { onLogin: () => void }) => (
  <GenericFallback
    title="Authentication Required"
    message="Please sign in to access this content."
    icon={<ShieldExclamationIcon className="h-6 w-6" />}
    action={{ label: "Sign In", onClick: onLogin }}
  />
);

export const ImageErrorFallback = ({ onRetry }: { onRetry: () => void }) => (
  <GenericFallback
    title="Image Load Error"
    message="Failed to load the image. Please try again."
    icon={<PhotoIcon className="h-6 w-6" />}
    action={{ label: "Reload Image", onClick: onRetry }}
  />
);

export const LoadingFallback = () => (
  <motion.div
    {...fadeIn}
    className="animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800 p-6"
  >
    <div className="flex items-center gap-4">
      <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  </motion.div>
); 