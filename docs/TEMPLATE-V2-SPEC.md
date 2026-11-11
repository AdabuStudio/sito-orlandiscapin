# Adabu Site Template — v2 (Astro + Workers, SEO/GEO first)

> Brief per Claude Code. Si lavora sul repo `AdabuStudio/Adabu-Site-Template`.
> Branch di lavoro: `v2-astro` (creato da `setup-base`). Mai push su `main`. PR in draft.

## 0. Contesto e decisioni (5 ott 2026, già prese, non rimetterle in discussione)

- Tutti i siti cliente **senza e-commerce** si fanno in **Astro** e vanno su **Cloudflare Workers con file statici** (non su Pages).
- Se c'è e-commerce si usa WordPress + WooCommerce oppure Shopify, fuori da questo template.
- Il template ha **due livelli**, con lo stesso codice:
  - **Livello 1, `static`** (predefinito): Astro senza server, contenuti in content collections (JSON/MD nel repo), nessun D1 e nessun R2. Per siti aggiornati di rado da Adabù.
  - **Livello 2, `emdash`**: stesso template con EmDash (CMS Cloudflare su Astro) + D1 + R2, per clienti che modificano da soli o hanno un blog alimentato da GRIP 2. **In questa v2 si prepara solo l'aggancio** (vedi §4); l'adattatore EmDash si implementa in un secondo momento.
- Gli utenti dei clienti **non** devono avere account su piattaforme di terzi.
- Privacy e cookie con **iubenda**.
- Il protocollo VibeCode (`00_PROTOCOL`) deve stare in ogni repo cliente.

## 1. Prima di iniziare

1. Crea il tag `v1-static-zero-build` sul commit attuale di `setup-base`. I siti già fatti con build.js (es. asolo100km) restano su v1.
2. Leggi `CLAUDE.md`, `docs/TEMPLATE-GUIDELINES.md` e tutte le skill in `.claude/skills/`.
3. Leggi il protocollo in `AdabuStudio/adabu-vibecode` (vedi §9).

## 2. Cosa TENERE (spostandolo nella nuova struttura)

- Skill `new-client-site` con i tre tipi di lavoro (1 clone / 2 redesign / 3 nuovo) e i gate umani.
- Skill `frontend-design` (vendorizzata), `house-style`, `playwright-qa`.
- Regola madre "redesign da zero partendo dal sito vecchio".
- URL indipendenti dal dominio: link e asset sempre relativi alla radice; URL assoluti solo per canonical, og e JSON-LD, sempre su `site.url`.
- Flusso staging → main (fast-forward), anteprime per branch.
- Generatore favicon + immagine OG (`tools/gen-assets.mjs`).
- Micro-interazioni di `site.js` → diventano un componente/script Astro.
- Editor mockup `editor.js` (con le correzioni di §7).
- Guardia nel `CLAUDE.md`: niente siti cliente nel repo template.

## 3. Cosa SOSTITUIRE

| Prima | Dopo |
|---|---|
| `build.js` + `site.config.json` + `src/blocks/*.html` | Astro (ultima versione stabile), `output: 'static'` |
| `src/partials/base.html` | `src/layouts/Base.astro` + `src/components/seo/*` |
| blocchi HTML | componenti `src/components/blocks/*.astro` (stessi blocchi: hero, text, feature-grid, gallery, cta, logos, faq, steps, contact) |
| `wrangler pages deploy` | `wrangler deploy` (Worker con `assets.directory = ./dist`) |
| regola "mai D1/R2" | "mai D1/R2 al livello `static`" |
| immagini copiate a mano | `astro:assets` (webp/avif, srcset, dimensioni) |

## 4. Modello dei contenuti e strato dati (PUNTO CRITICO)

### 4.1 Content collections (`src/content.config.ts`, schemi zod)
- `settings` (singolo file `src/content/settings/site.json`): nome, `url` di produzione, lingua, tagline, logo, contatti, social, dati legali (ragione sociale, P.IVA, sede), `tier: 'static' | 'emdash'`, tracciamento (§6), design token (palette, font).
- `pages`: `slug`, `title`, `seo` (blocco §5), `sections[]` (tipo di blocco + campi), `order`, `nav`.
- `posts` (blog): `title`, `slug`, `date`, `updated`, `author`, `cover`, `excerpt`, `seo`, `geo`, body MD/MDX.
- Collezioni opzionali, attivabili per cliente: `locations` (sedi), `services`, `notices` (bacheca: `validFrom`, `validUntil`), `events`.

