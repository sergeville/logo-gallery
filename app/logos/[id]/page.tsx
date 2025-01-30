import { use } from 'react';
import { Logo } from '@/app/lib/models/logo';
import dbConnect from '@/app/lib/db-config';
import LogoCard from '@/app/components/LogoCard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LogoDetailPage({ params }: PageProps) {
  const { id } = use(params);

  try {
    dbConnect();
    const logo = Logo.findById(id).lean();

    if (!logo) {
      return (
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Logo not found</h1>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <LogoCard logo={logo} showStats={true} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching logo:', error);
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Error loading logo</h1>
      </div>
    );
  }
} 