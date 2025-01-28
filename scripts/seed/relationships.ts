import { ObjectId } from 'mongodb';

export interface Comment {
  _id: ObjectId;
  logoId: ObjectId;
  userId: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  replies?: Comment[];
  parentId?: ObjectId;
}

export interface Collection {
  _id: ObjectId;
  name: string;
  description: string;
  userId: ObjectId;
  logos: ObjectId[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  collaborators?: ObjectId[];
}

interface RelationshipSeedOptions {
  users: { _id: ObjectId }[];
  logos: { _id: ObjectId }[];
  commentsPerLogo?: number;
  collectionsPerUser?: number;
  logosPerCollection?: number;
  maxRepliesPerComment?: number;
  maxLikesPerComment?: number;
  commentMentions?: boolean;
  collectionTags?: boolean;
  sharedCollections?: boolean;
}

const SAMPLE_COMMENTS = [
  'Great design! Love the color scheme.',
  'The typography works really well here.',
  'Clean and professional looking.',
  'Very creative approach!',
  'Interesting use of negative space.',
  'The balance is perfect.',
  'Modern and sleek design.',
  'This would work well across different mediums.',
  'Bold choice of elements.',
  'The concept is very innovative.'
];

const COLLECTION_NAMES = [
  'Design Inspiration',
  'Client Projects',
  'Modern Logos',
  'Minimalist Collection',
  'Color Studies',
  'Typography Focus',
  'Brand Identity',
  'Creative Concepts',
  'Portfolio Picks',
  'Project Archive'
];

const COLLECTION_TAGS = [
  'client-work', 'inspiration', 'portfolio', 'work-in-progress',
  'archived', 'featured', 'case-study', 'branding'
];

const COMMENT_TEMPLATES = [
  'Hey @{user}, {comment}',
  'Agree with @{user}! {comment}',
  '@{user} What do you think about {comment}',
  'Thanks @{user}! {comment}'
];

/**
 * Generates a comment with optional user mentions
 */
function generateCommentContent(users: { _id: ObjectId }[], useMentions: boolean): string {
  const baseComment = SAMPLE_COMMENTS[Math.floor(Math.random() * SAMPLE_COMMENTS.length)];
  
  if (!useMentions) return baseComment;
  
  const template = COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)];
  const mentionedUser = users[Math.floor(Math.random() * users.length)];
  return template.replace('{user}', mentionedUser._id.toString())
                .replace('{comment}', baseComment);
}

/**
 * Generates a random set of collection tags
 */
function generateCollectionTags(count: number = 2): string[] {
  const shuffled = [...COLLECTION_TAGS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, COLLECTION_TAGS.length));
}

/**
 * Generates a comment with enhanced features
 */
function generateComment(
  userId: ObjectId,
  logoId: ObjectId,
  options: RelationshipSeedOptions,
  parentId?: ObjectId
): Comment {
  const content = generateCommentContent(options.users, options.commentMentions || false);
  const maxLikes = options.maxLikesPerComment || 50;
  
  return {
    _id: new ObjectId(),
    logoId,
    userId,
    content,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    likes: Math.floor(Math.random() * maxLikes),
    ...(parentId && { parentId })
  };
}

/**
 * Generates a collection with enhanced features
 */
function generateCollection(
  userId: ObjectId,
  logoIds: ObjectId[],
  options: RelationshipSeedOptions
): Collection {
  const name = COLLECTION_NAMES[Math.floor(Math.random() * COLLECTION_NAMES.length)];
  const tags = options.collectionTags ? generateCollectionTags() : [];
  const collaborators = options.sharedCollections ? 
    options.users
      .filter(u => !u._id.equals(userId))
      .slice(0, 2)
      .map(u => u._id) : 
    [];

  return {
    _id: new ObjectId(),
    name,
    description: `A curated collection of ${logoIds.length} logos`,
    userId,
    logos: logoIds,
    tags,
    collaborators,
    isPublic: Math.random() > 0.3,
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  };
}

/**
 * Seeds comments with enhanced features
 */
export async function seedComments(options: RelationshipSeedOptions): Promise<Comment[]> {
  const comments: Comment[] = [];
  const commentsPerLogo = options.commentsPerLogo || 3;
  const maxReplies = options.maxRepliesPerComment || 2;

  for (const logo of options.logos) {
    for (let i = 0; i < commentsPerLogo; i++) {
      const userId = options.users[Math.floor(Math.random() * options.users.length)]._id;
      const comment = generateComment(userId, logo._id, options);
      comments.push(comment);

      // Generate replies
      const replyCount = Math.floor(Math.random() * maxReplies);
      for (let j = 0; j < replyCount; j++) {
        const replyUserId = options.users[Math.floor(Math.random() * options.users.length)]._id;
        const reply = generateComment(replyUserId, logo._id, options, comment._id);
        comments.push(reply);
      }
    }
  }

  return comments;
}

/**
 * Seeds collections for users
 */
export async function seedCollections(options: RelationshipSeedOptions): Promise<Collection[]> {
  const collections: Collection[] = [];
  const collectionsPerUser = options.collectionsPerUser || 2;
  const logosPerCollection = options.logosPerCollection || 5;

  for (const user of options.users) {
    for (let i = 0; i < collectionsPerUser; i++) {
      // Randomly select logos for the collection
      const shuffledLogos = [...options.logos].sort(() => 0.5 - Math.random());
      const selectedLogoIds = shuffledLogos
        .slice(0, Math.min(logosPerCollection, shuffledLogos.length))
        .map(logo => logo._id);

      const collection = generateCollection(user._id, selectedLogoIds, options);
      collections.push(collection);
    }
  }

  return collections;
}

/**
 * Seeds all relationships
 */
export async function seedRelationships(options: RelationshipSeedOptions): Promise<{
  comments: Comment[];
  collections: Collection[];
}> {
  const [comments, collections] = await Promise.all([
    seedComments(options),
    seedCollections(options)
  ]);

  return { comments, collections };
}

// Example usage with new features:
// const relationships = await seedRelationships({
//   users: existingUsers,
//   logos: existingLogos,
//   commentsPerLogo: 3,
//   collectionsPerUser: 2,
//   commentMentions: true,
//   collectionTags: true,
//   sharedCollections: true
// }); 