### 4.2 Strato dati comune — obbligatorio
- I componenti e le pagine **non** chiamano mai `getCollection` direttamente. Usano `src/lib/content/index.ts`:
  `getSettings()`, `getPage(slug)`, `getPages()`, `getPosts()`, `getCollectionItems(name, opts)`.
- Due adattatori dietro la stessa interfaccia:
  - `adapters/files.ts`: implementato, legge le content collections.
  - `adapters/emdash.ts`: **solo uno scheletro** che implementa l'interfaccia e lancia "not implemented", con commenti su come mapparlo (`getEmDashCollection` / `getEmDashEntry`).
- La scelta dell'adattatore dipende da `settings.tier`.
- **Gli schemi dei campi devono essere identici** a quelli che userà il seed EmDash: scrivili in `src/lib/content/schema.ts` come fonte unica, e da lì derivino sia le content collections sia il futuro seed.
- Obiettivo: passare dal livello 1 al 2 = cambiare `tier`, implementare l'adattatore EmDash, importare i JSON. **Nessun componente da riscrivere.**

### 4.3 Contenuti a scadenza
- `getCollectionItems` filtra da solo le voci con `validUntil` passato e `validFrom` futuro.
- Al livello statico il filtro si applica solo in fase di build: aggiungi un workflow GitHub Actions con `schedule` (ogni giorno alle 05:00 UTC) che ricostruisce e ripubblica **solo se** il sito ha collezioni con date (`settings.scheduledRebuild: true`).
- Le date si salvano in ISO con orario esplicito. Nei commenti: "fino a domenica" = domenica 23:59 ora del sito.

## 5. SEO / GEO (tutto generato dal template, mai a mano)

### 5.1 Blocco `seo` (su ogni pagina e post)
`metaTitle` (opzionale, default = title), `metaDescription`, `ogTitle`, `ogDescription`, `ogImage`, `canonical` (opzionale, default = URL della pagina), `noindex` (boolean).

### 5.2 Blocco `geo` (post e pagine principali)
`summary` (TL;DR 2-3 frasi), `faq[]` (domanda/risposta), `keyFacts[]`, `author`, `reviewedAt`.

### 5.3 Componenti
- `components/seo/Head.astro`: title, description, **canonical per pagina**, og/twitter **per pagina** (correggere il bug della v1, dove `og:url` era sempre la home), hreflang se multilingua.
- `components/seo/JsonLd.astro` con generatori in `lib/seo/schema.ts`:
  `Organization` o `LocalBusiness` (sottotipo configurabile, es. `Restaurant`, `DrivingSchool`), `WebSite`, `BreadcrumbList`, `Article`/`BlogPosting` sui post, `FAQPage` dove c'è un blocco faq o `geo.faq`, `LocalBusiness` per ogni voce di `locations`, `Event` per `events`.
- `@astrojs/sitemap` (escludere `noindex`), `robots.txt` generato (punta alla sitemap; staging in `Disallow: /`), `llms.txt` generato (nome, descrizione, pagine principali con riassunto, ultimi post).
- Pagina 404 personalizzata.

### 5.4 Requisiti per GRIP 2
Lo schema `seo` + `geo` è il **contratto con GRIP 2**: documentalo in `docs/CONTENT-CONTRACT.md` (campi, tipi, limiti di lunghezza, esempi). Deve restare identico in tutti i siti.

## 6. Tracciamento e consenso

- In `settings.tracking`: `iubendaSiteId`, `iubendaCookiePolicyId`, `gtmId`, `blackboxEnabled`.
- Ordine nel `<head>`: 1) Consent Mode v2 con default **denied**, 2) iubenda Cookie Solution, 3) GTM. GTM si carica solo se c'è `gtmId`.
- Se non c'è tracciamento: resta il banner informativo "solo cookie tecnici" della v1.
- Pagine Privacy e Cookie Policy: embed o link iubenda, configurati da settings.
- Commento esplicito e test: il tracciamento lato server (BlackBox/CAPI) deve rispettare lo stato del consenso.
- Niente tracciamento in staging (o GTM in modalità debug).

