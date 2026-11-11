# Tasks

## NOW

- [ ] Primo cliente pilota (`docs/ONBOARDING-CLIENTE.md`). Fatto quando: anteprima `staging-<slug>.<sottodominio>.workers.dev` e produzione rispondono 200 col token per-Worker.

## NEXT

- [ ] Siti v1 nati dal vecchio default (asolo100km, asolourbantrail): non hanno `main` come ramo di default; valutare per sito (restano v1).

## BLOCKED

- Nessuno.

## BACKLOG

- Testi dell'interfaccia per altre lingue oltre a it/en (`src/lib/i18n.ts`) quando servono.
- Adattatore EmDash (tier `emdash`) + adattatore storage R2 con cestino `_cestino/` e regola lifecycle 1 anno (`docs/SITE-RULES.md` §Dati).
- Lighthouse ≥95 con asset reali (sul primo cliente).
- Cancellare il ramo `setup-base` quando nessuno lo usa più.
- Proporre in `adabu-vibecode` v7 l'estensione `sync.clickup` per i siti (doc roadmap + cartella cliente).

## RECENTLY DONE

- 2026-10-10 · Template 2.3.0: più lingue (`settings.locales`, hreflang, selettore) e modulo contatti (Worker su `/api/contact`, Email Service, antispam, prova nelle anteprime); `account_id` in `wrangler.jsonc`.

- 2026-10-09 · Kit di skill frontend (impeccable solo istruzioni, ui-ux-pro-max, stop-slop, web-quality-skills) + MCP docs Astro, per Claude e Codex; guida `docs/MIGRAZIONE.md`.

- 2026-10-06 · Riordino: `main` ramo di default, tag v1, un Worker per cliente con anteprime, onboarding ~5 minuti, regole dati emdash.
- 2026-10-05 · Codice v2 implementato, testato e spostato nel ramo `v2-astro-riferimento`; template ridotto a istruzioni.
