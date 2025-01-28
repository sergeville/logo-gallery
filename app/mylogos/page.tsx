import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Logo } from '@/app/lib/models/logo';
import dbConnect from '@/app/lib/db-config';
import LogoCard from '@/app/components/LogoCard';

// Helper function to safely convert dates
function safeISOString(date: any): string {
  if (!date) return new Date().toISOString();
  try {
    const d = new Date(date);
    return !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

export default async function MyLogos() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  try {
    await dbConnect();
    const logos = await Logo.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Transform MongoDB documents to match LogoCard interface exactly
    const transformedLogos = logos.map(logo => ({
      _id: logo._id?.toString() || '',
      title: logo.title || '',
      description: logo.description || '',
      imageUrl: logo.imageUrl || '',
      userId: logo.userId || '',
      createdAt: safeISOString(logo.createdAt)
    }));

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">My Logos</h1>
        {transformedLogos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">You haven't uploaded any logos yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformedLogos.map((logo) => (
              <LogoCard
                key={logo._id}
                logo={logo}
                showDelete={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching logos:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">My Logos</h1>
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">Error loading logos. Please try again later.</p>
        </div>
      </div>
    );
  }
} 