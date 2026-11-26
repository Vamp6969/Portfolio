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

// One YAML file per achievement in src/content/achievements/.
// Optional certificate scans go in src/assets/achievements/ and are referenced by relative path.
const achievements = defineCollection({
  type: 'data',
  schema: ({ image }) =>
    z.object({
      order: z.number(),
      title: z.string(), // e.g. "2nd place", "Participant", "AWS Certified Cloud Practitioner"
      event: z.string(), // hackathon / issuer
      kind: z.enum(['place', 'finalist', 'participation', 'cert']),
      place: z.number().int().min(1).max(9).optional(), // shown inside the rosette for kind: place
      date: z.string().optional(), // free text: "2025", "Mar 2025"
      detail: z.string().optional(),
      link: z.string().url().optional(),
      image: image().optional(),
    }),
});

export const collections = { projects, now, achievements };
