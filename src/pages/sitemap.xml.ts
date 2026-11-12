import type { APIRoute } from 'astro';
import { getPages, getPosts, getSettings } from '../lib/content';
import { absolute, blogPath, pagePath, postPath } from '../lib/seo/url';
import { langOf, localePrefix, siteLocales } from '../lib/i18n';

/**
 * Sitemap generata dallo strato dati (non da @astrojs/sitemap) così esclude da sola
 * noindex, bozze e post futuri, e usa `updated` come lastmod. Tutte le lingue; le traduzioni
 * sono collegate dagli hreflang nelle pagine.
 */
export const GET: APIRoute = async () => {
  const s = await getSettings();
  const urls: { loc: string; lastmod?: string }[] = [];
  // In staging tutto è noindex (e robots.txt è Disallow): sitemap vuota, coerente.
  if (import.meta.env.PUBLIC_STAGE === 'staging') return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n', { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
  for (const p of await getPages()) if (!p.seo.noindex && p.slug !== 'privacy') urls.push({ loc: p.seo.canonical ?? absolute(s, pagePath(p.slug, localePrefix(s, langOf(s, p)))) });
  if (s.collections.posts) {
    const posts = await getPosts();
    for (const lang of siteLocales(s)) if (posts.some((p) => langOf(s, p) === lang)) urls.push({ loc: absolute(s, blogPath(localePrefix(s, lang))) });
    for (const p of posts) if (!p.seo.noindex) urls.push({ loc: p.seo.canonical ?? absolute(s, postPath(p.slug, localePrefix(s, langOf(s, p)))), lastmod: (p.updated ?? p.date).slice(0, 10) });
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
