# Project State

Last updated: 2026-11-11
Last verified commit: (commit di questa sessione su staging)
Last agent: Claude Code (desktop, Windows) — onboarding

## Summary

Sito brochure di Orlandi & Scapin Studio Tecnico (orlandiscapin.it), generato da `adabu-site-template` v2 (Astro, output statico) e
pubblicato su Cloudflare Workers con file statici. Tipo di lavoro: Tipo 2 — redesign. Tier: static.

## Stack

- Astro (output statico), contenuti in content collections (`src/content/`), strato dati in `src/lib/content/`.
- Cloudflare Workers + static assets (`wrangler.jsonc`, deploy da GitHub Actions).

## Architecture

- Contenuti: `src/content/settings/site.json`, `pages/*.json` (sezioni a blocchi), `posts/*.md`, collezioni opzionali.
- Mai `astro:content` fuori da `src/lib/content` (`npm run check:data-layer`).
- SEO/GEO generati dal template (canonical, og, JSON-LD, sitemap, robots, llms.txt).

## Rules & skills of this site

- Regole fisse del sito: `docs/SITE-RULES.md`. Contratto contenuti SEO/GEO: `docs/CONTENT-CONTRACT.md`.
- Skill: `.claude/skills/` (`build-astro-site`, `playwright-qa`, `house-style` = regia del kit; kit: `impeccable` (solo istruzioni), `ui-ux-pro-max`, `stop-slop`, `web-quality-audit` (+ `performance`, `core-web-vitals`, `accessibility`, `seo`, `best-practices`); `new-client-site` solo per l'onboarding). Codex: `.agents/skills/`.
- Tipo 1 (clone): mirror statico in `mirror/`, nessuna build Astro (vedi `docs/SITE-RULES.md`).

## Current working features

- Sito a pagina unica costruito (Tipo 2, direzione "Tavola tecnica" approvata): hero con slider di foto vere, Lo studio + 8 servizi, Lavori (5 interventi, 26 foto, galleria con lightbox), Team + numeri con linee di quota, Contatti con modulo (Worker → info@orlandiscapin.it; nelle anteprime solo prova).
- Blocchi su misura `os-*` in `src/components/blocks/os/` e nello schema; menu ad ancore e `footerLogo` in settings. Stile in fondo a `src/styles/global.css`, script slider/lightbox in fondo a `src/scripts/site.js`.
- Font self-hosted (@fontsource Archivo + Inter). Favicon e og-image generati dal logo (`npm run assets -- logo-icona.png lavori/lavoro-02-01.jpg`).
- Anteprima: https://staging-orlandiscapin.adabu.workers.dev (deploy da GitHub Actions su push a `staging`).

## Partially implemented

- Testi dei servizi (righe descrittive) e titoli dei lavori scritti da Adabù: da far confermare al cliente (vedi TASKS).

## Known issues

- Su Windows `npm test` va lanciato con `--script-shell` di Git Bash; `check:prod-clean` va in crash (assert libuv di Node 24 su `npx astro build`), sulla CI Linux no.
- Su Windows: `node qa/screenshot.mjs /` da Git Bash converte "/" in un percorso: lanciarlo senza argomenti. Playwright chromium installato localmente.

## Infrastructure / External services

- Cloudflare Worker: `orlandiscapin` (uno solo). `main` → produzione; `staging` e rami → anteprime dello stesso Worker
  (`https://<ramo>-orlandiscapin.<sottodominio>.workers.dev`). Accessi: `docs/CLOUDFLARE-ACCESS.md`.
- Tracciamento: nessuno per ora (da decidere prima del go-live).

## Development

### Install
`npm install`

### Run
`npm run dev`   (stage anteprima: editor mockup se `EDITOR_PASSWORD` è impostata)

### Test
`npm test` · QA visiva: `npm run build && npm run qa`

### Build
`npm run build` (usa `STRICT=1` su main: fallisce su placeholder `{{…}}` e asset segnaposto)

## Current priority

TO VERIFY

## Important files / directories

- `src/content/` contenuti · `src/components/blocks/` blocchi · `tools/` generatori e controlli · `00_PROTOCOL/` memoria operativa

## Unknown / To verify

- Dati legali e testo privacy da confermare col cliente prima del lancio.
