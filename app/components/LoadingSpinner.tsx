interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  fullHeight?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue-500',
  className = '',
  fullHeight = true
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-2',
    lg: 'h-16 w-16 border-3'
  };

  return (
    <div className={`flex justify-center items-center ${fullHeight ? 'min-h-[200px]' : ''} ${className}`}>
      <div 
        className={`animate-spin rounded-full border-t-${color} border-b-${color} ${sizeClasses[size]}`}
        role="status"
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
} 