import { MongoClient, Db, ObjectId } from 'mongodb';
import { User, Comment, Collection, Relationships, TestDataOptions, TestData, Logo } from './types';
import { faker } from '@faker-js/faker';
import '@testing-library/jest-dom'

/**
 * Helper class for managing database operations during testing
 */
export class DatabaseHelper {
  private client: MongoClient;
  public db!: Db;

  private static readonly rules = {
    user: {
      USERNAME_PATTERN: /^[a-zA-Z0-9_-]+$/,
      EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      URL_PATTERN: /^https?:\/\/.+/,
      MIN_USERNAME_LENGTH: 3,
      MAX_USERNAME_LENGTH: 30,
      MIN_PASSWORD_LENGTH: 8,
      BIO_MAX_LENGTH: 500,
      LOCATION_MAX_LENGTH: 100,
      MAX_SKILLS: 20,
      ALLOWED_PROFILE_FIELDS: ['bio', 'website', 'avatar', 'location', 'skills'] as const
    },
    logo: {
      NAME_PATTERN: /^[a-zA-Z0-9\s-]+$/,
      NAME_MIN_LENGTH: 3,
      NAME_MAX_LENGTH: 100,
      DESCRIPTION_MAX_LENGTH: 1000,
      TAGS_MAX_COUNT: 10
    },
    relationships: {
      MAX_COMMENT_DEPTH: 5,
      MAX_COLLECTION_MEMBERS: 50,
      MAX_FAVORITES_PER_LOGO: 1000,
      MAX_MENTIONS: 10,
      COLLECTION_NAME_MAX_LENGTH: 100,
      MAX_SHARED_USERS: 20,
      MAX_COMMENTS_PER_LOGO: 100,
      MAX_COMMENTS_PER_USER: 500,
      MAX_COLLECTIONS_PER_USER: 20,
      MAX_LOGOS_PER_COLLECTION: 100,
      MAX_FAVORITES_PER_USER: 100,
      MAX_REPLY_DEPTH: 5,
      COMMENT_MAX_LENGTH: 1000,
      MAX_MENTIONS_PER_COMMENT: 10
    },
    limits: {
      MAX_USERS_BATCH: 5000,
      MAX_LOGOS_BATCH: 1000
    }
  };

  static get validationRules() {
    return DatabaseHelper.rules;
  }

  get rules() {
    return DatabaseHelper.rules;
  }

  constructor() {
    this.client = new MongoClient(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/LogoGalleryTest');
  }

  /**
   * Connects to the test database using the configured MongoDB URI
   */
  async connect() {
    await this.client.connect();
    this.db = this.client.db();
  }

  /**
   * Disconnects from the test database
   */
  async disconnect() {
    await this.client.close();
  }

  /**
   * Clears all collections in the test database
   */
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

  /**
   * Creates indexes on collections for optimized queries
   */
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
    return DatabaseHelper.rules.user.EMAIL_PATTERN.test(email);
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
    const rules = DatabaseHelper.rules.user;

    // Check for invalid fields
    const invalidFields = Object.keys(profile).filter(
      key => !rules.ALLOWED_PROFILE_FIELDS.includes(key as typeof rules.ALLOWED_PROFILE_FIELDS[number])
    );
    if (invalidFields.length > 0) {
      throw new Error(`Invalid profile fields: ${invalidFields.join(', ')}`);
    }

    // Validate and copy allowed fields
    if ('bio' in profile) {
      if (typeof profile.bio !== 'string') throw new Error('Bio must be a string');
      if (profile.bio.length > rules.BIO_MAX_LENGTH) {
        throw new Error(`Bio cannot exceed ${rules.BIO_MAX_LENGTH} characters`);
      }
      validatedProfile.bio = profile.bio;
    }
    if ('location' in profile) {
      if (typeof profile.location !== 'string') throw new Error('Location must be a string');
      if (profile.location.length > rules.LOCATION_MAX_LENGTH) {
        throw new Error(`Location cannot exceed ${rules.LOCATION_MAX_LENGTH} characters`);
      }
      validatedProfile.location = profile.location;
    }
    if ('website' in profile) {
      if (typeof profile.website !== 'string') throw new Error('Website must be a string');
      if (!rules.URL_PATTERN.test(profile.website)) {
        throw new Error('Invalid website URL format');
      }
      validatedProfile.website = profile.website;
    }
    if ('avatar' in profile) {
      if (typeof profile.avatar !== 'string') throw new Error('Avatar must be a string');
      if (!rules.URL_PATTERN.test(profile.avatar)) {
        throw new Error('Invalid avatar URL format');
      }
      validatedProfile.avatar = profile.avatar;
    }
    if ('skills' in profile) {
      if (!Array.isArray(profile.skills)) throw new Error('Skills must be an array');
      if (profile.skills.length > rules.MAX_SKILLS) {
        throw new Error(`Cannot have more than ${rules.MAX_SKILLS} skills`);
      }
      if (!profile.skills.every((skill: string) => typeof skill === 'string')) {
        throw new Error('All skills must be strings');
      }
      validatedProfile.skills = profile.skills;
    }

    return validatedProfile;
  }

