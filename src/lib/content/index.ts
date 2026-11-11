/**
 * STRATO DATI COMUNE — l'unico punto d'accesso ai contenuti per componenti e pagine.
 * Mai `getCollection`/`astro:content` altrove (verificato da `npm run check:data-layer`).
 *
 * Scelta dell'adattatore: `settings.tier`. `settings/site.json` resta SEMPRE nel repo e
 * viene letto con l'adattatore `files` per sapere il tier (anche per `emdash`).
 * `CONTENT_ADAPTER=fs` forza l'adattatore di test.
 *
 * Lingue: le funzioni accettano `lang` facoltativo. Senza `lang` restituiscono le voci di TUTTE le lingue (sitemap,
 * llms.txt); con `lang` solo quelle di quella lingua (voce senza `lang` = lingua principale). Vedi src/lib/i18n.ts.
 */
import { filesAdapter } from './adapters/files';
import { fsAdapter } from './adapters/fs';
import { emdashAdapter } from './adapters/emdash';
import type { ContentAdapter } from './adapters/types';
import type { CollectionItem, OptionalCollectionName, Page, Post, Settings } from './schema';
import { keyOf, langOf, siteLocales } from '../i18n';

let cached: { adapter: ContentAdapter; settings: Settings } | undefined;

async function ctx() {
  if (cached) return cached;
  const forced = process.env.CONTENT_ADAPTER;
  const bootstrap = forced === 'fs' ? fsAdapter : filesAdapter;
  const settings = await bootstrap.getSettings();
  const adapter = forced === 'fs' ? fsAdapter : settings.tier === 'emdash' ? emdashAdapter : filesAdapter;
  return (cached = { adapter, settings: adapter === bootstrap ? settings : await adapter.getSettings() });
}

/** Voci con `validFrom` futuro o `validUntil` passato non sono "attive". Valutato al BUILD. */
export function isActive(item: { validFrom?: string; validUntil?: string }, now = new Date()): boolean {
  if (item.validFrom && new Date(item.validFrom) > now) return false;
  if (item.validUntil && new Date(item.validUntil) < now) return false;
  return true;
}

const isProduction = () => process.env.PUBLIC_STAGE !== 'staging';

export async function getSettings(): Promise<Settings> { return (await ctx()).settings; }

/** Lingue del sito, la principale per prima. */
export async function getLocales(): Promise<string[]> { return siteLocales(await getSettings()); }

const inLang = <T extends { lang?: string }>(s: Settings, items: T[], lang?: string) => (lang ? items.filter((i) => langOf(s, i) === lang) : items);

export async function getPages(lang?: string): Promise<Page[]> {
  const { adapter, settings } = await ctx();
  // Ordine stabile qualunque sia l'adattatore: order, titolo, poi lingua (principale prima) e slug.
  const rank = (p: Page) => siteLocales(settings).indexOf(langOf(settings, p));
  return inLang(settings, await adapter.getPages(), lang)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title) || rank(a) - rank(b) || a.slug.localeCompare(b.slug));
}
export async function getPage(slug: string, lang?: string): Promise<Page | undefined> {
  const { settings } = await ctx();
  return (await getPages(lang ?? settings.lang)).find((p) => p.slug === slug);
}


/** Post pubblicati (non bozza; data non futura), dal più recente. In staging si vedono anche le bozze. */
export async function getPosts(lang?: string): Promise<Post[]> {
  const now = new Date();
  const { adapter, settings } = await ctx();
  return inLang(settings, await adapter.getPosts(), lang)
    .filter((p) => !isProduction() || (!p.draft && new Date(p.date) <= now))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export async function getCollectionItems<K extends OptionalCollectionName>(
  name: K, opts: { now?: Date; limit?: number; lang?: string } = {},
): Promise<CollectionItem<K>[]> {
  const { adapter, settings } = await ctx();
  // Collezioni (sedi, servizi, avvisi, eventi): una voce SENZA `lang` vale in tutte le lingue finché non esiste la sua
  // traduzione (stessa translationKey) in quella lingua. Così una sede si scrive una volta e si traduce solo se serve.
  type Item = CollectionItem<K> & { slug: string; order?: number; startDate?: string; validFrom?: string; validUntil?: string; lang?: string; translationKey?: string };
  const raw = (await adapter.getCollectionItems(name)) as Item[];
  const lang = opts.lang;
  const items = !lang ? raw : raw.filter((i) => langOf(settings, i) === lang
    || (i.lang === undefined && !raw.some((x) => x.lang === lang && keyOf(x) === keyOf(i))));
  const active = items.filter((i) => isActive(i, opts.now));
  if (name === 'events') active.sort((a, b) => Date.parse(a.startDate!) - Date.parse(b.startDate!));
  else active.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (opts.limit ? active.slice(0, opts.limit) : active) as CollectionItem<K>[];
}

export type { Settings, Page, Post, Section, Seo } from './schema';
