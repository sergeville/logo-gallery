import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Logo } from '@/app/lib/models/logo';
import dbConnect from '@/app/lib/db-config';
import { formatDistanceToNow } from 'date-fns';
import LogoImage from '@/app/components/LogoImage';
import DeleteLogoButton from '@/app/components/DeleteLogoButton';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function LogoPage({ params }: PageProps) {
  await dbConnect();
  const logo = await Logo.findById(params.id).lean();

  if (!logo) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.id === logo.userId;
  const uploadedDate = formatDistanceToNow(new Date(logo.uploadedAt || logo.createdAt), {
    addSuffix: true,
  });

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {logo.title}
              </h1>
              {isOwner && <DeleteLogoButton logoId={logo._id.toString()} />}
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image section */}
              <div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <LogoImage
                    src={logo.imageUrl}
                    alt={`Logo: ${logo.title} - ${logo.description}`}
                    responsiveUrls={logo.responsiveUrls}
                    priority
                  />
                </div>

                {/* Image optimization info */}
                {logo.fileSize && logo.optimizedSize && (
                  <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Image Optimization
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Original Size:</span>
                        <br />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatFileSize(logo.fileSize)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Optimized Size:</span>
                        <br />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatFileSize(logo.optimizedSize)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Format:</span>
                        <br />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {logo.fileType.split('/')[1].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Space Saved:</span>
                        <br />
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {logo.compressionRatio}%
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500 dark:text-gray-400">Dimensions:</span>
                        <br />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {logo.dimensions?.width} × {logo.dimensions?.height} pixels
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Info section */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
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
                        Total Votes
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {logo.totalVotes || 0}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Responsive Sizes
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {logo.responsiveUrls ? Object.keys(logo.responsiveUrls).length : 0} variants
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 