/** Generatori JSON-LD (schema.org). Tutti gli URL assoluti passano da `absolute()` → `site.url`. */
import type { CollectionItem, Post, Settings } from '../content';
import { absolute, postPath } from './url';

type Json = Record<string, unknown>;

/** Rimuove undefined/null/array vuoti, ricorsivamente. */
export function prune<T>(v: T): T {
  if (Array.isArray(v)) return v.map(prune).filter((x) => x !== undefined) as T;
  if (v && typeof v === 'object') {
    const out: Json = {};
    for (const [k, val] of Object.entries(v as Json)) {
      const p = prune(val);
      if (p === undefined || p === null || (Array.isArray(p) && !p.length)) continue;
      out[k] = p;
    }
    return out as T;
  }
  return v;
}

const postal = (a?: { street: string; city: string; region?: string; postalCode: string; country: string }) =>
  a && { '@type': 'PostalAddress', streetAddress: a.street, addressLocality: a.city, addressRegion: a.region, postalCode: a.postalCode, addressCountry: a.country };

const img = (s: Settings, p?: string) => (p ? absolute(s, p.startsWith('/') || /^https?:/.test(p) ? p : `/assets/img/${p}`) : undefined);

export const orgId = (s: Settings) => `${absolute(s, '/')}#organization`;

export function organization(s: Settings): Json {
  const hasPlace = s.businessType !== 'Organization';
  return prune({
    '@context': 'https://schema.org',
    '@type': s.businessType,
    '@id': orgId(s),
    name: s.name,
    description: s.tagline,
    url: absolute(s, '/'),
    logo: img(s, s.logo),
    image: img(s, s.ogImage ?? '/assets/img/og-image.jpg'),
    email: s.contact.email,
    telephone: s.contact.phone,
    address: postal(s.contact.address),
    geo: hasPlace && s.geo ? { '@type': 'GeoCoordinates', latitude: s.geo.lat, longitude: s.geo.lng } : undefined,
    openingHours: hasPlace ? s.openingHours : undefined,
    sameAs: s.socials.map((x) => x.href).filter((h) => /^https?:/.test(h)),
    vatID: s.legal.vatId,
    legalName: s.legal.companyName,
  });
}

export const website = (s: Settings, lang = s.lang, home = '/'): Json => prune({
  '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${absolute(s, home)}#website`,
  name: s.name, url: absolute(s, home), inLanguage: lang, publisher: { '@id': orgId(s) },
});

export const breadcrumb = (s: Settings, items: { name: string; path: string }[]): Json => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absolute(s, it.path) })),
});

export const faqPage = (faqs: { q: string; a: string }[]): Json => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const article = (s: Settings, p: Post, lang = s.lang, path = postPath(p.slug)): Json => prune({
  '@context': 'https://schema.org', '@type': 'BlogPosting',
  headline: p.title, description: p.excerpt, image: img(s, p.cover),
  datePublished: p.date, dateModified: p.updated ?? p.date, inLanguage: lang,
  author: { '@type': 'Person', name: p.geo.author ?? p.author },
  publisher: { '@id': orgId(s) },
  mainEntityOfPage: absolute(s, path),
});

export const locationBusiness = (s: Settings, l: CollectionItem<'locations'>): Json => prune({
  '@context': 'https://schema.org', '@type': s.businessType === 'Organization' ? 'LocalBusiness' : s.businessType,
  '@id': `${absolute(s, '/')}#location-${l.slug}`,
  name: `${s.name} — ${l.name}`, image: img(s, l.image), telephone: l.phone ?? s.contact.phone, email: l.email ?? s.contact.email,
  address: postal(l.address), geo: l.geo && { '@type': 'GeoCoordinates', latitude: l.geo.lat, longitude: l.geo.lng },
  openingHours: l.openingHours, parentOrganization: { '@id': orgId(s) }, url: absolute(s, '/'),
});

export const event = (s: Settings, e: CollectionItem<'events'>): Json => prune({
  '@context': 'https://schema.org', '@type': 'Event', name: e.title, description: e.description,
  startDate: e.startDate, endDate: e.endDate, url: e.url ? absolute(s, e.url) : undefined,
  location: e.location && { '@type': 'Place', name: e.location }, organizer: { '@id': orgId(s) },
});
