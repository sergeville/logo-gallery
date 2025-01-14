import { ObjectId } from 'mongodb';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { User, Logo, Comment, Collection, Favorite } from './types';

export const DEFAULT_PASSWORD = 'password123';
export const SAMPLE_TAGS = ['modern', 'minimal', 'bold', 'colorful', 'abstract'];
export const COLLECTION_TAGS = ['favorites', 'inspiration', 'work', 'personal'];

export async function seedUsers(options: { count: number; withProfiles?: boolean; roles?: ('admin' | 'user')[] }): Promise<User[]> {
const users: User[] = [];
const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
const now = new Date();

for (let i = 0; i < options.count; i++) {
    const user: User = {
    _id: new ObjectId(),
    email: faker.internet.email().toLowerCase(),
    username: faker.internet.username(),
    password: hashedPassword,
    role: options.roles ? options.roles[i % options.roles.length] : 'user',
    createdAt: now,
    profile: options.withProfiles || options.roles?.includes('admin') ? {
        bio: faker.lorem.paragraph(),
        location: faker.location.city(),
        skills: Array.from({ length: 3 }, () => faker.hacker.verb())
    } : undefined
    };

    users.push(user);
}

return users;
}

export async function seedLogos(options: { count: number; userIds: ObjectId[]; withRatings?: boolean; minVotes?: number; maxVotes?: number; perUser?: number }): Promise<Logo[]> {
  const logos: Logo[] = [];
  const { userIds, withRatings, minVotes = 5, maxVotes = 20, perUser, count } = options;
  const now = new Date();

  if (perUser) {
    // Distribute logos evenly among users
    const totalLogos = Math.min(count, userIds.length * perUser);
    const usersNeeded = Math.ceil(totalLogos / perUser);
    
    for (let i = 0; i < totalLogos; i++) {
      const userId = userIds[Math.floor(i / perUser) % usersNeeded];
      const logo = createLogo(userId, withRatings, minVotes, maxVotes, now);
      logos.push(logo);
    }
  } else {
    // Create random logos
    for (let i = 0; i < count; i++) {
      const userId = userIds[i % userIds.length];
      const logo = createLogo(userId, withRatings, minVotes, maxVotes, now);
      logos.push(logo);
    }
  }

  return logos;
}

function createLogo(userId: ObjectId, withRatings?: boolean, minVotes?: number, maxVotes?: number, now: Date = new Date()): Logo {
  const name = `${faker.company.name()} Logo`;
  const tags = Array.from(
    { length: faker.number.int({ min: 1, max: 5 }) },
    () => SAMPLE_TAGS[faker.number.int({ min: 0, max: SAMPLE_TAGS.length - 1 })]
  );

  const logo: Logo = {
    _id: new ObjectId(),
    userId,
    name,
    tags,
    description: `A ${tags.join(', ')} logo design for ${name}`,
    createdAt: now
  };

  if (withRatings) {
    const votes = Array.from({ length: faker.number.int({ min: minVotes || 5, max: maxVotes || 20 }) }, () => ({
      userId: new ObjectId(),
      rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 })
    }));
    logo.votes = votes;
    logo.averageRating = votes.reduce((acc, v) => acc + v.rating, 0) / votes.length;
  }

  return logo;
}

export async function seedComments(options: { users: User[]; logos: Logo[]; commentsPerLogo?: number; maxRepliesPerComment?: number; commentMentions?: boolean; maxLikesPerComment?: number }): Promise<Comment[]> {
  const comments: Comment[] = [];
  const { users, logos, commentsPerLogo = 3, maxRepliesPerComment = 2, commentMentions = false, maxLikesPerComment = 10 } = options;

  for (const logo of logos) {
    for (let i = 0; i < commentsPerLogo; i++) {
      const user = users[faker.number.int({ min: 0, max: users.length - 1 })];
      const comment = createComment(logo._id, user._id, undefined, commentMentions ? users : undefined, maxLikesPerComment);
      comments.push(comment);

      // Add replies if there's room in the commentsPerLogo limit
      if (maxRepliesPerComment > 0 && i + 1 < commentsPerLogo) {
        let parentComment = comment;
        const remainingComments = commentsPerLogo - (i + 1);
        const maxReplies = Math.min(maxRepliesPerComment, remainingComments);
        
        for (let depth = 0; depth < maxReplies; depth++) {
          const replyUser = users[faker.number.int({ min: 0, max: users.length - 1 })];
          const reply = createComment(logo._id, replyUser._id, parentComment._id, commentMentions ? users : undefined, maxLikesPerComment);
          comments.push(reply);
          parentComment = reply;
          i++; // Increment i to account for the reply
        }
      }
    }
  }

  return comments;
}

