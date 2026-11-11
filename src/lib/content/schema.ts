/**
 * FONTE UNICA degli schemi dei contenuti (zod).
 *
 * Da qui derivano:
 *   - le content collections (src/content.config.ts) → livello `static`;
 *   - il futuro seed/mapping EmDash → livello `emdash`.
 * Gli schemi NON devono dipendere da `astro:content` (niente `image()`, niente `reference()`):
 * le immagini sono stringhe (nome file in src/assets/images/ oppure URL), così lo stesso
 * schema vale per file e per CMS.
 *
 * Lingue: `settings.lang` è la lingua principale (URL senza prefisso); `settings.locales` le altre (URL `/<lingua>/…`).
 * Ogni voce ha `lang` facoltativo (assente = lingua principale) e `translationKey` facoltativo (default = slug): voci con la
 * stessa chiave in lingue diverse sono traduzioni l'una dell'altra (hreflang, selettore lingua).
 *
 * Date: sempre ISO 8601 con orario e offset espliciti (es. "2026-10-11T23:59:59+02:00").
 * "Fino a domenica" = domenica 23:59:59 ora del sito, non mezzanotte UTC.
 */
import { z } from 'astro/zod';

const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;
export const isoDate = z
  .string()
  .refine((s) => ISO_DATETIME.test(s) && !Number.isNaN(Date.parse(s)), {
    message: 'Data ISO con orario e offset espliciti (es. 2026-10-11T23:59:59+02:00)',
  });

const cta = z.object({ label: z.string(), href: z.string() });
const i18nFields = { lang: z.string().optional(), translationKey: z.string().optional() };
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug: minuscole, numeri e trattini');

/* ---- SEO / GEO: contratto con GRIP 2 (vedi docs/CONTENT-CONTRACT.md) ------------------- */
export const seoSchema = z.object({
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  ogTitle: z.string().max(95).optional(),
  ogDescription: z.string().max(200).optional(),
  ogImage: z.string().optional(),
  canonical: z.string().url().optional(),
  noindex: z.boolean().default(false),
});

