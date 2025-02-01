import Loading from '../components/LoadingStates';

export default function TestLoadingPage() {
  return (
    <div className="min-h-screen p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-8">Loading States Test Page</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Spinner Variants</h2>
        <div className="flex gap-8 items-center">
          <div data-testid="loading-spinner">
            <Loading type="spinner" size="sm" text="Small Spinner" isLoading={true} />
          </div>
          <div>
            <Loading type="spinner" size="md" text="Medium Spinner" isLoading={true} />
          </div>
          <div>
            <Loading type="spinner" size="lg" text="Large Spinner" isLoading={true} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Skeleton Variants</h2>
        <div className="flex gap-8 items-center" data-testid="loading-skeleton">
          <Loading type="skeleton" size="sm" isLoading={true} />
          <Loading type="skeleton" size="md" isLoading={true} />
          <Loading type="skeleton" size="lg" isLoading={true} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Progress Variants</h2>
        <div className="space-y-4" data-testid="loading-progress">
          <Loading 
            type="progress" 
            progress={25} 
            text="Uploading files..." 
            isLoading={true}
          />
          <Loading 
            type="progress" 
            progress={50} 
            text="Processing images..." 
            isLoading={true}
          />
          <Loading 
            type="progress" 
            progress={75} 
            text="Optimizing..." 
            isLoading={true}
          />
          <Loading 
            type="progress" 
            progress={100} 
            text="Complete!" 
            isLoading={true}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Interactive Demo</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={() => document.documentElement.classList.toggle('dark')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
            >
              Toggle Dark Mode
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 