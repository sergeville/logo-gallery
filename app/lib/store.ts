import bcrypt from 'bcryptjs';

interface User {
  email: string;
  password?: string;
  name?: string;
}

// Use global object to persist data across requests
declare global {
  var users: User[];
  var initialized: boolean;
}

// Initialize global users array if it doesn't exist
if (!global.users) {
  global.users = [];
  global.initialized = false;
}

export const initializeStore = async () => {
  if (global.initialized) {
    return;
  }
  
  console.log('Initializing store');
  if (global.users.length === 0) {
    console.log('Store is empty, creating test user');
    await createUser('test@example.com', 'test123');
  }
  global.initialized = true;
};

export const clearStore = () => {
  console.log('Clearing store');
  global.users = [];
  global.initialized = false;
};

export const createUser = async (email: string, password: string, name?: string): Promise<User> => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user: User = { email, password: hashedPassword, name };
  global.users.push(user);
  console.log('User created:', { email });
  return user;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  console.log('Getting users from store:', global.users);
  const user = global.users.find(u => u.email === email);
  console.log('Found user:', user || null);
  return user || null;
};

export const validatePassword = async (email: string, password: string): Promise<{ isValid: boolean }> => {
  const user = await getUserByEmail(email);
  if (!user?.password) {
    return { isValid: false };
  }
  const isValid = await bcrypt.compare(password, user.password);
  return { isValid };
};

// Initialize store on module load
initializeStore().catch(console.error); 