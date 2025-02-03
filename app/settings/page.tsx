import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authConfig } from '@/lib/auth';
import SettingsForm from '@/components/settings/SettingsForm';

export const metadata: Metadata = {
  title: 'Settings - Logo Gallery',
  description: 'Manage your account settings'
};

export default async function SettingsPage() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect('/auth/signin?callbackUrl=/settings');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Account Settings
          </h1>
          
          <div className="mt-6 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <SettingsForm user={session.user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 