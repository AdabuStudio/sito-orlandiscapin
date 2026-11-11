# Adabu Site Template

Il **pacchetto di istruzioni** per far partire i siti dei clienti Adabù. Qui **non c'è un sito**: ci sono le regole, le skill
di Claude Code, il protocollo di progetto e i modelli. Il sito si costruisce nel **repo del cliente**.

## Cosa contiene
```
CLAUDE.md, AGENTS.md   istruzioni per l'agente (entrypoint del protocollo + regole del template)
.claude/skills/        nostre: new-client-site (onboarding), build-astro-site, playwright-qa, house-style (regia del kit)
                       kit vendorizzato: impeccable (solo istruzioni), ui-ux-pro-max, stop-slop, web-quality-audit + 5 skill qualità
.agents/skills/        le stesse skill per Codex (collegamenti)
.mcp.json, .codex/     MCP della documentazione Astro per Claude e Codex
00_PROTOCOL/           memoria di QUESTO repo (stato, task, decisioni, passaggio di consegne)
templates/client/      protocollo "vuoto" per il cliente + pagine del doc ClickUp "SITO — Roadmap di sviluppo"
templates/             DESIGN.md e SCOPE.md da compilare per ogni cliente
docs/                  SITE-RULES (regole dei siti), CONTENT-CONTRACT (SEO/GEO per GRIP 2),
                       CLOUDFLARE-ACCESS (mappa accessi), V1-LEGACY (siti v1 attivi), spec e piano v2
template.json          versione del template e riferimenti
```
Il **codice** del sito (Astro statico su Cloudflare Workers) è nel ramo **`v2-astro-riferimento`**: la skill lo copia nel repo del
cliente al primo passo. Non si modifica da un repo cliente.

## Come si fa partire un nuovo sito
0. Passi umani: Worker, token, repo e secret (`docs/ONBOARDING-CLIENTE.md`).
1. GitHub → questo repo → **Use this template** → crea il repo del cliente (se non l'hai già fatto al passo 0).
2. Apri una **sessione Claude Code in cloud sul repo del cliente**.
3. Scrivi *"prepara tutto per CLIENTE.it"*. La skill `new-client-site`:
   - fa **tutte le domande insieme** all'inizio (tipo di lavoro 1 clone / 2 redesign / 3 nuovo, tracciamento, collezioni, cartella ClickUp…);
   - copia il codice dal ramo di riferimento e inizializza il repo (protocollo azzerato, slug, dominio);
   - lavora da sola e **si ferma solo ai gate** (direzione grafica; nel Tipo 3 anche lo scope);
   - finisce con PR draft, anteprima su Cloudflare, `00_PROTOCOL` aggiornato e doc ClickUp `SITO — Roadmap di sviluppo` scritto.

## Come si lavora dopo (nel repo del cliente)
Ogni sessione legge `00_PROTOCOL/` all'inizio e lo aggiorna alla fine. I task di modifica sito si leggono dalla cartella del cliente su ClickUp;
lo stato si scrive nel doc roadmap. Regole: `docs/SITE-RULES.md`. Mai push su `main`, PR draft.

## Siti già attivi (v1)
I siti fatti con il template precedente (`build.js` + `site.config.json`, Cloudflare Pages) **restano così** e non si migrano in automatico:
`docs/V1-LEGACY.md`. Lo stato del template v1 è il tag `v1-static-zero-build` (commit `1ce1727`).
Per rifare un sito esistente (v1 o esterno) col v2, o aggiornare un v2 già fatto: **`docs/MIGRAZIONE.md`**.

## Prima della sessione Claude (per ogni cliente)
Procedura per chi sviluppa: **`docs/ONBOARDING-CLIENTE.md`** (~5 minuti). In breve: crea **un** Worker `<slug>` → crea un **token
Cloudflare solo per quel Worker** → `gh repo create … --template` e `gh secret set CLOUDFLARE_API_TOKEN` → controlla la cartella ClickUp.
Niente Worker di staging: `main` è la produzione, `staging` e gli altri rami sono **anteprime** dello stesso Worker.
Accessi e permessi nel dettaglio: `docs/CLOUDFLARE-ACCESS.md`.

## Crediti
Skill vendorizzate (ognuna con `ATTRIBUTION.md` e licenza nella sua cartella, aggiornabili con `bash skills/vendor-refresh.sh`):
[impeccable](https://github.com/pbakaus/impeccable) (Apache-2.0, motore disattivato) · [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (MIT) ·
[stop-slop](https://github.com/hardikpandya/stop-slop) (MIT) · [web-quality-skills](https://github.com/addyosmani/web-quality-skills) (MIT).
