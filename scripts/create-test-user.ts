import { User } from '../app/lib/models/user';
import mongoose from 'mongoose';
import { Role, DEFAULT_ROLE } from '../app/config/roles.config';

const DATABASE_URL = 'mongodb://localhost:27017/logo-gallery-dev';

async function createTestUser() {
  try {
    await mongoose.connect(DATABASE_URL);

    const testUser = {
      email: 'test@example.com',
      password: 'testpassword123',
      name: 'Test User',
      role: DEFAULT_ROLE as Role,
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: testUser.email });
    if (existingUser) {
      console.log('Test user already exists');
      process.exit(0);
    }

    // Create new user
    const user = new User(testUser);
    await user.save();
    console.log('Test user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser(); 