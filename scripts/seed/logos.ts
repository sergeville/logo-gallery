import { ObjectId } from 'mongodb';
import { Logo } from '@/app/types';

interface LogoSeedOptions {
  count: number;
  perUser?: number;
  userIds: ObjectId[]; // Required user IDs to associate logos with
}

const SAMPLE_TAGS = [
  'minimalist', 'colorful', 'modern', 'vintage', 'abstract',
  'geometric', 'typography', 'illustration', 'branding', 'tech',
  'creative', 'professional', 'playful', 'elegant', 'bold'
];

const LOGO_STYLES = [
  'Flat', 'Gradient', '3D', 'Hand-drawn', 'Monochrome',
  'Retro', 'Futuristic', 'Classic', 'Dynamic', 'Simple'
];

/**
 * Generates a random set of tags
 */
function generateTags(count: number = 3): string[] {
  const shuffled = [...SAMPLE_TAGS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, SAMPLE_TAGS.length));
}

/**
 * Generates a random logo description
 */
function generateDescription(style: string, tags: string[]): string {
  return `A ${style.toLowerCase()} logo design featuring ${tags.join(', ')} elements.`;
}

/**
 * Generates a single logo
 */
function generateLogo(index: number, userId: ObjectId, options: LogoSeedOptions): Logo {
  const tags = generateTags();
  const style = LOGO_STYLES[Math.floor(Math.random() * LOGO_STYLES.length)];
  const now = new Date();

  return {
    _id: new ObjectId(),
    name: `Test Logo ${index}`,
    url: `https://example.com/logos/logo-${index}.png`,
    description: generateDescription(style, tags),
    userId,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Seeds logos into the database
 */
export async function seedLogos(options: LogoSeedOptions): Promise<Logo[]> {
  const logos: Logo[] = [];
  let index = 0;

  for (const userId of options.userIds) {
    const userLogoCount = options.perUser || Math.ceil(options.count / options.userIds.length);
    for (let i = 0; i < userLogoCount && logos.length < options.count; i++) {
      logos.push(generateLogo(index++, userId, options));
    }
  }

  return logos;
}

/**
 * Creates a test logo with specific attributes
 */
export async function createTestLogo(userId: ObjectId, overrides: Partial<Logo> = {}): Promise<Logo> {
  const defaultLogo = generateLogo(0, userId, { count: 1, userIds: [userId] });
  return { ...defaultLogo, ...overrides };
}

// Example usage:
// const logos = await seedLogos({ count: 10, userIds: existingUserIds });
// const testLogo = await createTestLogo(userId, { name: 'Custom Logo' }); 