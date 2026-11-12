#!/usr/bin/env node
/**
 * Verifica SEO/GEO/produzione di una build (zero dipendenze).
 *   node tools/validate-seo.mjs [dist]            env: STAGE=staging|production, STRICT=1, CONTENT_DIR
 * Controlla: canonical e og:url per pagina (unici, coerenti, sul dominio di produzione), og:image
 * esistente, JSON-LD valido, sitemap/robots/llms, link interni root-relative, ordine dei tag di
 * consenso, staging noindex, produzione senza editor. STRICT=1 fallisce anche su placeholder {{…}}
 * e su asset brand ancora segnaposto.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(process.argv[2] ?? process.env.OUT_DIR ?? 'dist');
const STAGE = process.env.STAGE ?? (process.env.PUBLIC_STAGE === 'staging' ? 'staging' : 'production');
const STRICT = process.env.STRICT === '1';
const CONTENT_DIR = process.env.CONTENT_DIR ?? 'src/content';
const errors = [], warnings = [];
const err = (m) => errors.push(m), warn = (m) => warnings.push(m);

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const rel = (f) => path.relative(DIST, f);
const files = walk(DIST);
const pages = files.filter((f) => f.endsWith('.html'));
const settings = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, 'settings', 'site.json'), 'utf8'));
const prodUrl = settings.url.replace(/\/$/, '');
let prodHost = '';
if (/\{\{/.test(prodUrl)) (STRICT ? err : warn)(`settings.url è ancora un segnaposto (${settings.url}): controlli sul dominio saltati`);
else try { prodHost = new URL(prodUrl).host; } catch { err(`settings.url non è un URL valido: ${settings.url}`); }

const attr = (html, re) => (html.match(re) || [])[1];
const canonicals = new Map();
const indexable = [];
const hreflangs = [];   // [pagina, lingua, href]: verificati alla fine (devono puntare a pagine indicizzabili)

for (const f of pages) {
  const html = fs.readFileSync(f, 'utf8'); const name = rel(f);
  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
  const ogUrl = attr(html, /<meta property="og:url" content="([^"]*)"/);
  const ogImage = attr(html, /<meta property="og:image" content="([^"]*)"/);
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);

  if (!canonical) err(`${name}: canonical mancante`);
  if (!ogUrl) err(`${name}: og:url mancante`);
  else if (canonical && ogUrl !== canonical) err(`${name}: og:url (${ogUrl}) ≠ canonical (${canonical})`);
  if (!ogImage) err(`${name}: og:image mancante`);
  for (const [k, re] of [['og:title', /property="og:title"/], ['twitter:card', /name="twitter:card"/], ['description', /name="description" content="[^"]+"/], ['<title>', /<title>[^<]+<\/title>/]]) if (!re.test(html)) err(`${name}: ${k} mancante`);

  for (const u of [canonical, ogImage].filter(Boolean)) {
    if (/pages\.dev|workers\.dev/.test(u)) err(`${name}: URL assoluto su host di anteprima: ${u}`);
  }
  if (canonical && prodHost && /^https?:/.test(canonical) && new URL(canonical).host !== prodHost) err(`${name}: canonical fuori dal dominio di produzione: ${canonical}`);
  if (ogImage && prodHost && ogImage.startsWith(prodUrl)) {
    const p = ogImage.slice(prodUrl.length);
    if (!fs.existsSync(path.join(DIST, p))) err(`${name}: og:image non esiste in build: ${p}`);
  }
  if (name !== '404.html' && canonical && !noindex) {
    if (canonicals.has(canonical)) err(`${name}: canonical duplicato con ${canonicals.get(canonical)}`);
    canonicals.set(canonical, name);
    indexable.push(canonical);
  }

  for (const m of html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)) hreflangs.push([name, m[1], m[2]]);
  if (hreflangs.some(([n]) => n === name) && !/hreflang="x-default"/.test(html)) err(`${name}: hreflang senza x-default`);

  // JSON-LD
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  for (const b of blocks) {
    try {
      const d = JSON.parse(b);
      if (d['@context'] !== 'https://schema.org') err(`${name}: JSON-LD senza @context schema.org`);
      if (!d['@type']) err(`${name}: JSON-LD senza @type`);
      if (d['@type'] === 'FAQPage' && !(d.mainEntity?.length)) err(`${name}: FAQPage senza mainEntity`);
      if (d['@type'] === 'BreadcrumbList' && !(d.itemListElement?.length)) err(`${name}: BreadcrumbList vuota`);
      if (d['@type'] === 'BlogPosting') for (const k of ['headline', 'datePublished', 'author']) if (!d[k]) err(`${name}: BlogPosting senza ${k}`);
    } catch (e) { err(`${name}: JSON-LD non valido (${e.message})`); }
  }
  if (name === 'index.html' && !blocks.some((b) => /"@id":"[^"]*#organization"/.test(b))) err('index.html: manca Organization/LocalBusiness');

  // Link interni: root-relative (mai col dominio di produzione negli href/src)
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(?:https?:)?\/\/(?:[^/]*\.)?(?:pages|workers)\.dev/.test(u)) err(`${name}: riferimento a host di anteprima: ${u}`);
    if (prodHost && u.startsWith(prodUrl) && !/rel="canonical"|hreflang=|og:|sitemap/.test(m.input.slice(Math.max(0, m.index - 80), m.index))) warn(`${name}: link assoluto al proprio dominio (usa root-relative): ${u}`);
  }

  // Staging / produzione
  const hasEditor = html.includes('/assets/js/editor.js') || html.includes('AUT_EDITOR_PASSWORD');
  if (STAGE === 'production' && hasEditor) err(`${name}: editor o password presenti in produzione`);
  if (STAGE === 'staging') {
    if (!noindex) err(`${name}: staging senza noindex`);
    if (/data-tracking=/.test(html)) err(`${name}: tracciamento presente in staging`);
  }

  // Ordine consenso → iubenda → GTM
  const iConsent = html.indexOf('data-tracking="consent-default"'), iIub = html.indexOf('data-tracking="iubenda"'), iGtm = html.indexOf('data-tracking="gtm"');
  if (iGtm >= 0 && !(iConsent >= 0 && iConsent < iGtm)) err(`${name}: GTM caricato senza Consent Mode default prima`);
  if (iIub >= 0 && !(iConsent >= 0 && iConsent < iIub)) err(`${name}: iubenda prima del Consent Mode default`);
  if (iIub >= 0 && iGtm >= 0 && iIub > iGtm) err(`${name}: GTM caricato prima di iubenda`);
  if (iConsent >= 0 && !/analytics_storage:'denied'/.test(html)) err(`${name}: Consent Mode default non "denied"`);

  const ph = (html.match(/\{\{[^}]+\}\}/g) || []).length;
  if (ph) (STRICT ? err : warn)(`${name}: ${ph} placeholder {{…}} non sostituiti`);
}

// File di servizio
const read = (p) => (fs.existsSync(path.join(DIST, p)) ? fs.readFileSync(path.join(DIST, p), 'utf8') : null);
const robots = read('robots.txt'), sitemap = read('sitemap.xml'), llms = read('llms.txt');
if (!robots) err('robots.txt mancante');
else if (STAGE === 'staging' ? !/Disallow: \/\s*$/m.test(robots) : !/Sitemap: /.test(robots) || /Disallow: \/\s*$/m.test(robots)) err(`robots.txt non coerente con lo stage ${STAGE}`);
if (!sitemap) err('sitemap.xml mancante');
else {
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const c of indexable) if (!locs.includes(c) && !/\/privacy\/$/.test(c)) err(`sitemap: manca ${c}`);
  for (const l of locs) if (!canonicals.has(l)) err(`sitemap: ${l} non corrisponde a nessuna pagina indicizzabile`);
}
if (!llms) err('llms.txt mancante');
if (STAGE === 'production') for (const [n, l, href] of hreflangs) if (!canonicals.has(href)) err(`${n}: hreflang ${l} → ${href} non è una pagina indicizzabile del sito`);
if (!fs.existsSync(path.join(DIST, '404.html'))) err('404.html mancante');

// Asset brand ancora segnaposto
if (fs.existsSync('tools/PLACEHOLDER-ASSETS.md')) (STRICT ? err : warn)('favicon/og-image sono ancora segnaposto: lancia `npm run assets -- <logo> <hero>`');

console.log(`validate-seo: ${pages.length} pagine HTML, stage=${STAGE}${STRICT ? ', STRICT' : ''}`);
for (const w of warnings) console.log(`  ⚠ ${w}`);
for (const e of errors) console.log(`  ✗ ${e}`);
if (errors.length) { console.log(`\n${errors.length} errori`); process.exit(1); }
console.log('  ✓ tutto ok');
