import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    order: z.number(),
    title: z.string(),
    tagline: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).max(6),
    links: z
      .object({
        internal: z.string().startsWith('/').optional(),
        live: z.string().url().optional(),
        repo: z.string().url().optional(),
      })
      .refine((v) => !!(v.internal || v.live || v.repo), {
        message: 'At least one of links.{internal,live,repo} must be set',
      }),
    featured: z.boolean().default(false),
  }),
});

const now = defineCollection({
  type: 'content',
  schema: z.object({
    updated: z.coerce.date(),
    location: z.string(),
  }),
});

export const collections = { projects, now };
