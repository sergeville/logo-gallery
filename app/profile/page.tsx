import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Logo } from '@/app/lib/models/logo';
import { User } from '@/app/lib/models/user';
import dbConnect from '@/app/lib/db-config';
import LogoCard from '@/app/components/LogoCard';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  const logos = await Logo.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Profile
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
          </div>

          {/* My Logos Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              My Logos
            </h2>
            {logos.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                You haven't uploaded any logos yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {logos.map((logo) => (
                  <LogoCard
                    key={logo._id.toString()}
                    logo={logo}
                    showStats={true}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Upload Statistics */}
          {logos.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Upload Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Logos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {logos.length}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Space Saved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {logos.reduce((acc, logo) => {
                      const saved = (logo.fileSize || 0) - (logo.optimizedSize || 0);
                      return acc + saved;
                    }, 0) / (1024 * 1024).toFixed(2)}MB
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Compression</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(logos.reduce((acc, logo) => {
                      const ratio = logo.compressionRatio ? parseFloat(logo.compressionRatio) : 0;
                      return acc + ratio;
                    }, 0) / logos.length).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 