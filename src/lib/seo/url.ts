import type { Settings } from '../content';

/**
 * Path di una pagina: `index` → `/`, altrimenti `/slug/` (trailing slash, coerente con CF `auto-trailing-slash`).
 * `prefix` = prefisso della lingua ('' per la principale, '/en' per le altre: `localePrefix()` in src/lib/i18n.ts).
 */
export const pagePath = (slug: string, prefix = '') => (slug === 'index' ? `${prefix}/` : `${prefix}/${slug}/`);
export const blogPath = (prefix = '') => `${prefix}/blog/`;
export const postPath = (slug: string, prefix = '') => `${prefix}/blog/${slug}/`;

/** URL assoluto SOLO per canonical/og/JSON-LD: sempre sul dominio di produzione (`site.url`). */
export const absolute = (settings: Pick<Settings, 'url'>, p: string) =>
  /^https?:\/\//.test(p) ? p : `${settings.url.replace(/\/$/, '')}${p.startsWith('/') ? p : `/${p}`}`;

export const isExternal = (href: string) => /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
