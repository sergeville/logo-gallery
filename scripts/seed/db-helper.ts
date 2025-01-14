import { MongoClient, Db, ObjectId } from 'mongodb';
import { User, Logo, Comment, Collection, Favorite, Relationships } from './types';
import { faker } from '@faker-js/faker';

export class DatabaseHelper {
  private client: MongoClient;
  public db!: Db;

  // Centralized validation constants
  private static readonly VALIDATION_RULES = {
    user: {
      USERNAME_MIN_LENGTH: 3,
      USERNAME_MAX_LENGTH: 50,
      USERNAME_PATTERN: /^[a-zA-Z0-9\-_]+$/,
      EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      BIO_MAX_LENGTH: 500,
      LOCATION_MAX_LENGTH: 100,
      MAX_SKILLS: 20,
      SKILL_MAX_LENGTH: 30,
      ALLOWED_PROFILE_FIELDS: ['bio', 'location', 'skills'] as const
    },
    logo: {
      NAME_MIN_LENGTH: 3,
      NAME_MAX_LENGTH: 100,
      NAME_PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
      TAG_MAX_LENGTH: 30,
      TAG_MIN_LENGTH: 2,
      TAG_PATTERN: /^[a-zA-Z0-9\-_]+$/,
      DESCRIPTION_MAX_LENGTH: 1000,
      RATING_MIN: 0,
      RATING_MAX: 5,
      TAGS_MAX_COUNT: 50,
      TAGS_MIN_COUNT: 1
    },
    relationships: {
      COMMENT_MAX_LENGTH: 1000,
      COMMENT_MIN_LENGTH: 1,
      MAX_MENTIONS_PER_COMMENT: 10,
      MAX_COLLECTIONS_PER_USER: 50,
      MAX_LOGOS_PER_COLLECTION: 1000,
      COLLECTION_NAME_MAX_LENGTH: 100,
      COLLECTION_NAME_MIN_LENGTH: 3,
      MAX_SHARED_USERS: 50,
      MAX_COMMENTS_PER_LOGO: 100,
      MAX_REPLY_DEPTH: 5,
      MAX_FAVORITES_PER_USER: 100,
      MAX_USERS_BATCH: 5000,
      MAX_LOGOS_BATCH: 10000
    }
  };

  public static get rules() {
    return this.VALIDATION_RULES;
  }

  constructor() {
    this.client = new MongoClient(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/LogoGalleryTest');
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db();
  }

  async disconnect() {
    await this.client.close();
  }

  async clearCollections() {
    try {
      const collections = await this.db.collections();
      await Promise.all(
        collections.map(collection => collection.deleteMany({}))
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('Client must be connected')) {
        return; // Skip if not connected
      }
      throw error; // Re-throw other errors
    }
  }

  async createIndexes() {
    await Promise.all([
      this.db.collection('users').createIndex({ email: 1 }, { unique: true }),
      this.db.collection('users').createIndex({ username: 1 }, { unique: true }),
      this.db.collection('logos').createIndex({ userId: 1 }),
      this.db.collection('logos').createIndex({ tags: 1 }),
      this.db.collection('comments').createIndex({ logoId: 1 }),
      this.db.collection('comments').createIndex({ userId: 1 }),
      this.db.collection('collections').createIndex({ userId: 1 }),
      this.db.collection('collections').createIndex({ 'logos': 1 }),
      this.db.collection('favorites').createIndex({ userId: 1, logoId: 1 }, { unique: true })
    ]);
  }

  private validateEmail(email: string): boolean {
    return DatabaseHelper.VALIDATION_RULES.user.EMAIL_PATTERN.test(email);
  }

  private validateDate(date: any): Date | null {
    if (!date) return null;
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }
    return parsedDate;
  }

  private validateProfile(profile: any): User['profile'] {
    if (!profile) return {};
    
    const validatedProfile: User['profile'] = {};
    const rules = DatabaseHelper.VALIDATION_RULES.user;

    // Check for invalid fields
    const invalidFields = Object.keys(profile).filter(
      key => !rules.ALLOWED_PROFILE_FIELDS.includes(key as any)
    );
    if (invalidFields.length > 0) {
      throw new Error(`Invalid profile fields: ${invalidFields.join(', ')}`);
    }

    // Only copy allowed fields
    rules.ALLOWED_PROFILE_FIELDS.forEach(field => {
      if (field in profile) {
        validatedProfile[field] = profile[field];
      }
    });

    return validatedProfile;
  }