  /**
   * Creates a new user in the database
   * @param data - Partial user data to create
   * @returns Promise resolving to the created user
   */
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

  /**
   * Creates a new logo in the database
   * @param data - Logo data to create
   * @returns Promise resolving to the created logo
   */
  public async createLogo(data: any): Promise<Logo> {
    // Validate logo data first
    this.validateLogo(data);

    // Then check user existence
    const user = await this.db.collection('users').findOne({ _id: data.userId });
    if (!user) {
      throw new Error(`User with ID ${data.userId} not found`);
    }

    // Create logo with ObjectId
    const _id = new ObjectId();
    const logo = {
      _id,
      name: data.name,
      imageUrl: data.url || '/placeholder.png',
      thumbnailUrl: data.url || '/placeholder-thumb.png',
      userId: new ObjectId(data.userId),
      tags: data.tags || [],
      category: data.category || 'Other',
      dimensions: data.dimensions || { width: 800, height: 600 },
      fileSize: data.fileSize || 1024 * 100, // 100KB default
      fileType: data.fileType || 'png',
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: (data.votes || []).map((vote: any) => ({
        userId: new ObjectId(vote.userId),
        rating: vote.rating,
        timestamp: new Date(vote.timestamp || Date.now())
      }))
    };

    await this.db.collection('logos').insertOne(logo);
    
    return logo;
  }

  /**
   * Seeds multiple users in the database
   * @param options - Options containing count of users to create
   * @returns Promise resolving to array of created users
   */
  async seedUsers(options: { count: number }): Promise<User[]> {
    const rules = DatabaseHelper.rules.limits;
    
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

  /**
   * Seeds multiple logos in the database
   * @param options - Options containing count and user IDs for logo creation
   * @returns Promise resolving to array of created logos
   */
  async seedLogos(options: { count: number; userIds: ObjectId[] }): Promise<Logo[]> {
    const rules = DatabaseHelper.rules.limits;
    
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

  /**
   * Seeds comments in the database
   * @param comments - Array of comments to create
   * @returns Promise resolving to array of created comments
   */
  async seedComments(comments: Comment[]): Promise<Comment[]> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const rules = DatabaseHelper.rules.relationships;

    // Validate each comment before inserting
    comments.forEach(comment => {
      if (!comment.content) {
        throw new Error('Comment content is required');
      }
      if (comment.content.length > rules.COMMENT_MAX_LENGTH) {
        throw new Error(`Comment cannot exceed ${rules.COMMENT_MAX_LENGTH} characters`);
      }
      if (comment.mentions && comment.mentions.length > rules.MAX_MENTIONS_PER_COMMENT) {
        throw new Error(`Cannot mention more than ${rules.MAX_MENTIONS_PER_COMMENT} users in a comment`);
      }
    });

    await this.db.collection('comments').insertMany(comments);
    return comments;
  }

  /**
   * Seeds collections in the database
   * @param collections - Array of collections to create
   * @returns Promise resolving to array of created collections
   */
  async seedCollections(collections: Collection[]): Promise<Collection[]> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const rules = DatabaseHelper.rules.relationships;

    // Validate each collection
    collections.forEach(collection => {
      if (!collection.name) {
        throw new Error('Collection name is required');
      }
      if (collection.name.length > rules.COLLECTION_NAME_MAX_LENGTH) {
        throw new Error(`Collection name cannot exceed ${rules.COLLECTION_NAME_MAX_LENGTH} characters`);
      }
      if (collection.collaborators && collection.collaborators.length > rules.MAX_SHARED_USERS) {
        throw new Error(`Cannot share with more than ${rules.MAX_SHARED_USERS} users`);
      }
    });

    await this.db.collection('collections').insertMany(collections);
    return collections;
  }

