# Indicatori per il Site Template Adabù (v2)

> Cosa, di un sito, è infrastruttura riusabile e cosa va rifatto per ogni cliente. Le regole operative stanno in
> `docs/SITE-RULES.md`. Il codice NON sta in questo repo: l'implementazione di riferimento è il ramo `v2-astro-riferimento`,
> copiata nel repo cliente all'onboarding. Spec e piano della v2:
> `docs/TEMPLATE-V2-SPEC.md`, `docs/TEMPLATE-V2-PLAN.md` (solo nel repo template).

## 1. Infrastruttura SEMPRE inclusa (client-agnostica)
1. **Editor mockup solo staging** (`src/editor/editor.js`): sposta/ridimensiona/riscrive a video, viste desktop/mobile reali, "GENERA PROMPT".
   Incluso solo se `PUBLIC_STAGE=staging` e `EDITOR_PASSWORD` impostata; in produzione non esistono né script né password (test: `check:prod-clean`).
2. **Micro-interazioni** (`src/scripts/site.js`): header condensato, hamburger mobile, reveal allo scroll, cookie banner informativo.
3. **Consenso**: iubenda + Consent Mode v2 (default denied) + GTM, in quest'ordine; senza tracciamento resta il banner "solo cookie tecnici".
4. **SEO/GEO generati**: canonical e og per pagina, JSON-LD, sitemap, robots, `llms.txt`, 404; favicon + og-image da `npm run assets`.
5. **URL indipendenti dal dominio** (root-relative; assoluti solo su `settings.url`).
6. **Pubblicazione**: un Worker per cliente; `main` → produzione, `staging` e rami → anteprime (Worker Previews); `staging` → `main`
   fast-forward; rebuild giornaliero per i contenuti a scadenza.
7. **Protocollo VibeCode** (`00_PROTOCOL`) in ogni repo: memoria operativa nel repo, non nella chat.

## 2. Livelli
- **`static`** (predefinito): contenuti nel repo, nessun D1/R2.
- **`emdash`**: stesso codice + EmDash (D1 + R2). In v2 solo aggancio (`adapters/emdash.ts`); schemi già identici.

## 3. Per-cliente — NON si eredita mai
Token di design, hero, contenuti e immagini, dati legali, `settings.url`, nome Worker, ID di tracciamento. (Regola madre: redesign da zero.)

## 4. Checklist "nuovo sito cliente"
Vedi la skill `new-client-site` (intake → scaffold dal ramo di riferimento + init-client → design/gate → semina → asset → build/QA → PR draft → deploy → protocollo e roadmap ClickUp).
