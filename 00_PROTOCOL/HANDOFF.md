# Handoff

## Ultima sessione (2026-10-10)
Template 2.3.0: più lingue e modulo contatti nel codice v2 (`npm test` verde, provato in locale con `wrangler dev`), docs e skill aggiornate.
Da verificare sul primo sito con modulo: invio reale con Email Sending.

## Sessione precedente (2026-10-09)
Kit di skill frontend nel template (vedi `house-style` §Kit e `skills/vendor-refresh.sh`), anche per Codex (`.agents/skills`).
Impeccable in modalità solo istruzioni (motore disattivato) al posto di frontend-design. Nuova guida `docs/MIGRAZIONE.md`.

## Sessione precedente (2026-10-06)
Riordino dopo la sessione del 5 ottobre. Decisioni di Federico: un Worker per cliente (produzione + anteprime, niente staging separato),
token per cliente, onboarding a mano guidato, al livello `emdash` un solo D1/R2 condiviso con cestino R2. `main` è il ramo di default;
v1 fissato dai tag `v1-static-zero-build` e `v1-main-archivio`. Codice aggiornato nel ramo `v2-astro-riferimento` (`npm test` verde).

## Prossimo passo consigliato
1. Primo cliente pilota con `docs/ONBOARDING-CLIENTE.md`; controllare nel log della CI l'URL dell'anteprima e il deploy di produzione.

## Do not touch
- Ramo `v2-astro-riferimento` (base comune dei siti v2), tag `v1-static-zero-build` e `v1-main-archivio`, storia di `main`.
- `00_PROTOCOL/RULES.md` (copia del protocollo v6).

## To verify
- `wrangler preview` col token per-Worker (solo Editor).
- Il clone del ramo di riferimento da una sessione cloud limitata al repo cliente (potrebbe servire `add_repo`).
