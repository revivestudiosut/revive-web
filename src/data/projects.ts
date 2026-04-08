export interface Project {
  slug: string;
  title: string;
  location: string;
  description: string;
  hero: string;
  images: string[];
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: 'luxe-kitchen',
    title: 'Luxe Kitchen',
    location: 'Alpine, UT',
    description:
      'A full kitchen transformation featuring custom white cabinetry, brass hardware and lighting fixtures, a natural stone backsplash, and a large island with seating. Every detail was selected to create a space that feels both elevated and inviting.',
    hero: '/images/hero-kitchen.jpg',
    images: ['/images/hero-kitchen.jpg'],
    featured: true,
  },
  {
    slug: 'mountain-view-living',
    title: 'Mountain View Living',
    location: 'Alpine, UT',
    description:
      'A living room designed to frame the stunning mountain views beyond. Neutral tones, natural textures, and carefully curated furniture create a serene space that feels connected to the landscape outside.',
    hero: '/images/piano-room.png',
    images: ['/images/piano-room.png'],
  },
  {
    slug: 'country-kitchen',
    title: 'Country Kitchen',
    location: 'Osceola, IN',
    description:
      'A warm, open-concept kitchen and living area featuring a sage green island, woven pendant lights, and natural wood flooring. The design blends rustic charm with modern functionality for a family-friendly space.',
    hero: '/images/warm-kitchen.jpg',
    images: ['/images/warm-kitchen.jpg', '/images/elegant-dining-kitchen.jpg'],
  },
  {
    slug: 'serenity-suite',
    title: 'Serenity Suite',
    location: 'Alpine, UT',
    description:
      'A spa-inspired bathroom retreat with soft green tile, warm wood vanity, and brass accents. Every material was chosen to evoke calm and create a daily ritual of relaxation.',
    hero: '/images/serenity-suite-bathroom.png',
    images: ['/images/serenity-suite-bathroom.png', '/images/portfolio-4.jpg'],
  },
  {
    slug: 'cozy-haven',
    title: 'Cozy Haven',
    location: 'Alpine, UT',
    description:
      'A multi-room project transforming a basement into a warm, livable retreat. Olive and earth tones, a curated reading nook, and thoughtful furniture placement make every corner feel intentional and inviting.',
    hero: '/images/cozy-haven-basement.jpg',
    images: [
      '/images/cozy-haven-basement.jpg',
      '/images/portfolio-1.jpg',
      '/images/portfolio-3.jpg',
    ],
  },
  {
    slug: 'elegant-entertaining',
    title: 'Elegant Entertaining',
    location: 'Alpine, UT',
    description:
      'A dining and gallery space designed for hosting. Sage green upholstered chairs, a natural wood table, and a carefully curated gallery wall create a space that feels both refined and welcoming.',
    hero: '/images/portfolio-2.jpg',
    images: ['/images/portfolio-2.jpg', '/images/gallery-wall.png'],
  },
  {
    slug: 'elegant-laundry',
    title: 'Elegant Laundry',
    location: 'Alpine, UT',
    description:
      'Proof that utility spaces deserve beautiful design too. Clean lines, smart storage, and a cohesive palette turn an everyday room into a space you actually enjoy using.',
    hero: '/images/laundry-room.png',
    images: ['/images/laundry-room.png'],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string): { prev?: Project; next?: Project } {
  const index = projects.findIndex((p) => p.slug === slug);
  return {
    prev: index > 0 ? projects[index - 1] : undefined,
    next: index < projects.length - 1 ? projects[index + 1] : undefined,
  };
}
