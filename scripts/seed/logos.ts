import { ObjectId } from 'mongodb';

interface LogoVote {
  userId: ObjectId;
  rating: number;
  timestamp: Date;
}

export interface Logo {
  _id: ObjectId;
  name: string;
  url: string;
  description: string;
  userId: ObjectId;
  tags: string[];
  averageRating: number;
  votes: Array<{
    userId: ObjectId;
    rating: number;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface LogoSeedOptions {
  count: number;
  perUser?: number;
  withRatings?: boolean;
  userIds: ObjectId[]; // Required user IDs to associate logos with
  minVotes?: number;
  maxVotes?: number;
}

const SAMPLE_TAGS = [
  'minimalist', 'colorful', 'modern', 'vintage', 'abstract',
  'geometric', 'typography', 'illustration', 'branding', 'tech',
  'creative', 'professional', 'playful', 'elegant', 'bold'
];

const LOGO_STYLES = [
  'Flat', 'Gradient', '3D', 'Hand-drawn', 'Monochrome',
  'Retro', 'Futuristic', 'Classic', 'Dynamic', 'Simple'
];

/**
 * Generates a random set of tags
 */
function generateTags(count: number = 3): string[] {
  const shuffled = [...SAMPLE_TAGS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, SAMPLE_TAGS.length));
}

/**
 * Generates a random logo description
 */
function generateDescription(name: string, style: string, tags: string[]): string {
  return `A ${style.toLowerCase()} logo design for ${name}. Features ${tags.join(', ')} elements.`;
}

/**
 * Generates random votes for a logo
 */
function generateVotes(userIds: ObjectId[], min: number, max: number): LogoVote[] {
  const voteCount = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffledUsers = [...userIds].sort(() => 0.5 - Math.random());
  const voters = shuffledUsers.slice(0, voteCount);

  return voters.map(userId => ({
    userId,
    rating: Math.floor(Math.random() * 5) + 1, // 1-5 rating
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
  }));
}

/**
 * Calculates average rating from votes
 */
function calculateAverageRating(votes: LogoVote[]): number {
  if (votes.length === 0) return 0;
  const sum = votes.reduce((acc, vote) => acc + vote.rating, 0);
  return Number((sum / votes.length).toFixed(2));
}

/**
 * Generates a single logo
 */
function generateLogo(index: number, userId: ObjectId, options: LogoSeedOptions): Logo {
  const style = LOGO_STYLES[Math.floor(Math.random() * LOGO_STYLES.length)];
  const name = `${style} Logo ${index + 1}`;
  const tags = generateTags();
  const votes = options.withRatings 
    ? generateVotes(options.userIds, options.minVotes || 0, options.maxVotes || 5)
    : [];

  return {
    _id: new ObjectId(),
    name,
    url: `https://logo-gallery.com/logos/${index + 1}.png`, // Placeholder URL
    description: generateDescription(name, style, tags),
    userId,
    tags,
    votes,
    averageRating: calculateAverageRating(votes),
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within last 90 days
    updatedAt: new Date()
  };
}

/**
 * Seeds logos into the database
 */
export async function seedLogos(options: LogoSeedOptions): Promise<Logo[]> {
  const logos: Logo[] = [];
  const { userIds, count, perUser = 1 } = options;

  for (let i = 0; i < count; i++) {
    const userId = userIds[Math.floor(i / perUser) % userIds.length];
    const logo = generateLogo(i, userId, options);
    logos.push(logo);
  }

  return logos;
}

/**
 * Creates a test logo with specific attributes
 */
export async function createTestLogo(userId: ObjectId, overrides: Partial<Logo> = {}): Promise<Logo> {
  const defaultLogo = generateLogo(0, userId, { count: 1, userIds: [userId] });
  return { ...defaultLogo, ...overrides };
}

// Example usage:
// const logos = await seedLogos({ count: 10, userIds: existingUserIds, withRatings: true });
// const testLogo = await createTestLogo(userId, { name: 'Custom Logo' }); 