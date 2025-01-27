const LogoCardSkeleton = () => {
  return (
    <div
      data-testid="skeleton-container"
      role="status"
      aria-label="Loading logo card"
      className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
    >
      {/* Image skeleton */}
      <div
        data-testid="skeleton-image"
        className="h-48 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"
      />

      {/* Title skeleton */}
      <div
        data-testid="skeleton-text"
        className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"
      />

      {/* Description skeleton */}
      <div
        data-testid="skeleton-text"
        className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
      />
    </div>
  )
}

export default LogoCardSkeleton 