  async createUser(data: Partial<User> = {}): Promise<User> {
    // Validate required fields
    if (!data.email) {
      throw new Error('Email is required');
    }
    if (!this.validateEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    const user: User = {
      _id: new ObjectId(),
      email: data.email,
      username: data.username || `user_${Date.now()}`,
      password: data.password || 'defaultPassword123',
      createdAt: this.validateDate(data.createdAt) || new Date(),
      profile: this.validateProfile(data.profile)
    };

    // Validate user data
    this.validateUser(user);

    await this.db.collection('users').insertOne(user);
    return user;
  }

  public async createLogo(data: any): Promise<Logo> {
    // Validate logo data first
    this.validateLogo(data);

    // Then check user existence
    const user = await this.db.collection('users').findOne({ _id: data.userId });
    if (!user) {
      throw new Error(`User with ID ${data.userId} not found`);
    }

    // Create logo
    const logo: Logo = {
      _id: new ObjectId(),
      name: data.name,
      userId: data.userId,
      tags: data.tags,
      createdAt: new Date(),
      description: data.description,
      rating: data.rating
    };

    await this.db.collection('logos').insertOne(logo);
    return logo;
  }

  async seedUsers(options: { count: number }): Promise<User[]> {
    const rules = DatabaseHelper.VALIDATION_RULES.relationships;
    
    if (options.count > rules.MAX_USERS_BATCH) {
      throw new Error(`Cannot create more than ${rules.MAX_USERS_BATCH} users at once`);
    }

    const users: User[] = [];
    const timestamp = Date.now();
    
    // Batch create users for better performance
    const userPromises = Array(options.count).fill(null).map((_, i) => 
      this.createUser({
        email: `user${timestamp}_${i}@test.com`,
        username: `user${timestamp}_${i}`
      })
    );

    users.push(...await Promise.all(userPromises));
    return users;
  }

  async seedLogos(options: { count: number; userIds: ObjectId[] }): Promise<Logo[]> {
    const rules = DatabaseHelper.VALIDATION_RULES.relationships;
    
    if (options.count > rules.MAX_LOGOS_BATCH) {
      throw new Error(`Cannot create more than ${rules.MAX_LOGOS_BATCH} logos at once`);
    }

    const timestamp = Date.now();
    const logoPromises = Array(options.count).fill(null).map((_, i) => 
      this.createLogo({
        name: `Logo ${timestamp}-${i}`,
        userId: options.userIds[i % options.userIds.length],
        tags: [`tag${i}`]
      })
    );

    return Promise.all(logoPromises);
  }

  async seedComments(comments: Comment[]): Promise<Comment[]> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    // Validate each comment before inserting
    comments.forEach(comment => {
      if (!comment.content) {
        throw new Error('Comment content is required');
      }
      if (comment.content.length > DatabaseHelper.VALIDATION_RULES.relationships.COMMENT_MAX_LENGTH) {
        throw new Error(`Comment cannot exceed ${DatabaseHelper.VALIDATION_RULES.relationships.COMMENT_MAX_LENGTH} characters`);
      }
      if (comment.mentions && comment.mentions.length > DatabaseHelper.VALIDATION_RULES.relationships.MAX_MENTIONS_PER_COMMENT) {
        throw new Error(`Cannot mention more than ${DatabaseHelper.VALIDATION_RULES.relationships.MAX_MENTIONS_PER_COMMENT} users in a comment`);
      }
    });

    await this.db.collection('comments').insertMany(comments);
    return comments;
  }

  async seedCollections(collections: Collection[]): Promise<Collection[]> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    // Validate each collection
    collections.forEach(collection => {
      if (!collection.name) {
        throw new Error('Collection name is required');
      }
      if (collection.name.length > DatabaseHelper.VALIDATION_RULES.relationships.COLLECTION_NAME_MAX_LENGTH) {
        throw new Error(`Collection name cannot exceed ${DatabaseHelper.VALIDATION_RULES.relationships.COLLECTION_NAME_MAX_LENGTH} characters`);
      }
      if (collection.collaborators && collection.collaborators.length > DatabaseHelper.VALIDATION_RULES.relationships.MAX_SHARED_USERS) {
        throw new Error(`Cannot share with more than ${DatabaseHelper.VALIDATION_RULES.relationships.MAX_SHARED_USERS} users`);
      }
    });

