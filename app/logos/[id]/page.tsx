import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/app/lib/db-config';
import { Logo } from '@/app/lib/models/logo';
import { formatDistanceToNow, parseISO, isValid } from 'date-fns';
import Link from 'next/link';
import LogoImage from '@/app/components/LogoImage';

interface PageProps {
  params: { id: string };
}

export default async function LogoPage({ params }: PageProps) {
  try {
    await dbConnect();
    
    // Validate and sanitize the ID
    const logoId = params.id.toString();
    const logo = await Logo.findById(logoId).lean();

    if (!logo) {
      notFound();
    }

    // Format the date with validation
    let uploadedDate = 'Unknown date';
    try {
      const date = parseISO(logo.createdAt);
      if (isValid(date)) {
        uploadedDate = formatDistanceToNow(date, { addSuffix: true });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }
    
    // Ensure we have the correct base URL for local images
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const fullImageUrl = logo.imageUrl.startsWith('http') 
      ? logo.imageUrl 
      : `${baseUrl}${logo.imageUrl.startsWith('/') ? '' : '/'}${logo.imageUrl}`;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {logo.title}
                </h1>
              </div>
              
              <div className="mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <LogoImage
                  src={fullImageUrl}
                  alt={`Logo: ${logo.title} - ${logo.description}`}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Description
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {logo.description}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Uploaded by
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {logo.ownerName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Uploaded
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {uploadedDate}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        File type
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {logo.fileType}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Dimensions
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {logo.dimensions?.width}x{logo.dimensions?.height}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching logo:', error);
    notFound();
  }
} 