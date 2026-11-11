# Handoff

Data: 2026-11-11 · Ramo: `staging`

## Fatto
- Sito costruito secondo `docs/DESIGN.md` (GATE 1 approvato da Federico): vedi STATE.md.
- Foto dei lavori copiate da `materiale/` (non versionato) in `src/assets/images/lavori/` con nomi neutri `lavoro-NN-MM.jpg`
  (01 = recupero casa rurale, 02 = casa colonica, 03 = casa con portico, 04 = villa con porticato, 05 = casa unifamiliare). Mai nomi dei proprietari.
- `npm run build` verde, QA (`node qa/screenshot.mjs`) 0 problemi, validate-seo ok.
- Worker `orlandiscapin` e secret `CLOUDFLARE_API_TOKEN` creati da Federico: le anteprime si pubblicano da sole.

## Prossimo passo
- Federico manda l'anteprima al cliente e raccoglie le conferme di TASKS.md; poi go-live.
