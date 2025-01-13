import bcrypt from 'bcryptjs';
import { addUser } from '../app/lib/store';

async function createTestUser() {
  const hashedPassword = await bcrypt.hash('test123', 10);
  
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: hashedPassword,
    name: 'Test User',
    profileImage: 'https://placehold.co/50x50'
  };

  try {
    const user = addUser(testUser);
    console.log('Test user created successfully:', {
      email: user.email,
      username: user.username
    });
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser(); 