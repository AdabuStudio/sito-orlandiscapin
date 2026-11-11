---
name: build-astro-site
description: >
  Costruire e aggiornare un sito brochure Adabù v2 (Astro 7, output statico, Cloudflare Workers
  con file statici): contenuti in src/content, blocchi in src/components/blocks, strato dati in
  src/lib/content, SEO/GEO generati. Usalo quando lavori DENTRO un repo sito v2 (template o cliente)
  per aggiungere pagine, sezioni, post, sedi, per buildare o fare deploy. NON per i siti v1 (vedi docs/V1-LEGACY.md).
---

# build-astro-site — sito Astro statico su Cloudflare Workers

> Vale nel **repo cliente**: il codice (src/, tools/, qa/, package.json) arriva dallo scaffold del ramo `v2-astro-riferimento`
> (skill `new-client-site`, passo 1). Il repo template contiene solo istruzioni.

> **Prima di tutto: versione.** Se manca `template.json` (o `engine` ≠ `astro`) e ci sono `build.js` +
> `site.config.json`, il repo è **v1**: NON applicare questa skill, leggi `docs/V1-LEGACY.md`.

## Modello mentale
- Contenuti = file in `src/content/` (JSON/MD), validati da zod. **Schemi in un posto solo:** `src/lib/content/schema.ts`.
- Componenti e pagine leggono SOLO da `src/lib/content` (`getSettings`, `getPage(s)`, `getPosts`, `getCollectionItems`).
  Mai `astro:content` / `getCollection` altrove (`npm run check:data-layer` lo verifica).
- Output: HTML statico in `dist/`, servito da un Worker con `assets.directory = ./dist`. Il codice del Worker (`worker/`) gira
  **solo per `/api/*`** (oggi il modulo contatti): le pagine non lo invocano.
- SEO/GEO non si scrive a mano: lo generano `Head.astro`, `JsonLd.astro`, gli endpoint `sitemap.xml`, `robots.txt`, `llms.txt`.

## Dove si mette cosa
| Cosa | Dove |
|---|---|
| Identità, contatti, legale, tracciamento, design token, collezioni attive | `src/content/settings/site.json` |
| Pagina (slug, title, nav, order, seo, geo, `sections[]`) | `src/content/pages/<slug>.json` (`index` = home) |
| Pagina in un'altra lingua | `src/content/pages/<lingua>/<slug>.json` con `"lang": "en"` e `"translationKey"` = slug della pagina originale |
| Articolo blog | `src/content/posts/<slug>.md` (frontmatter = `postSchema`) |
| Sedi / servizi / avvisi / eventi (attivabili in `settings.collections`) | `src/content/{locations,services,notices,events}/*.json` |
| Immagini | `src/assets/images/<file>` → riferite col SOLO nome (`"hero.jpg"`): `astro:assets` fa webp/srcset |
| File servibili as-is (pdf, gpx…) | `public/` (path root-relative) |
| Favicon/og-image | `public/assets/img/` (generati da `npm run assets`) |

## Blocchi (`sections[].type`)
`hero`, `text`, `feature-grid`, `gallery`, `cta`, `logos`, `faq`, `steps`, `contact`, `stat-band`, `timeline`,
`split`, `map`, `locations`, `services`, `events`, `notices`, `post-list`, `contact-form`. Campi esatti: `sectionSchema` in `schema.ts`.
Nuovo blocco = (1) variante in `sectionSchema`, (2) componente in `src/components/blocks/`, (3) voce in `Sections.astro`.
Il campo `text.body` accetta paragrafi (riga vuota), liste (`- `), `**grassetto**`, `[link](url)`: tutto escapato.

## Regole che il build fa rispettare
- `settings.url` = dominio di PRODUZIONE (mai `*.pages.dev`/`*.workers.dev`). Link e asset interni **root-relative**.
- Contenuti a scadenza: `validFrom`/`validUntil` (ISO con offset, es. `2026-10-11T23:59:59+02:00`). Il filtro è al BUILD:
  con `scheduledRebuild: true` il workflow giornaliero ricostruisce. "Fino a domenica" = domenica 23:59:59 ora del sito.
