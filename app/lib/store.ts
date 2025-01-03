interface Logo {
  _id: string;
  name: string;
  url: string;
  description: string;
  userId: {
    username: string;
    profileImage: string;
  };
  tags: string[];
  averageRating: number;
}

// Initial mock data
let logos: Logo[] = [
  {
    _id: '1',
    name: 'Jardinscampion Logo',
    url: '/images/logo-jardinscampion.png',
    description: 'Official Jardinscampion logo',
    userId: {
      username: 'testuser',
      profileImage: 'https://placehold.co/50x50'
    },
    tags: ['official', 'brand', 'company'],
    averageRating: 5
  },
  {
    _id: '2',
    name: 'Jardinscampion Icon',
    url: '/images/icon-jardinscampion.png',
    description: 'Jardinscampion icon version',
    userId: {
      username: 'testuser',
      profileImage: 'https://placehold.co/50x50'
    },
    tags: ['icon', 'brand', 'minimal'],
    averageRating: 4.8
  }
];

export function getLogos() {
  return logos;
}

export function addLogo(logo: Logo) {
  logos = [...logos, logo];
  return logo;
} 