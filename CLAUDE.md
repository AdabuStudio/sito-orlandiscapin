<!-- adabu-vibecode:entrypoint -->
# Agent Entrypoint

Questo repository usa il **Adabù VibeCode Protocol**.

Prima di modificare qualsiasi cosa, leggi in ordine:

1. `00_PROTOCOL/PROJECT.yaml`
2. `00_PROTOCOL/RULES.md`
3. `00_PROTOCOL/STATE.md`
4. `00_PROTOCOL/TASKS.md`
5. `00_PROTOCOL/DECISIONS.md`
6. `00_PROTOCOL/HANDOFF.md`

Poi:

```bash
git status && git branch --show-current && git log --oneline -10
```

`RULES.md` prevale sui default del tuo agente.

Prima di chiudere la sessione — o se vieni interrotto — esegui la procedura di handoff descritta in `RULES.md`.

---

# CLAUDE.md — Adabu Site Template — SOLO per il repo TEMPLATE

> Questo repo contiene **solo istruzioni** (skill, protocollo, modelli, docs): **nessun codice di sito**.
> Il codice v2 è nel ramo `v2-astro-riferimento`; `new-client-site` lo copia nel repo cliente. Nei repo cliente la parte sotto
> il separatore NON esiste (la sostituisce `tools/init-client.mjs`, che arriva con lo scaffold).

## Versione: riconosci dove sei
- Questo repo (template): `template.json` con `"contents": "instructions-only"`.
- Repo cliente v2: `template.json` con `"engine": "astro"` e `client` valorizzato, più `src/`, `package.json`.
- `build.js` + `site.config.json` **senza** `template.json` → **sito v1 attivo**: NON applicare istruzioni v2, NON migrare. `docs/V1-LEGACY.md`.

## Ruolo di QUESTA sessione
**Gestore del template + assistenza**: manutieni skill, docs, protocollo, modelli. **Qui NON si onboardano né si costruiscono siti cliente**
e **non si aggiunge codice di sito**: le modifiche al codice v2 vanno sul ramo `v2-astro-riferimento` (con `npm test` verde lì).

## ⛔ Onboarding nuovo sito cliente (routing)
Se l'utente chiede un nuovo sito ("prepara tutto per CLIENTE.com", "nuovo sito cliente", "facciamo il sito di X") mentre sei qui →
**FERMATI**: non eseguire `new-client-site`. Indirizza: 1) crea il repo cliente da template, 2) sessione cloud sul repo cliente,
3) lì la skill fa tutto (si ferma solo sui gate umani).

## Regole ferme (versione completa in `docs/SITE-RULES.md`)
- Regola madre: redesign da zero dal sito vecchio, mai ereditare da un altro cliente.
- Siti in Astro statico su Cloudflare Workers; **un Worker per cliente**: `main` → produzione, `staging` e rami → anteprime
  (Worker Previews) dello stesso Worker. Mai D1/R2 al livello `static`; al livello `emdash` un D1 e un R2 condivisi (`docs/SITE-RULES.md` §Dati).
- Mai push su `main`; PR draft; `staging` → `main` fast-forward. Vale anche qui: `main` è il ramo di default del template.
- Le chiamate MCP di raccolta dati sono in sola lettura.
- Non riscrivere la storia di `main` né cancellare il ramo `v2-astro-riferimento`. Riferimenti v1 fissati da tag: `v1-static-zero-build`
  (`1ce1727`, base dei siti v1 attivi) e `v1-main-archivio` (vecchio `main`, PR #3–#7). `setup-base` è il vecchio default, congelato.

## Skill (`.claude/skills/`)
Nostre: `new-client-site` (nel repo cliente) · `build-astro-site` · `playwright-qa` · `house-style` (regia del kit: quale skill in quale fase).
Kit vendorizzato (non si modifica, si aggiorna con `bash skills/vendor-refresh.sh`): `impeccable` (solo istruzioni), `ui-ux-pro-max`, `stop-slop`, `web-quality-audit` (+ `performance`, `core-web-vitals`, `accessibility`, `seo`, `best-practices`).
Codex legge le stesse skill da `.agents/skills/` (collegamenti). MCP `astro-docs` in `.mcp.json` e `.codex/config.toml`.
