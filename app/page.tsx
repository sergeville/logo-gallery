import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import Navbar from './components/Navbar';
import LogoCard from './components/LogoCard';
import { Logo } from './lib/models/logo';
import connectDB from './lib/db';

async function getLogos() {
  await connectDB();
  return Logo.find().sort({ uploadedAt: -1 }).limit(12);
}

export default async function Home() {
  const session = await getServerSession();
  const logos = await getLogos();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-heading-1 font-bold text-gray-900">
            Your Logo Gallery
          </h1>
          <p className="text-gray-600">
            Welcome back, {session?.user?.email || 'Guest'}! Here are your logos.
          </p>
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