# Project State

Last updated: 2026-11-11
Last verified commit: TO VERIFY
Last agent: new-client-site (onboarding)

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

- TO VERIFY

## Partially implemented

- TO VERIFY

## Known issues

- TO VERIFY

## Infrastructure / External services

- Cloudflare Worker: `orlandiscapin` (uno solo). `main` → produzione; `staging` e rami → anteprime dello stesso Worker
  (`https://<ramo>-orlandiscapin.<sottodominio>.workers.dev`). Accessi: `docs/CLOUDFLARE-ACCESS.md`.
- Tracciamento: {{TRACCIAMENTO}}

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
