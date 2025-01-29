import bcrypt from 'bcryptjs';
import connectDB from '@/app/lib/db';
import { User } from '@/app/lib/models/user';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function findUserByEmail(email: string) {
  await connectDB();
  return User.findOne({ email });
}

export async function createUser(email: string, password: string, name: string) {
  await connectDB();
  const hashedPassword = await hashPassword(password);
  const user = new User({
    email,
    password: hashedPassword,
    name,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return user.save();
} 