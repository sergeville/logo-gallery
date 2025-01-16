export default function LogoCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="relative aspect-square bg-gray-200 dark:bg-gray-700" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          {/* Title skeleton */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          {/* Tag skeleton */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
        </div>

        {/* Rating skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
            ))}
          </div>
          {/* Vote count skeleton */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>

        {/* Date skeleton */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </div>
    </div>
  )
} 