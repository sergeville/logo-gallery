import LogoGallery from './components/LogoGallery';

// Sample logo data with correct interface structure
const sampleLogos = [
  {
    _id: '1',
    title: 'Next.js',
    description: 'The React Framework for Production',
    imageUrl: '/logos/next.svg',
    thumbnailUrl: '/logos/next.svg',
    userId: 'system',
    createdAt: new Date().toISOString(),
    totalVotes: 42,
    fileSize: 1024,
    optimizedSize: 512,
    compressionRatio: '50%'
  },
  {
    _id: '2',
    title: 'Vercel',
    description: 'Develop. Preview. Ship.',
    imageUrl: '/logos/vercel.svg',
    thumbnailUrl: '/logos/vercel.svg',
    userId: 'system',
    createdAt: new Date().toISOString(),
    totalVotes: 38,
    fileSize: 2048,
    optimizedSize: 1024,
    compressionRatio: '50%'
  },
  {
    _id: '3',
    title: 'Sample Logo 1',
    description: 'A beautiful sample logo',
    imageUrl: '/logos/sample-logo.png',
    thumbnailUrl: '/logos/sample-logo.png',
    userId: 'system',
    createdAt: new Date().toISOString(),
    totalVotes: 25,
    fileSize: 4096,
    optimizedSize: 2048,
    compressionRatio: '50%'
  },
  {
    _id: '4',
    title: 'Sample Logo 2',
    description: 'Another beautiful sample logo',
    imageUrl: '/logos/sample-logo-2.png',
    thumbnailUrl: '/logos/sample-logo-2.png',
    userId: 'system',
    createdAt: new Date().toISOString(),
    totalVotes: 19,
    fileSize: 3072,
    optimizedSize: 1536,
    compressionRatio: '50%'
  },
  {
    _id: '5',
    title: 'Test Logo 1',
    description: 'First test logo',
    imageUrl: '/logos/test-logo-1.png',
    thumbnailUrl: '/logos/test-logo-1.png',
    userId: 'system',
    createdAt: new Date().toISOString(),
    totalVotes: 15,
    fileSize: 5120,
    optimizedSize: 2560,
    compressionRatio: '50%'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" data-testid="home-container">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="main-content">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Logo Gallery
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover and share beautiful logos from around the world
          </p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Featured Logos
          </h2>
        </div>

        <LogoGallery logos={sampleLogos} className="mt-8" />
      </main>
    </div>
  );
}