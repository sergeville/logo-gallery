interface UserProfile {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export function validateUserProfile(data: UserProfile): { isValid: boolean; error?: string } {
  if (data.email && !isValidEmail(data.email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  if (data.name && (data.name.length < 2 || data.name.length > 50)) {
    return { isValid: false, error: 'Name must be between 2 and 50 characters' };
  }

  if (data.newPassword) {
    if (!data.currentPassword) {
      return { isValid: false, error: 'Current password is required to set a new password' };
    }
    if (data.newPassword.length < 8) {
      return { isValid: false, error: 'New password must be at least 8 characters long' };
    }
  }

  return { isValid: true };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
} 