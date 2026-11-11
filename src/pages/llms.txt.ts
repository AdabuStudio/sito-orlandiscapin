import type { APIRoute } from 'astro';
import { getPages, getPosts, getSettings } from '../lib/content';
import { absolute, pagePath, postPath } from '../lib/seo/url';
import { languageName, localePrefix, localizedSettings, siteLocales } from '../lib/i18n';

/** llms.txt: riassunto del sito per i motori generativi (GEO). Generato, mai scritto a mano. Lingua principale prima. */
export const GET: APIRoute = async () => {
  const base = await getSettings();
  const locales = siteLocales(base);
  const lines = [`# ${base.name}`, '', ...(base.tagline ? [`> ${base.tagline}`, ''] : [])];
  for (const lang of locales) {
    const s = localizedSettings(base, lang);
    const prefix = localePrefix(base, lang);
    const pages = (await getPages(lang)).filter((x) => !x.seo.noindex && x.slug !== 'privacy');
    if (!pages.length) continue;
    lines.push(locales.length > 1 ? `## ${languageName(lang)}` : '## Pagine principali', '');
    if (lang !== base.lang && s.tagline) lines.push(`> ${s.tagline}`, '');
    for (const p of pages) {
      const sum = p.geo?.summary ?? p.seo.metaDescription;
      lines.push(`- [${p.title}](${absolute(base, pagePath(p.slug, prefix))})${sum ? `: ${sum}` : ''}`);
    }
    if (base.collections.posts) {
      const posts = (await getPosts(lang)).filter((p) => !p.seo.noindex).slice(0, 10);
      if (posts.length) { lines.push('', locales.length > 1 ? `### Blog (${languageName(lang)})` : '## Ultimi articoli', ''); for (const p of posts) lines.push(`- [${p.title}](${absolute(base, postPath(p.slug, prefix))}): ${p.geo.summary ?? p.excerpt}`); }
    }
    lines.push('');
  }
  return new Response(lines.join('\n').replace(/\n+$/, '') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
