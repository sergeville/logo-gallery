import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/options';
import Navbar from './components/Navbar';
import LogoCard from './components/LogoCard';
import { Logo } from './lib/models/logo';
import connectDB from './lib/db';

async function getLogos() {
  await connectDB();
  return Logo.find().sort({ uploadedAt: -1 }).limit(12);
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const logos = await getLogos();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Logo Gallery
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover and share beautiful logos from around the world
          </p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Latest Uploads
          </h2>
          {session?.user ? (
            <p className="text-gray-600 dark:text-gray-300">
              Welcome back, {session.user.name || 'User'}!
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to upload and vote on logos
            </p>
          )}
        </div>

        <Suspense fallback={<div>Loading logos...</div>}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logos.map((logo) => (
              <LogoCard
                key={logo._id.toString()}
                name={logo.name}
                imageUrl={logo.imageUrl}
                uploadedAt={logo.uploadedAt}
                rating={logo.averageRating}
                totalVotes={logo.totalVotes}
              />
            ))}
          </div>
        </Suspense>
      </main>
    </div>
  );
}