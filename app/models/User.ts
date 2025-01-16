export interface User {
  _id: string;
  username: string;
  email: string;
  profile?: {
    avatarUrl?: string;
    bio?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// In-memory store for users
let users: User[] = [];

// User operations
export function getUsers(): User[] {
  return users;
}

export function getUser(id: string): User | undefined {
  return users.find(user => user._id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return users.find(user => user.email === email);
}

export function addUser(user: User): User {
  users.push(user);
  return user;
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const index = users.findIndex(user => user._id === id);
  if (index === -1) return undefined;
  
  users[index] = { ...users[index], ...updates };
  return users[index];
}

export function deleteUser(id: string): boolean {
  const initialLength = users.length;
  users = users.filter(user => user._id !== id);
  return users.length < initialLength;
}

// Export the User class for compatibility with existing code
export const User = {
  findById: (id: string) => getUser(id),
  findOne: (query: { email: string }) => getUserByEmail(query.email),
  create: (user: User) => addUser(user),
  findByIdAndUpdate: (id: string, updates: Partial<User>) => updateUser(id, updates),
  findByIdAndDelete: (id: string) => deleteUser(id)
}; 