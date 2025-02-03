import { ObjectId } from 'mongodb';
import { connectToDatabase } from './db-config';

interface ViewEvent {
  _id: string;
  logoId: string;
  userId: string;
  timestamp: string;
}

interface DownloadEvent {
  _id: string;
  logoId: string;
  userId: string;
  timestamp: string;
}

interface UserMetrics {
  totalComments: number;
  totalVotes: number;
  lastActive: string;
}

interface TagStats {
  tag: string;
  count: number;
}

interface CreatorStats {
  userId: string;
  username: string;
  totalLogos: number;
  totalViews: number;
}

interface DailyStats {
  date: string;
  uploads: number;
  comments: number;
  votes: number;
  downloads: number;
}

export async function trackLogoView(logoId: string, userId: string) {
  const db = await connectToDatabase();
  const view = {
    logoId,
    userId,
    timestamp: new Date().toISOString(),
  };
  
  await db.collection('views').insertOne(view);
  return { status: 200, view };
}

export async function getLogoViewStats(logoId: string) {
  const db = await connectToDatabase();
  const views = await db.collection('views').find({ logoId }).toArray();
  
  const uniqueViewers = new Set(views.map(view => view.userId)).size;
  const viewsByDate = views.reduce((acc: { [key: string]: number }, view) => {
    const date = view.timestamp.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return {
    status: 200,
    totalViews: views.length,
    uniqueViewers,
    viewsByDate,
  };
}

export async function trackDownload(logoId: string, userId: string) {
  const db = await connectToDatabase();
  const download = {
    logoId,
    userId,
    timestamp: new Date().toISOString(),
  };
  
  await db.collection('downloads').insertOne(download);
  return { status: 200, download };
}

export async function getDownloadStats(logoId: string) {
  const db = await connectToDatabase();
  const downloads = await db.collection('downloads').find({ logoId }).toArray();
  
  const uniqueDownloaders = new Set(downloads.map(download => download.userId)).size;
  const downloadsByDate = downloads.reduce((acc: { [key: string]: number }, download) => {
    const date = download.timestamp.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return {
    status: 200,
    totalDownloads: downloads.length,
    uniqueDownloaders,
    downloadsByDate,
  };
}

export async function getUserEngagementMetrics(userId: string) {
  const db = await connectToDatabase();
  
  const comments = await db.collection('comments').find({ userId }).toArray();
  const votes = await db.collection('votes').find({ userId }).toArray();
  
  const activities = [...comments, ...votes];
  const lastActive = activities.length > 0 
    ? activities.reduce((latest, current) => {
        const currentDate = new Date(current.createdAt || current.timestamp);
        return currentDate > latest ? currentDate : latest;
      }, new Date(0)).toISOString()
    : null;

  const metrics: UserMetrics = {
    totalComments: comments.length,
    totalVotes: votes.length,
    lastActive,
  };

  return { status: 200, metrics };
}

export async function getPopularTags(options: { timeframe: string; limit: number }) {
  const db = await connectToDatabase();
  const { timeframe, limit } = options;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeframe));
  
  const logos = await db.collection('logos')
    .find({ createdAt: { $gte: startDate.toISOString() } })
    .toArray();
  
  const tagCounts = logos.reduce((acc: { [key: string]: number }, logo) => {
    logo.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});

  const tags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return { status: 200, tags };
}

export async function getTopCreators(options: { timeframe: string; limit: number }) {
  const db = await connectToDatabase();
  const { timeframe, limit } = options;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeframe));
  
  const creators = await db.collection('users')
    .aggregate([
      {
        $lookup: {
          from: 'logos',
          localField: '_id',
          foreignField: 'userId',
          as: 'logos'
        }
      },
      {
        $lookup: {
          from: 'views',
          localField: 'logos._id',
          foreignField: 'logoId',
          as: 'views'
        }
      },
      {
        $project: {
          username: 1,
          totalLogos: { $size: '$logos' },
          totalViews: { $size: '$views' }
        }
      },
      {
        $sort: { totalViews: -1 }
      },
      {
        $limit: limit
      }
    ]).toArray();

  return { status: 200, creators };
}

export async function getDailyActivityStats() {
  const db = await connectToDatabase();
  const today = new Date().toISOString().split('T')[0];
  
  const [uploads, comments, votes, downloads] = await Promise.all([
    db.collection('logos').countDocuments({ 
      createdAt: { $gte: `${today}T00:00:00.000Z`, $lt: `${today}T23:59:59.999Z` }
    }),
    db.collection('comments').countDocuments({ 
      createdAt: { $gte: `${today}T00:00:00.000Z`, $lt: `${today}T23:59:59.999Z` }
    }),
    db.collection('votes').countDocuments({ 
      createdAt: { $gte: `${today}T00:00:00.000Z`, $lt: `${today}T23:59:59.999Z` }
    }),
    db.collection('downloads').countDocuments({ 
      timestamp: { $gte: `${today}T00:00:00.000Z`, $lt: `${today}T23:59:59.999Z` }
    })
  ]);

  const stats: DailyStats = {
    date: today,
    uploads,
    comments,
    votes,
    downloads
  };

  return { status: 200, stats };
} 