  private generateReplies(parentComment: Comment, options: { users: User[]; maxRepliesPerComment: number }, comments: Comment[], depth: number = 0): void {
    const rules = DatabaseHelper.rules.relationships;
    if (depth >= rules.MAX_COMMENT_DEPTH) return;

    const replyCount = Math.floor(Math.random() * (options.maxRepliesPerComment + 1));
    for (let i = 0; i < replyCount; i++) {
      const user = options.users[Math.floor(Math.random() * options.users.length)];
      const reply: Comment = {
        _id: new ObjectId(),
        logoId: parentComment.logoId,
        userId: user._id,
        content: `Reply ${i + 1} to comment ${parentComment._id}`,
        parentId: parentComment._id,
        createdAt: new Date(),
        mentions: []
      };
      comments.push(reply);
      this.generateReplies(reply, options, comments, depth + 1);
    }
  }

  /**
   * Seeds relationships between entities (comments, collections, favorites)
   * @param options - Options for relationship creation
   * @returns Promise resolving to created relationships
   */
  async seedRelationships(options: {
    users: User[];
    logos: Logo[];
    commentsPerLogo?: number;
    maxRepliesPerComment?: number;
    collectionsPerUser?: number;
    logosPerCollection?: number;
    commentMentions?: boolean;
    sharedCollections?: boolean;
    sharingStrategy?: (collection: Collection, availableUsers: User[]) => ObjectId[];
  }): Promise<Relationships> {
    const relationships = {
      comments: [],
      collections: []
    };

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
              .map(l => new ObjectId(l._id)),
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

    return relationships;
  }

