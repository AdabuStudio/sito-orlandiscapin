/**
 * Adattatore alternativo `fs` (solo per TEST dell'interfaccia): legge gli stessi JSON/MD
 * direttamente dal disco, senza content collections. Serve a dimostrare che i componenti
 * non dipendono dall'adattatore: `CONTENT_ADAPTER=fs` deve produrre lo stesso sito
 * (vedi tools/check-data-layer.mjs). Non usare in produzione.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { ContentAdapter } from './types';
import { optionalCollections, pageSchema, postSchema, settingsSchema } from '../schema';
import type { Post } from '../schema';

const base = () => path.resolve(process.env.CONTENT_DIR ?? './src/content');
/** File con estensione `ext` nella cartella `dir`, anche nelle sottocartelle (es. pages/en/), in ordine stabile. */
const filesIn = (dir: string, ext: string): string[] => {
  const d = path.join(base(), dir);
  if (!fs.existsSync(d)) return [];
  const walk = (p: string): string[] => fs.readdirSync(p, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(p, e.name)) : e.name.endsWith(ext) ? [path.join(p, e.name)] : []));
  return walk(d).sort();
};
const jsonIn = (dir: string) => filesIn(dir, '.json').map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));

async function parsePost(file: string): Promise<Post> {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`Frontmatter mancante: ${file}`);
  const { parse } = await import('yaml');
  const data = postSchema.parse(parse(m[1]));
  const { markdownToHtml } = await import('satteri');
  return { ...data, body: markdownToHtml(m[2], { features: { smartPunctuation: true } }).html };
}

export const fsAdapter: ContentAdapter = {
  async getSettings() { return settingsSchema.parse(JSON.parse(fs.readFileSync(path.join(base(), 'settings', 'site.json'), 'utf8'))); },
  async getPages() { return jsonIn('pages').map((p) => pageSchema.parse(p)); },
  async getPage(slug) { return (await this.getPages()).find((p) => p.slug === slug); },
  async getPosts() { return Promise.all(filesIn('posts', '.md').map(parsePost)); },
  async getCollectionItems(name) { return jsonIn(name).map((i) => optionalCollections[name].parse(i)) as never; },
};
