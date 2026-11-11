import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { locationSchema, noticeSchema, eventSchema, pageSchema, postSchema, serviceSchema, settingsSchema } from './lib/content/schema';

/** I contenuti del sito stanno in src/content/. `CONTENT_DIR` li sposta (es. examples/…). */
const base = process.env.CONTENT_DIR ?? './src/content';
/** id = `<lingua>/<slug>` (stesso slug in lingue diverse = voci diverse). Le traduzioni possono stare in sottocartelle (es. pages/en/). */
const json = (dir: string, schema: Parameters<typeof defineCollection>[0]['schema']) =>
  defineCollection({ loader: glob({ pattern: '**/*.json', base: `${base}/${dir}`, generateId: ({ data }) => { const d = data as { slug?: string; lang?: string }; return d.slug ? `${d.lang ?? '_'}/${d.slug}` : 'site'; } }), schema });

export const collections = {
  settings: json('settings', settingsSchema),
  pages: json('pages', pageSchema),
  posts: defineCollection({ loader: glob({ pattern: '**/*.md', base: `${base}/posts` }), schema: postSchema }),
  locations: json('locations', locationSchema),
  services: json('services', serviceSchema),
  notices: json('notices', noticeSchema),
  events: json('events', eventSchema),
};