export const geoSchema = z.object({
  summary: z.string().max(400).optional(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  keyFacts: z.array(z.string()).default([]),
  author: z.string().optional(),
  reviewedAt: isoDate.optional(),
});

/* ---- Sezioni (blocchi) ---------------------------------------------------------------- */
export const sectionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('hero'), eyebrow: z.string().optional(), title: z.string(), subtitle: z.string().optional(), cta: cta.optional(), image: z.string().optional(), imageAlt: z.string().optional() }),
  z.object({ type: z.literal('text'), title: z.string().optional(), body: z.string() }),
  z.object({ type: z.literal('feature-grid'), title: z.string().optional(), subtitle: z.string().optional(), items: z.array(z.object({ icon: z.string().optional(), title: z.string(), text: z.string() })) }),
  z.object({ type: z.literal('gallery'), title: z.string().optional(), images: z.array(z.object({ src: z.string(), alt: z.string(), caption: z.string().optional() })) }),
  z.object({ type: z.literal('cta'), title: z.string(), text: z.string().optional(), cta: cta.optional() }),
  z.object({ type: z.literal('logos'), title: z.string().optional(), items: z.array(z.object({ src: z.string(), name: z.string(), href: z.string().optional() })) }),
  z.object({ type: z.literal('faq'), title: z.string().optional(), items: z.array(z.object({ q: z.string(), a: z.string() })) }),
  z.object({ type: z.literal('steps'), title: z.string().optional(), items: z.array(z.object({ title: z.string(), text: z.string() })) }),
  z.object({ type: z.literal('contact'), title: z.string().optional(), text: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), address: z.string().optional() }),
  /** Modulo contatti: invio dal Worker (`worker/contact.js`). Attivo solo con `settings.contactForm.enabled`. */
  z.object({ type: z.literal('contact-form'), title: z.string().optional(), text: z.string().optional(), phone: z.boolean().default(true), successMessage: z.string().optional() }),
  z.object({ type: z.literal('stat-band'), items: z.array(z.object({ value: z.string(), label: z.string() })) }),
  z.object({ type: z.literal('timeline'), title: z.string().optional(), items: z.array(z.object({ when: z.string(), title: z.string(), text: z.string().optional() })) }),
  z.object({ type: z.literal('split'), title: z.string(), text: z.string(), image: z.string().optional(), imageAlt: z.string().optional(), reverse: z.boolean().default(false), cta: cta.optional() }),
  z.object({ type: z.literal('map'), title: z.string().optional(), locationSlug: slug.optional(), lat: z.number().optional(), lng: z.number().optional() }),
  z.object({ type: z.literal('locations'), title: z.string().optional() }),
  z.object({ type: z.literal('services'), title: z.string().optional() }),
  z.object({ type: z.literal('events'), title: z.string().optional() }),
  z.object({ type: z.literal('notices'), title: z.string().optional() }),
  z.object({ type: z.literal('post-list'), title: z.string().optional(), limit: z.number().int().positive().default(3) }),
  /* ---- Blocchi su misura Orlandi & Scapin (src/components/blocks/os/) ---- */
  z.object({ type: z.literal('os-hero'), eyebrow: z.string().optional(), title: z.string(), subtitle: z.string().optional(),
    cta: cta.optional(), secondaryCta: cta.optional(), images: z.array(z.object({ src: z.string(), alt: z.string() })).min(1) }),
  z.object({ type: z.literal('os-studio'), id: z.string(), label: z.string(), title: z.string(), body: z.string(),
    servicesTitle: z.string().optional(), services: z.array(z.object({ title: z.string(), text: z.string() })) }),
  z.object({ type: z.literal('os-lavori'), id: z.string(), label: z.string(), title: z.string(), intro: z.string().optional(),
    projects: z.array(z.object({ title: z.string(), kind: z.string(), text: z.string().optional(),
      images: z.array(z.object({ src: z.string(), alt: z.string() })).min(1) })) }),
  z.object({ type: z.literal('os-numeri'), id: z.string(), label: z.string(), title: z.string(), body: z.string(),
    stats: z.array(z.object({ value: z.string(), label: z.string() })), image: z.string().optional(), imageAlt: z.string().optional() }),
  z.object({ type: z.literal('os-contatti'), id: z.string(), label: z.string(), title: z.string(), text: z.string().optional(),
    address: z.string(), mapsUrl: z.string().optional(), phone: z.string(), email: z.string(), formTitle: z.string().optional() }),
]);

/* ---- Collezioni ---------------------------------------------------------------------- */
export const pageSchema = z.object({
  ...i18nFields,
  slug: z.string().regex(/^(index|[a-z0-9]+(?:-[a-z0-9]+)*)$/),
  title: z.string(),
  navLabel: z.string().optional(),
  nav: z.boolean().default(true),
  order: z.number().default(0),
  seo: seoSchema.default({ noindex: false }),
  geo: geoSchema.optional(),
  sections: z.array(sectionSchema).default([]),
});

export const postSchema = z.object({
  ...i18nFields,
  title: z.string(),
  slug,
  date: isoDate,
  updated: isoDate.optional(),
  author: z.string(),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  excerpt: z.string().max(300),
  draft: z.boolean().default(false),
  seo: seoSchema.default({ noindex: false }),
  geo: geoSchema.default({ faq: [], keyFacts: [] }),
});

const address = z.object({
  street: z.string(),
  city: z.string(),
  region: z.string().optional(),
  postalCode: z.string(),
  country: z.string().default('IT'),
});
const latLng = z.object({ lat: z.number(), lng: z.number() });
const validity = { validFrom: isoDate.optional(), validUntil: isoDate.optional() };

export const locationSchema = z.object({
  ...i18nFields, slug, name: z.string(), address, geo: latLng.optional(), phone: z.string().optional(),
  email: z.string().optional(), openingHours: z.array(z.string()).default([]),
  image: z.string().optional(), description: z.string().optional(), order: z.number().default(0),
});
export const serviceSchema = z.object({
  ...i18nFields, slug, title: z.string(), summary: z.string(), description: z.string().optional(),
  image: z.string().optional(), order: z.number().default(0),
});
export const noticeSchema = z.object({
  ...i18nFields, slug, title: z.string(), text: z.string(), link: cta.optional(), ...validity,
});
export const eventSchema = z.object({
  ...i18nFields, slug, title: z.string(), description: z.string().optional(), startDate: isoDate,
  endDate: isoDate.optional(), location: z.string().optional(), url: z.string().optional(), ...validity,
});

