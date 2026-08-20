import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    // Seasonal events stay unpublished (and unbuilt) until it's time to run them again.
    // Flip to true, update the date/pricing/links in the body, flip back to false when done.
    published: z.boolean().default(false),
    summary: z.string().optional(),
    flyer: z.string().optional(),
  }),
});

export const collections = { pages, events };
