# Project State

Last updated: 2026-10-10
Last verified commit: vedi `git log` (ramo kit-skill-frontend → main)
Last agent: claude-code

## Summary

Repo **template di istruzioni** per i siti Adabù: skill di Claude Code, protocollo VibeCode, modelli, regole e docs.
**Nessun codice di sito qui.** Il codice v2 (Astro statico su Cloudflare Workers) è nel ramo `v2-astro-riferimento`
e viene copiato nel repo cliente dalla skill `new-client-site`. Il template v1 è il tag `v1-static-zero-build`.
Ramo di default: `main`.

## Stack

- Solo Markdown/YAML/JSON. Il ramo `v2-astro-riferimento` contiene Astro 7, Wrangler 4.147, Playwright e i controlli (`npm test`).

## Architecture

- `.claude/skills/` (nostre + kit vendorizzato, regia in `house-style`; `.agents/skills/` = collegamenti per Codex) · `.mcp.json`/`.codex/` (MCP docs Astro) · `00_PROTOCOL/` (memoria di questo repo) · `templates/client/` (protocollo e roadmap per i clienti) · `docs/` (regole, contratto contenuti, accessi, onboarding, v1).
- Deploy dei siti: **un Worker per cliente**; `main` → produzione, `staging` e rami → Worker Previews dello stesso Worker.
- Codice v2 (ramo `v2-astro-riferimento`): più lingue e modulo contatti (Worker solo su `/api/*`, Cloudflare Email Service).

## Current working features

- Flusso onboarding documentato end-to-end in `new-client-site` e `docs/ONBOARDING-CLIENTE.md` (4 passi umani, ~5 minuti).
- Ramo `v2-astro-riferimento`: `npm test` verde in locale (6 ott 2026); `wrangler deploy --dry-run` valido con il blocco `previews`.

## Partially implemented

- Livello `emdash`: solo aggancio nel codice di riferimento. Regole dati decise (`docs/SITE-RULES.md` §Dati), adattatore EmDash e cestino R2 da scrivere.

## Known issues

- Deploy reale (produzione + anteprima) mai provato su un Worker vero: da fare col primo cliente.
- Lighthouse non ancora verificato con asset reali.

## Infrastructure / External services

- Cloudflare (mappa accessi in `docs/CLOUDFLARE-ACCESS.md`), ClickUp, protocollo `AdabuStudio/adabu-vibecode` v6.

## Development

Nessuna build in questo repo. Le verifiche del codice si fanno sul ramo `v2-astro-riferimento` (`npm install && npm test`).

## Current priority

Primo cliente pilota con `docs/ONBOARDING-CLIENTE.md`: verificare deploy di produzione e anteprima col token per-Worker.

## Important files / directories

`CLAUDE.md`, `.claude/skills/new-client-site/SKILL.md`, `docs/ONBOARDING-CLIENTE.md`, `docs/SITE-RULES.md`, `templates/client/`, `template.json`.

## Unknown / To verify

- `wrangler preview` con un token che ha solo Editor sul singolo Worker (atteso ok: da confermare sul pilota).
