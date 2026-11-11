# Siti v1 attivi — come non incasinarli

Il template **v1** (statico zero-build: `build.js` + `site.config.json` + `src/blocks/*.html`, deploy su **Cloudflare Pages**)
è congelato nel tag **`v1-static-zero-build`** (commit `1ce1727`): è lo stato da cui sono nati i siti v1 attivi (asolo100km, asolourbantrail),
che **restano v1**. Il vecchio ramo `main` del template (modello "dispatcher", `ROADBOOK.md`, GATE 0, quickstart WSL: PR #3–#7) non è mai
confluito lì ed è archiviato nel tag **`v1-main-archivio`** (commit `9309de8`).

## Come riconoscere un sito v1
Ha `build.js` e `site.config.json` e **non ha** `template.json`/`astro.config.mjs`. Un sito v2 ha `template.json` con `"engine": "astro"`.

## Regole (valgono per umani e agenti)
1. **Mai migrare in automatico.** Un v1 passa ad Astro v2 solo se l'utente lo chiede esplicitamente per quel sito **e conferma**:
   l'agente chiede "Vuoi passare <sito> alla struttura Astro v2?" e procede solo con un sì. Il v2 è per i siti nuovi.
2. **Non applicare istruzioni v2 a un v1**: né `npm test`, né `build-astro-site`, né il workflow Workers. Un repo v1 ha già la sua copia di skill e workflow (Pages): quelle valgono.
3. Fix su un v1: restare su v1 (`node build.js`, `node qa/screenshot.mjs`, `wrangler pages deploy dist`). Per ripartire dallo stato esatto del template v1: `git checkout v1-static-zero-build`.
4. I tag `v1-static-zero-build` e `v1-main-archivio` non si spostano né si cancellano; niente force-push né riscritture della storia di `main`.
5. I repo cliente creati dal template **non ricevono** aggiornamenti da soli: non c'è sincronizzazione automatica con il template. Cosa cambia nel template lo dice `CHANGELOG.md`; portarlo in un sito esistente è una scelta per sito.

## Migrazione volontaria v1 → v2
Solo su richiesta esplicita e confermata, sito per sito. Procedura completa (repo nuovo, contenuti, redirect, cambio di dominio
e ritorno indietro): **`docs/MIGRAZIONE.md`**.