    await this.db.collection('collections').insertMany(collections);
    return collections;
  }

  private generateReplies(parentComment: Comment, options: { users: User[]; maxRepliesPerComment: number }, comments: Comment[], depth: number = 0): void {
    if (depth >= DatabaseHelper.VALIDATION_RULES.relationships.MAX_REPLY_DEPTH) return;

    const replyCount = Math.floor(Math.random() * (options.maxRepliesPerComment + 1));
    for (let i = 0; i < replyCount; i++) {
      const user = options.users[Math.floor(Math.random() * options.users.length)];
      const reply: Comment = {
        _id: new ObjectId(),
        logoId: parentComment.logoId,
        userId: user._id,
        content: faker.lorem.sentence(),
        createdAt: new Date(),
        parentId: parentComment._id,
        mentions: []
      };
      comments.push(reply);
      this.generateReplies(reply, options, comments, depth + 1);
    }
  }

  async seedRelationships(options: {
    users: User[];
    logos: Logo[];
    commentsPerLogo?: number;
    maxRepliesPerComment?: number;
    collectionsPerUser?: number;
    logosPerCollection?: number;
    favoritesPerUser?: number;
    commentMentions?: boolean;
    sharedCollections?: boolean;
    sharingStrategy?: (collection: Collection, availableUsers: User[]) => ObjectId[];
  }): Promise<Relationships> {
    const rules = DatabaseHelper.VALIDATION_RULES.relationships;

    // Validate input limits
    if (options.commentsPerLogo && options.commentsPerLogo > rules.MAX_COMMENTS_PER_LOGO) {
      throw new Error(`Cannot create more than ${rules.MAX_COMMENTS_PER_LOGO} comments per logo`);
    }
    if (options.maxRepliesPerComment && options.maxRepliesPerComment > rules.MAX_REPLY_DEPTH) {
      throw new Error(`Cannot create more than ${rules.MAX_REPLY_DEPTH} levels of replies`);
    }
    if (options.favoritesPerUser && options.favoritesPerUser > rules.MAX_FAVORITES_PER_USER) {
      throw new Error(`Cannot create more than ${rules.MAX_FAVORITES_PER_USER} favorites per user`);
    }
    if (options.collectionsPerUser && options.collectionsPerUser > rules.MAX_COLLECTIONS_PER_USER) {
      throw new Error(`Cannot create more than ${rules.MAX_COLLECTIONS_PER_USER} collections per user`);
    }
    if (options.logosPerCollection && options.logosPerCollection > rules.MAX_LOGOS_PER_COLLECTION) {
      throw new Error(`Cannot have more than ${rules.MAX_LOGOS_PER_COLLECTION} logos in a collection`);
    }

    const relationships: Relationships = {
      comments: [],
      collections: [],
      favorites: []
    };

    // Generate comments
    if (options.commentsPerLogo) {
      for (const logo of options.logos) {
        for (let i = 0; i < options.commentsPerLogo; i++) {
          const comment: Comment = {
            _id: new ObjectId(),
            logoId: logo._id,
            userId: options.users[i % options.users.length]._id,
            content: `Comment ${i} on ${logo.name}`,
            createdAt: new Date(),
            likes: 0
          };
          relationships.comments.push(comment);

          // Generate replies if specified
          if (options.maxRepliesPerComment) {
            this.generateReplies(comment, {
              users: options.users,
              maxRepliesPerComment: options.maxRepliesPerComment
            }, relationships.comments);
          }
        }
      }
    }

    // Generate collections
    if (options.collectionsPerUser) {
      for (const user of options.users) {
        for (let i = 0; i < options.collectionsPerUser; i++) {
          const collection: Collection = {
            _id: new ObjectId(),
            userId: user._id,
            name: `Collection ${i} by ${user.username}`,
            logos: options.logos
              .slice(0, options.logosPerCollection || 3)
              .map(l => l._id),
            createdAt: new Date(),
            isPublic: Math.random() > 0.5
          };

          if (options.sharedCollections && options.sharingStrategy) {
            const availableUsers = options.users.filter(u => u._id !== user._id);
            const sharedWith = options.sharingStrategy(collection, availableUsers);
            
            // Validate sharing strategy
            if (sharedWith.some(id => id.equals(user._id))) {
              throw new Error('Cannot share collection with its owner');
            }
            collection.sharedWith = sharedWith;
          }

          relationships.collections.push(collection);
        }
      }
    }

    // Generate favorites
    if (options.favoritesPerUser) {
      for (const user of options.users) {
        const userFavorites = options.logos
          .slice(0, Math.min(options.favoritesPerUser, options.logos.length))
          .map(logo => ({
            _id: new ObjectId(),
            userId: user._id,
            logoId: logo._id,
            createdAt: new Date()
          }));
        relationships.favorites.push(...userFavorites);
      }
    }

    // Save to database
    if (relationships.comments.length > 0) {
      await this.db.collection('comments').insertMany(relationships.comments);
    }
    if (relationships.collections.length > 0) {
      await this.db.collection('collections').insertMany(relationships.collections);
    }
    if (relationships.favorites.length > 0) {
      await this.db.collection('favorites').insertMany(relationships.favorites);
    }

    return relationships;
  }

  // Enhanced validation methods
  private validateUser(user: User): void {
    const rules = DatabaseHelper.VALIDATION_RULES.user;
    
    // Email validation
    if (!user.email) {
      throw new Error('Email is required');
    }
    if (!rules.EMAIL_PATTERN.test(user.email)) {
      throw new Error('Invalid email format');
    }

    // Username validation
    if (!user.username) {
      throw new Error('Username is required');
    }
    if (user.username.length < rules.USERNAME_MIN_LENGTH) {
      throw new Error(`Username must be at least ${rules.USERNAME_MIN_LENGTH} characters`);
    }
    if (user.username.length > rules.USERNAME_MAX_LENGTH) {
      throw new Error('Invalid username');
    }
    if (!rules.USERNAME_PATTERN.test(user.username)) {
      throw new Error('Username contains invalid characters');
    }

    // Profile validation
    if (user.profile) {
      const invalidFields = Object.keys(user.profile).filter(
        key => !rules.ALLOWED_PROFILE_FIELDS.includes(key as any)
      );
      if (invalidFields.length > 0) {
        throw new Error(`Invalid profile fields: ${invalidFields.join(', ')}`);
      }

      // Bio validation
      if (user.profile.bio && user.profile.bio.length > rules.BIO_MAX_LENGTH) {
        throw new Error(`Bio cannot exceed ${rules.BIO_MAX_LENGTH} characters`);
      }

      // Location validation
      if (user.profile.location && user.profile.location.length > rules.LOCATION_MAX_LENGTH) {
        throw new Error(`Location cannot exceed ${rules.LOCATION_MAX_LENGTH} characters`);
      }

      // Skills validation
      if (user.profile.skills) {
        if (!Array.isArray(user.profile.skills)) {
          throw new Error('Skills must be an array');
        }
        if (user.profile.skills.length > rules.MAX_SKILLS) {
          throw new Error(`Cannot have more than ${rules.MAX_SKILLS} skills`);
        }
        user.profile.skills.forEach(skill => {
          if (skill.length > rules.SKILL_MAX_LENGTH) {
            throw new Error(`Skill cannot exceed ${rules.SKILL_MAX_LENGTH} characters`);
          }
        });
      }
    }
  }

  private validateLogo(data: any): void {
    // Validate name
    if (!data.name) {
      throw new Error('Logo name is required');
    }
    if (data.name.length < DatabaseHelper.VALIDATION_RULES.logo.NAME_MIN_LENGTH ||
        data.name.length > DatabaseHelper.VALIDATION_RULES.logo.NAME_MAX_LENGTH) {
      throw new Error(`Logo name must be between ${DatabaseHelper.VALIDATION_RULES.logo.NAME_MIN_LENGTH} and ${DatabaseHelper.VALIDATION_RULES.logo.NAME_MAX_LENGTH} characters`);
    }
    if (!DatabaseHelper.VALIDATION_RULES.logo.NAME_PATTERN.test(data.name)) {
      throw new Error('Logo name contains invalid characters');
    }

    // Validate tags
    if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
      throw new Error('At least one tag is required');
    }
    if (data.tags.length > DatabaseHelper.VALIDATION_RULES.logo.TAGS_MAX_COUNT) {
      throw new Error('Too many tags');
    }
    const uniqueTags = new Set(data.tags);
    if (uniqueTags.size !== data.tags.length) {
      throw new Error('Duplicate tags are not allowed');
    }
    for (const tag of data.tags) {
      if (tag.length < DatabaseHelper.VALIDATION_RULES.logo.TAG_MIN_LENGTH ||
          tag.length > DatabaseHelper.VALIDATION_RULES.logo.TAG_MAX_LENGTH) {
        throw new Error(`Tag length must be between ${DatabaseHelper.VALIDATION_RULES.logo.TAG_MIN_LENGTH} and ${DatabaseHelper.VALIDATION_RULES.logo.TAG_MAX_LENGTH} characters`);
      }
      if (!DatabaseHelper.VALIDATION_RULES.logo.TAG_PATTERN.test(tag)) {
        throw new Error('Invalid tag format');
      }
    }

    // Validate description length
    if (data.description && data.description.length > DatabaseHelper.VALIDATION_RULES.logo.DESCRIPTION_MAX_LENGTH) {
      throw new Error(`Description cannot exceed ${DatabaseHelper.VALIDATION_RULES.logo.DESCRIPTION_MAX_LENGTH} characters`);
    }

    // Validate rating type and range
    if (data.rating !== undefined) {
      if (typeof data.rating !== 'number') {
        throw new Error('Rating must be a number');
      }
      if (data.rating < DatabaseHelper.VALIDATION_RULES.logo.RATING_MIN || data.rating > DatabaseHelper.VALIDATION_RULES.logo.RATING_MAX) {
        throw new Error(`Rating must be between ${DatabaseHelper.VALIDATION_RULES.logo.RATING_MIN} and ${DatabaseHelper.VALIDATION_RULES.logo.RATING_MAX}`);
      }
    }
  }
}
