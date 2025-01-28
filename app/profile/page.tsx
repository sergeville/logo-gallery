import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Logo } from '@/app/lib/models/logo';
import { User } from '@/app/lib/models/user';
import dbConnect from '@/app/lib/db-config';
import LogoCard from '@/app/components/LogoCard';

export default async function Profile() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  await dbConnect();
  const userData = await User.findById(session.user.id).select('name email profile').lean();
  const user = userData as unknown as {
    name: string;
    email: string;
    profile?: {
      avatarUrl?: string;
      bio?: string;
    };
  };

  // Convert session.user.id to string
  const userId = session.user.id.toString();
  const logos = await Logo.find({ userId })
    .sort({ createdAt: -1 })
    .lean() as Array<{
      _id: any;
      title: string;
      description: string;
      imageUrl: string;
      userId: string;
      createdAt: Date;
    }>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20">
            <Image
              src={user?.profile?.avatarUrl || '/default-avatar.svg'}
              alt={user?.name || 'User'}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user?.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            {user?.profile?.bio && (
              <p className="text-gray-700 dark:text-gray-300 mt-2">{user.profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">My Logos</h2>
      {logos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">You haven't uploaded any logos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logos.map((logo) => (
            <LogoCard
              key={logo._id.toString()}
              logo={{
                _id: logo._id.toString(),
                title: logo.title,
                description: logo.description,
                imageUrl: logo.imageUrl,
                userId: logo.userId,
                createdAt: logo.createdAt.toISOString()
              }}
              showDelete={true}
            />
          ))}
        </div>
      )}
    </div>
  );
} 