export const settingsSchema = z.object({
  name: z.string(),
  tagline: z.string().optional(),
  /** Lingua principale (URL senza prefisso). */
  lang: z.string().default('it'),
  /** Altre lingue del sito (es. ["en"]): URL `/<lingua>/…`. Vuoto = sito in una lingua sola. */
  locales: z.array(z.string()).default([]),
  /** Testi di settings tradotti per lingua (es. { "en": { "tagline": "…" } }). */
  translations: z.record(z.string(), z.object({ tagline: z.string().optional(), headerCta: cta.optional() })).default({}),
  /** URL di PRODUZIONE, senza slash finale. Mai *.pages.dev / *.workers.dev. */
  url: z.string(),
  logo: z.string().optional(),
  ogImage: z.string().optional(),
  tier: z.enum(['static', 'emdash']).default('static'),
  /** Sottotipo schema.org di LocalBusiness (es. Restaurant, DrivingSchool) o Organization. */
  businessType: z.string().default('LocalBusiness'),
  /** true → il workflow giornaliero ricostruisce il sito (contenuti a scadenza). */
  scheduledRebuild: z.boolean().default(false),
  contact: z.object({ email: z.string().optional(), phone: z.string().optional(), address: address.optional() }).default({}),
  geo: latLng.optional(),
  openingHours: z.array(z.string()).default([]),
  socials: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
  legal: z.object({ companyName: z.string().optional(), vatId: z.string().optional(), address: z.string().optional() }).default({}),
  headerCta: cta.optional(),
  /** Menu ad ancore (sito a pagina unica): se presente sostituisce il menu generato dalle pagine. */
  menu: z.array(cta).default([]),
  /** Logo alternativo per il footer (se diverso da `logo`). */
  footerLogo: z.string().optional(),
  /** Modulo contatti (blocco `contact-form`). Destinatario e mittente stanno nelle variabili del Worker, non qui. */
  contactForm: z.object({
    enabled: z.boolean().default(false),
    /** Chiave pubblica Turnstile (facoltativa): con la chiave segreta TURNSTILE_SECRET_KEY nel Worker attiva l'antispam. */
    turnstileSiteKey: z.string().optional(),
  }).default({ enabled: false }),
  /** Collezioni opzionali attivabili per cliente. */
  collections: z.object({
    posts: z.boolean().default(false), locations: z.boolean().default(false), services: z.boolean().default(false),
    notices: z.boolean().default(false), events: z.boolean().default(false),
  }).default({ posts: false, locations: false, services: false, notices: false, events: false }),
  tracking: z.object({
    iubendaSiteId: z.string().optional(), iubendaCookiePolicyId: z.string().optional(),
    gtmId: z.string().optional(), blackboxEnabled: z.boolean().default(false),
  }).default({ blackboxEnabled: false }),
  design: z.object({
    colors: z.object({ primary: z.string(), secondary: z.string(), bg: z.string(), text: z.string(), accent: z.string() }),
    fonts: z.object({ display: z.string(), body: z.string() }),
    fontLinks: z.array(z.string()).default([]),
  }),
});

export type Settings = z.infer<typeof settingsSchema>;
export type Page = z.infer<typeof pageSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type Post = z.infer<typeof postSchema> & { body: string };
export type Seo = z.infer<typeof seoSchema>;
export type Geo = z.infer<typeof geoSchema>;

export const optionalCollections = {
  locations: locationSchema, services: serviceSchema, notices: noticeSchema, events: eventSchema,
} as const;
export type OptionalCollectionName = keyof typeof optionalCollections;
export type CollectionItem<K extends OptionalCollectionName> = z.infer<(typeof optionalCollections)[K]>;
