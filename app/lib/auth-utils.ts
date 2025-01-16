import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function verifyPassword(plainPassword: string | undefined, hashedPassword: string | undefined): Promise<boolean> {
  if (!plainPassword || !hashedPassword) {
    return false;
  }
  
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateSessionToken(): string {
  return crypto.randomUUID();
}

export function validatePassword(password: string): boolean {
  // Password must be at least 8 characters long and contain at least one number and one special character
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
  return passwordRegex.test(password);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
} 