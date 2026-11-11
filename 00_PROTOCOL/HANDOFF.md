# Handoff

Data: 2026-11-11 · Ramo: `staging` · PR draft #1 (staging → main)

## Fatto
- Sito a pagina unica costruito e approvato nelle parti viste da Federico: Hero, Lo studio, Team (foto larga nitida), Lavori (galleria unica di 24 foto mischiate, senza didascalie), Contatti con modulo.
- Anteprima: https://staging-orlandiscapin.adabu.workers.dev (deploy automatico su push a `staging`). Editor mockup attivo con il secret `EDITOR_PASSWORD` (la password si legge dall'anteprima, non è scritta nel repo).
- Worker `orlandiscapin` e secret `CLOUDFLARE_API_TOKEN` creati.
- Build, validate-seo e QA verdi.

## Stato
- **Sessione fermata su richiesta di Federico** ("per ora ci fermiamo"). Nessun lavoro a metà.

## Prossimo passo
- Mandare l'anteprima al cliente e raccogliere le conferme in TASKS.md; poi privacy/cookie, DNS + Email Sending, go-live.

## Note per chi riprende (Windows)
- `npm` script con sintassi bash: lanciare con `--script-shell` di Git Bash, oppure `npx astro build` direttamente.
- QA: `node qa/screenshot.mjs` senza argomenti (da Git Bash "/" diventa un percorso).
- Anteprima locale: config `orlandiscapin-preview` in `CODING-WEB/.claude/launch.json` (serve `dist/`).
