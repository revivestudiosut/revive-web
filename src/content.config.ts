import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    location: z.string(),
    description: z.string(),
    hero: z.string(),
    gallery: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    completedAt: z.coerce.date().optional(),
  }),
});

const journal = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    hero: z.string().optional(),
    publishedAt: z.coerce.date(),
    project: reference('projects').optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { projects, journal };
