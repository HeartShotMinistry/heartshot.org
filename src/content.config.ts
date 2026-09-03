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
  // .mdx (not just .md) so event pages can import and use <PayPalButton /> directly
  // in the content flow, instead of raw PayPal HTML mixed into prose.
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    // Seasonal events stay unpublished (and unbuilt) until it's time to run them again.
    // Flip to true, update the date/pricing/links in the body, flip back to false when done.
    published: z.boolean().default(false),
    // At most one event should be featured at a time — flipping this on is what
    // promotes it to the homepage flyer and the highlighted nav button. It only
    // takes effect while published is also true.
    featured: z.boolean().default(false),
    summary: z.string().optional(),
    flyer: z.string().optional(),
  }),
});

export const collections = { pages, events };
