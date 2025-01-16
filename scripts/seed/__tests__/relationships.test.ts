import { ObjectId } from 'mongodb';
import { seedRelationships } from '../relationships';

interface RelationshipSeedOptions {
  minRelationsPerUser: number;
  maxRelationsPerUser?: number;
}

describe('Relationship Seeding', () => {
  it('creates relationships between users and logos', async () => {
    const users = [new ObjectId(), new ObjectId()];
    const logos = [new ObjectId(), new ObjectId(), new ObjectId()];

    const options: RelationshipSeedOptions = {
      minRelationsPerUser: 1,
      maxRelationsPerUser: 3
    };

    const relationships = await seedRelationships({
      users,
      logos,
      ...options
    });

    // Check that relationships were created
    expect(relationships.favorites.length).toBeGreaterThan(0);
    expect(relationships.comments.length).toBeGreaterThan(0);
    expect(relationships.collections.length).toBeGreaterThan(0);

    // Check that each user has at least one relationship
    const userRelationships = new Set();
    relationships.favorites.forEach(favorite => {
      expect(users).toContainEqual(favorite.userId);
      expect(logos).toContainEqual(favorite.logoId);
      userRelationships.add(favorite.userId.toString());
    });

    relationships.comments.forEach(comment => {
      expect(users).toContainEqual(comment.userId);
      expect(logos).toContainEqual(comment.logoId);
      userRelationships.add(comment.userId.toString());
    });

    relationships.collections.forEach(collection => {
      expect(users).toContainEqual(collection.userId);
      expect(logos).toContainEqual(collection._id);
      userRelationships.add(collection.userId.toString());
    });

    // Verify that each user has at least one relationship
    expect(userRelationships.size).toBe(users.length);
  });
}); 