function createComment(logoId: ObjectId, userId: ObjectId, parentId?: ObjectId, mentionUsers?: User[], maxLikes: number = 10): Comment {
  const comment: Comment = {
    _id: new ObjectId(),
    logoId,
    userId,
    content: faker.lorem.sentence(),
    createdAt: new Date(),
    likes: faker.number.int({ min: 0, max: maxLikes })
  };

  if (parentId) {
    comment.parentId = parentId;
  }

  if (mentionUsers && mentionUsers.length > 0) {
    // Always include the first user and optionally add more mentions
    const additionalMentions = faker.number.int({ min: 0, max: Math.min(2, mentionUsers.length - 1) });
    const selectedUsers = [mentionUsers[0]];
    if (additionalMentions > 0) {
      const otherUsers = faker.helpers.arrayElements(
        mentionUsers.slice(1),
        additionalMentions
      );
      selectedUsers.push(...otherUsers);
    }
    const mentions = selectedUsers.map(u => u._id);
    comment.mentions = mentions;
    // Add mentions to the content
    const mentionText = selectedUsers.map(u => `@${u._id.toString()}`).join(' ');
    comment.content = `${mentionText} ${comment.content}`;
  }

  return comment;
}

export async function seedCollections(options: { users: User[]; logos: Logo[]; collectionsPerUser?: number; logosPerCollection?: number; collectionTags?: boolean; sharedCollections?: boolean }): Promise<Collection[]> {
  const collections: Collection[] = [];
  const { users, logos, collectionsPerUser = 2, logosPerCollection = 5, collectionTags = false, sharedCollections = false } = options;

  for (const user of users) {
    for (let i = 0; i < collectionsPerUser; i++) {
      const collection = createCollection(user._id, logos, logosPerCollection, collectionTags, sharedCollections ? users.filter(u => !u._id.equals(user._id)) : undefined);
      collections.push(collection);
    }
  }

  return collections;
}

function createCollection(userId: ObjectId, availableLogos: Logo[], maxLogos: number, withTags: boolean = false, shareUsers?: User[]): Collection {
  const selectedLogos = faker.helpers.arrayElements(availableLogos, faker.number.int({ min: 1, max: maxLogos }));
  
  const collection: Collection = {
    _id: new ObjectId(),
    userId,
    name: `${faker.word.adjective()} ${faker.word.noun()} Collection`,
    logos: selectedLogos.map(l => l._id),
    createdAt: new Date(),
    isPublic: faker.datatype.boolean()
  };

  if (withTags) {
    collection.tags = faker.helpers.arrayElements(COLLECTION_TAGS, faker.number.int({ min: 1, max: 3 }));
  }

  if (shareUsers && shareUsers.length > 0) {
    const shareCount = faker.number.int({ min: 1, max: Math.min(3, shareUsers.length) });
    const collaborators = faker.helpers.arrayElements(shareUsers, shareCount).map(u => u._id);
    collection.collaborators = collaborators;
  }

  return collection;
}

export async function seedFavorites(options: { users: User[]; logos: Logo[]; favoritesPerUser?: number }): Promise<Favorite[]> {
  const favorites: Favorite[] = [];
  const { users, logos, favoritesPerUser = 5 } = options;

  for (const user of users) {
    const userFavorites = faker.helpers.arrayElements(logos, faker.number.int({ min: 1, max: favoritesPerUser }));
    for (const logo of userFavorites) {
      favorites.push({
        _id: new ObjectId(),
        userId: user._id,
        logoId: logo._id,
        createdAt: new Date()
      });
    }
  }

  return favorites;
}

export async function createTestUser(overrides?: Partial<User>): Promise<User> {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const user: User = {
    _id: new ObjectId(),
    email: faker.internet.email().toLowerCase(),
    username: faker.internet.username(),
    password: hashedPassword,
    role: 'user',
    createdAt: new Date(),
    profile: {
      bio: faker.lorem.paragraph(),
      location: faker.location.city(),
      skills: Array.from({ length: 3 }, () => faker.hacker.verb())
    },
    ...overrides
  };

  return user;
}

export async function createTestLogo(userId: ObjectId, overrides?: Partial<Logo>): Promise<Logo> {
  const name = overrides?.name || `${faker.company.name()} Logo`;
  const tags = Array.from(
    { length: faker.number.int({ min: 1, max: 5 }) },
    () => SAMPLE_TAGS[faker.number.int({ min: 0, max: SAMPLE_TAGS.length - 1 })]
  );

  const logo: Logo = {
    _id: new ObjectId(),
    userId,
    name,
    tags,
    description: `A ${tags.join(', ')} logo design for ${name}`,
    createdAt: new Date(),
    ...overrides
  };

  return logo;
} 