  // Enhanced validation methods
  private validateUser(user: User): void {
    const rules = DatabaseHelper.rules.user;
    
    // Username validation
    if (!user.username) {
      throw new Error('Username is required');
    }
    if (!rules.USERNAME_PATTERN.test(user.username)) {
      throw new Error('Invalid username format');
    }
    if (user.username.length < rules.MIN_USERNAME_LENGTH || user.username.length > rules.MAX_USERNAME_LENGTH) {
      throw new Error('Invalid username');
    }

    // Email validation
    if (!user.email) {
      throw new Error('Email is required');
    }
    if (!rules.EMAIL_PATTERN.test(user.email)) {
      throw new Error('Invalid email format');
    }

    // Password validation
    if (user.password.length < rules.MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${rules.MIN_PASSWORD_LENGTH} characters`);
    }
  }

  private validateLogo(data: Partial<Logo>) {
    const rules = DatabaseHelper.rules.logo;

    // Tags validation
    if (data.tags) {
      if (data.tags.length > rules.TAGS_MAX_COUNT) {
        throw new Error('Too many tags');
      }
      const uniqueTags = new Set(data.tags);
      if (uniqueTags.size !== data.tags.length) {
        throw new Error('Duplicate tags are not allowed');
      }
    }

    // Name validation
    if (!data.name) {
      throw new Error('Logo name is required');
    }
    if (!rules.NAME_PATTERN.test(data.name)) {
      throw new Error('Logo name contains invalid characters');
    }
    if (data.name.length > rules.NAME_MAX_LENGTH) {
      throw new Error('Logo name is too long');
    }

    // Image URL validation
    if (!data.imageUrl) {
      throw new Error('Logo image URL is required');
    }
    if (!DatabaseHelper.rules.user.URL_PATTERN.test(data.imageUrl as string)) {
      throw new Error('Invalid logo image URL format');
    }

    // Description validation
    if (data.description && data.description.length > rules.DESCRIPTION_MAX_LENGTH) {
      throw new Error('Logo description is too long');
    }
  }

  /**
   * Generates test data for a specific entity type
   * @param type - Type of entity to generate data for
   * @param overrides - Optional overrides for generated data
   * @returns Generated test data
   */
  generateTestData(type: 'user' | 'logo' | 'comment' | 'collection', overrides: Partial<any> = {}): any {
    switch (type) {
      case 'user':
        return {
          email: `user_${Date.now()}@test.com`,
          username: `user_${Date.now()}`,
          password: 'testPassword123',
          profile: {},
          ...overrides
        };
      case 'logo':
        return {
          name: `Logo ${Date.now()}`,
          tags: ['test'],
          description: 'Test logo',
          rating: 0,
          ...overrides
        };
      case 'comment':
        return {
          content: 'Test comment',
          likes: 0,
          mentions: [],
          ...overrides
        };
      case 'collection':
        return {
          name: `Collection ${Date.now()}`,
          logos: [],
          isPublic: true,
          collaborators: [],
          ...overrides
        };
      default:
        throw new Error(`Invalid test data type: ${type}`);
    }
  }

  /**
   * Creates a new comment in the database
   * @param data - Partial comment data to create
   * @returns Promise resolving to created comment
   */
  async createComment(data: Partial<Comment>): Promise<Comment> {
    if (!data.content) {
      throw new Error('Comment content is required');
    }
    if (!data.userId) {
      throw new Error('Comment userId is required');
    }
    if (!data.logoId) {
      throw new Error('Comment logoId is required');
    }

    const comment: Comment = {
      _id: new ObjectId(),
      content: data.content,
      userId: data.userId,
      logoId: data.logoId,
      createdAt: new Date(),
      likes: data.likes || 0,
      mentions: data.mentions || []
    };

    await this.db.collection('comments').insertOne(comment);
    return comment;
  }

  /**
   * Creates a new collection in the database
   * @param data - Partial collection data to create
   * @returns Promise resolving to created collection
   */
  async createCollection(data: Partial<Collection>): Promise<Collection> {
    if (!data.name) {
      throw new Error('Collection name is required');
    }
    if (!data.userId) {
      throw new Error('Collection userId is required');
    }

    const collection: Collection = {
      _id: new ObjectId(),
      name: data.name,
      userId: data.userId,
      logos: data.logos || [],
      createdAt: new Date(),
      isPublic: data.isPublic ?? true,
      sharedWith: data.sharedWith || []
    };

    await this.db.collection('collections').insertOne(collection);
    return collection;
  }

  /**
   * Seeds test data including users, logos, and their relationships
   * @param options - Options for test data generation
   * @returns Promise resolving to generated test data
   */
  async seedTestData(options: TestDataOptions = {}): Promise<TestData> {
    const timestamp = Date.now();
    const users = await this.seedUsers({ count: 3 });
    const logos = await Promise.all(
      Array.from({ length: options.logoCount || 5 }, async (_, i) => {
        const owner = users[i % users.length];
        const logoId = new ObjectId();
        const logo: Logo = {
          _id: logoId,
          name: `Logo ${timestamp}-${i}`,
          description: `Description for Logo ${timestamp}-${i}`,
          imageUrl: `https://example.com/logo${i}.png`,
          thumbnailUrl: `https://example.com/logo${i}-thumb.png`,
          userId: owner._id,
          tags: [`tag${i}`, 'test'],
          rating: 4,
          votes: [{
            userId: owner._id,
            rating: 4,
            timestamp: new Date()
          }],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Insert into database
        await this.db.collection('logos').insertOne(logo);

        return logo;
      })
    );

    const relationships = await this.seedRelationships({
      users,
      logos,
      commentsPerLogo: options.commentsPerLogo || 3,
      maxRepliesPerComment: options.maxRepliesPerComment || 2,
      collectionsPerUser: options.collectionsPerUser || 2,
      logosPerCollection: options.logosPerCollection || 3
    });

    return {
      users,
      logos,
      ...relationships
    };
  }
}