- `PUBLIC_STAGE=production` (default): niente editor mockup, niente password nell'HTML. `staging`: noindex, `Disallow: /`, niente tracciamento.
- `STRICT=1` (su `main`): la build fallisce con placeholder `{{…}}` o favicon/og-image ancora segnaposto.

## Lingue
- `settings.lang` = lingua principale (URL senza prefisso); `settings.locales` = altre lingue (URL `/<lingua>/…`).
- Ogni voce ha `lang` (assente = principale) e `translationKey` (default = slug): stessa chiave = traduzione. Da qui
  vengono `hreflang`, selettore lingua, menu e sitemap per lingua. Pagina senza traduzione: il selettore porta alla home di quella lingua.
- Sedi/servizi/avvisi/eventi **senza** `lang` valgono in tutte le lingue finché non scrivi la loro traduzione.
- Testi fissi dell'interfaccia (menu, footer, cookie, modulo…): `src/lib/i18n.ts` (it, en). Lingua nuova = aggiungi lì il blocco
  di testi; senza, si usa l'inglese (avviso in build). Tagline e CTA dell'header per lingua: `settings.translations.<lingua>`.
- Link scritti nei contenuti di una lingua aggiuntiva vanno con il prefisso (`/en/contact/`).

## Modulo contatti (blocco `contact-form`)
- Si attiva con `settings.contactForm.enabled` e le variabili del Worker in `wrangler.jsonc` (`CONTACT_TO`, `CONTACT_FROM`,
  binding `send_email`): le imposta `init-client --contatti=<email>`. Codice: `worker/contact.js`, test: `npm run check:contact`.
- Antispam incluso (campo nascosto + tempo minimo). Turnstile facoltativo: chiave pubblica in `settings.contactForm.turnstileSiteKey`,
  chiave segreta come secret del Worker `TURNSTILE_SECRET_KEY`.
- **Anteprime**: il modulo valida ma non invia (modalità prova, `CONTACT_DRY_RUN` nel blocco `previews`). Email vere solo in produzione.
- Prova in locale col Worker vero: `npm run build && npx wrangler dev --var CONTACT_DRY_RUN:1`.

## Comandi
```bash
npm run dev                # staging locale (editor se EDITOR_PASSWORD)
npm run build              # build + validate-seo
STRICT=1 npm run build     # come su main
npm run build:example      # esempio examples/local-business
npm test                   # esempio + SEO + strato dati + produzione pulita
npm run qa                 # screenshot desktop/mobile, link rotti, errori JS (skill playwright-qa)
npm run assets -- logo.png hero.jpg   # favicon + og-image
```

## Tracciamento e consenso
`settings.tracking`: `iubendaSiteId`, `iubendaCookiePolicyId`, `gtmId`, `blackboxEnabled`. Ordine nel `<head>`:
Consent Mode v2 (default denied) → iubenda → GTM. Senza iubenda resta il banner "solo cookie tecnici".
Il tracciamento server-side (BlackBox/CAPI) deve rispettare il consenso: `blackboxEnabled` non autorizza nulla da solo.

## Design
Direzione visiva con `impeccable` + `ui-ux-pro-max` (regia `house-style`); testi con `stop-slop`; qualità con `web-quality-audit`. I token (`settings.design`) sono l'unica fonte di colori/font:
`global.css` non ha default che li sovrascrivano. Mai ereditare palette/tipografia da un altro cliente (regola madre).

## Deploy
GitHub Actions (`deploy.yml`), **un solo Worker** (nome in `wrangler.jsonc`): `main` → produzione (`wrangler deploy`); `staging` e
ogni altro ramo → **anteprima** dello stesso Worker (`wrangler preview --name <ramo>`, URL `<ramo>-<slug>.<sottodominio>.workers.dev`);
ramo cancellato → anteprima eliminata. Nome anteprima: `node tools/worker-name.mjs --preview <ramo>`. Accessi e secret:
`docs/CLOUDFLARE-ACCESS.md`. Mai push su `main`. Livello `emdash`: dati condivisi con la produzione, regole in `docs/SITE-RULES.md` §Dati.

## Livello `emdash`
Solo interfaccia e scheletro (`adapters/emdash.ts`). Passare di livello = cambiare `settings.tier`, implementare l'adattatore,
importare i JSON: nessun componente da riscrivere.