## 7. Editor mockup — correzioni

- Incluso **solo se la build non è di produzione**: variabile `PUBLIC_STAGE=staging|production` impostata dal workflow (production solo su `main`). In produzione non deve esistere né lo script né la password nell'HTML.
- Password da variabile d'ambiente di build (`EDITOR_PASSWORD`), non da settings.
- Test Playwright: sulla build di produzione `editor.js` e `AUT_EDITOR_PASSWORD` **non** devono comparire.

## 8. Deploy

- `wrangler.jsonc` con `assets: { directory: "./dist" }`, nome Worker = slug del cliente, `compatibility_date` recente. Niente codice Worker al livello statico (solo file).
- Workflow `.github/workflows/deploy.yml`: build Astro → `wrangler deploy` su `main`; sugli altri branch `wrangler versions upload` per avere anteprime. Il job si salta in modo pulito se mancano i secret (come in v1).
- Secret a livello di organizzazione: `CLOUDFLARE_API_TOKEN` (permesso Workers Scripts: Edit), `CLOUDFLARE_ACCOUNT_ID`; variabile `CF_WORKER_NAME`.
- Workers Caching **spento** (altrimenti le richieste ai file statici vengono fatturate).
- Prerequisito: il dominio deve avere i DNS su Cloudflare (custom domain del Worker). Annotalo nella checklist pre-lancio.

## 9. `00_PROTOCOL` (VibeCode)

- Leggi `AdabuStudio/adabu-vibecode` e copia nel template la cartella del protocollo con il nome fisso previsto.
- Adattala ai siti: tieni stato, task, decisioni, handoff, bootstrap; marca come "non applicabile ai siti" le parti su gestione delle macchine (VPS/Mac).
- `CLAUDE.md` e le skill devono rimandare al protocollo come fonte della memoria di progetto: a ogni ingresso nel repo cliente si rilegge lì.
- Il `PROJECT.md` generato dall'onboarding va dentro la struttura del protocollo, non duplicato.

## 10. Skill da aggiornare

- `build-cf-site` → rinomina in `build-astro-site`: componenti, collections, strato dati, comandi Astro.
- `new-client-site`: comandi nuovi; nell'intake chiedi `tier` (static/emdash), tracciamento (GTM/iubenda sì/no), tipo `LocalBusiness`, collezioni opzionali. Tipo 1 (clone) resta un mirror statico, ma con deploy su Workers.
- `playwright-qa`: aggiungi controlli SEO (canonical presente e diverso per ogni pagina, JSON-LD valido, sitemap e robots raggiungibili, `og:url` corretto) e il controllo §7.
- `docs/TEMPLATE-GUIDELINES.md` e `docs/TEMPLATE-INFRA-CODE.md`: aggiornati alla v2. `README.md`: nuovo runbook.

## 11. Fuori perimetro (NON fare ora)

- Implementazione dell'adattatore EmDash e del seed: solo interfaccia e scheletro.
- Integrazione GRIP 2: solo il contratto documentato.
- Migrazione dei siti v1 esistenti.
- E-commerce.

## 12. Criteri di accettazione

- [ ] `npm run build` produce un sito statico dall'esempio (`examples/`), un locale con 3 pagine + blog con 2 post + 2 sedi + 1 avviso scaduto (che NON deve comparire).
- [ ] Ogni pagina ha canonical, og:url e og:image propri; JSON-LD valido (verificato con uno script); sitemap, robots e llms.txt generati.
- [ ] Nessun componente importa `astro:content` direttamente: solo `src/lib/content`.
- [ ] La build di produzione non contiene `editor.js` né la password.
- [ ] Consent Mode default denied precede iubenda, che precede GTM.
- [ ] Lighthouse mobile ≥ 95 su Performance, SEO, Accessibilità, Best Practices nell'esempio.
- [ ] Deploy di prova su un Worker di staging funzionante.
- [ ] `00_PROTOCOL` presente e citato in `CLAUDE.md`.
- [ ] Tag `v1-static-zero-build` creato prima delle modifiche.

## 13. Alla fine

Aggiorna lo stato in `00_PROTOCOL`, scrivi in DECISIONS le scelte prese durante il lavoro e apri una PR draft `v2-astro` → `setup-base` con un riassunto e l'elenco dei criteri spuntati.
