---
name: playwright-qa
description: >
  QA di un sito Astro v2 già buildato: screenshot desktop+mobile con Playwright, link interni/asset
  rotti, errori JS, scroll orizzontale, e controlli SEO/GEO (canonical per pagina, og:url, JSON-LD,
  sitemap/robots/llms, editor assente in produzione). Usalo dopo `npm run build` e prima del deploy.
---

# playwright-qa — QA visiva + SEO

> Vale nel **repo cliente**: il codice (src/, tools/, qa/, package.json) arriva dallo scaffold del ramo `v2-astro-riferimento`
> (skill `new-client-site`, passo 1). Il repo template contiene solo istruzioni.

## Cosa fa `npm run qa` (`qa/screenshot.mjs`)
1. Serve `dist/` con un mini server statico (come Cloudflare: `/x/` → `x/index.html`, `404.html`). Non serve `file://`.
2. Per ogni pagina: screenshot **desktop** 1280×900 e **mobile** 390×844 full-page in `qa/` (le animazioni `reveal` sono completate).
3. Segnala: link interni rotti, risposte ≥400, errori JS, scroll orizzontale.
4. Lancia `tools/validate-seo.mjs` (stesso controllo di `npm run build`).
Exit code 2 se c'è almeno un problema.

## `tools/validate-seo.mjs` (zero dipendenze)
- canonical presente, **diverso per ogni pagina**, sul dominio di produzione; `og:url` = canonical; `og:image` esistente in build.
- JSON-LD valido (`@context`, `@type`; `FAQPage`/`BreadcrumbList`/`BlogPosting` con i campi richiesti); Organization/LocalBusiness in home.
- `sitemap.xml` completo (esclude noindex), `robots.txt` coerente con lo stage, `llms.txt`, `404.html`.
- Link/asset root-relative; nessun riferimento a `pages.dev`/`workers.dev`.
- Consent Mode default **denied** → iubenda → GTM (ordine); staging: noindex e nessun tracciamento.
- Produzione: `editor.js` e `AUT_EDITOR_PASSWORD` **assenti** (`STAGE=production`, default).
- `STRICT=1`: fallisce anche su placeholder `{{…}}` e asset segnaposto.

## Uso
```bash
npm run build && npm run qa          # sito reale
npm run build:example && npm run qa  # esempio
STAGE=staging PUBLIC_STAGE=staging EDITOR_PASSWORD=x npm run build:staging && STAGE=staging node tools/validate-seo.mjs
npm run check:prod-clean             # prova positiva+negativa: produzione senza editor/password
```

## Checklist (da guardare davvero, non solo "exit 0")
- [ ] Apri gli screenshot: gerarchia, contrasto, immagini, spaziature coerenti con `docs/DESIGN.md`.
- [ ] Mobile: header compatto, menu a tendina, nessun overflow.
- [ ] Ogni pagina ha title/description propri; 404 sensata.
- [ ] Lighthouse mobile (se disponibile): Performance, SEO, Accessibilità, Best Practices ≥ 95.

## Prerequisiti
Playwright + Chromium: `./setup.sh`. Se la versione di Playwright non coincide col browser preinstallato, `tools/browser.mjs`
usa `CHROMIUM_PATH` o `/opt/pw-browsers/chromium`. In egress serve `cdn.playwright.dev` per scaricare il browser.
