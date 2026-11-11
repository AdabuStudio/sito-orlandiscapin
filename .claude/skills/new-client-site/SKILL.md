---
name: new-client-site
description: >
  Orchestratore per avviare un sito cliente da questo template Adabù v2 (Astro statico su Cloudflare
  Workers), END-TO-END in UNA sola sessione, DENTRO il repo del cliente. Usalo quando l'utente dice
  "prepara tutto per CLIENTE.com", "nuovo sito cliente", "setup cliente", "facciamo il sito di X",
  "rifai il sito di X". Prima chiede il tipo di lavoro (Tipo 1 clone / 2 redesign / 3 nuovo) e i dati
  d'intake; poi inizializza il repo (protocollo + roadmap ClickUp), costruisce, fa QA e deploy.
---

# new-client-site — launcher siti cliente v2

> ⛔ **Dove gira.** SOLO nel **repo del cliente** (creato "da template"). Se `git remote` contiene
> `adabu-site-template`, o `tools/init-client.mjs` (dopo lo scaffold) rifiuta di partire, **fermati**: nel repo template non si
> onboardano siti (vedi `CLAUDE.md` del template). Flusso corretto: crea il repo cliente da template → punta la
> sessione cloud a quel repo → lancia questa skill lì.
>
> ⛔ **Versione.** Se il repo ha `build.js` + `site.config.json` e NON ha `template.json`, è un sito **v1 attivo**:
> non eseguire questa skill, non migrare. Leggi `docs/V1-LEGACY.md` (se presente); il template v1 è il tag `v1-static-zero-build` di
> `AdabuStudio/Adabu-Site-Template`. Si passa ad Astro solo se l'utente lo chiede per quel sito e conferma esplicitamente.

> **Rifacimento di un sito esistente** ("rifai il sito di X"): segui anche `docs/MIGRAZIONE.md` §3 — sito v1 Adabù: contenuti da
> `site.config.json` del repo vecchio (sola lettura, mai modificarlo); sempre: redirect dei vecchi URL in `public/_redirects` e
> controllo che ogni URL della vecchia sitemap risponda sull'anteprima. Il cambio di dominio (§5) lo fa una persona.

> **Prerequisiti umani** (Federico/Damiano, `docs/ONBOARDING-CLIENTE.md`): Worker `<slug>` creato (uno solo: niente `-staging`),
> token per-Worker nel secret del repo `CLOUDFLARE_API_TOKEN` (l'account Cloudflare è già in `wrangler.jsonc`). Il nome del Worker lo scrive `init-client`
> in `wrangler.jsonc`. Se mancano i secret non fermarti: lavora lo stesso, il job di deploy si salta, e nel recap elenca cosa manca.
> Non chiedere mai token in chat.
> Mai aggiungere `routes`/`custom_domain` a `wrangler.jsonc`: il dominio si collega dal pannello al go-live.

Fai tutto in QUESTA sessione. Ti fermi **solo** sui gate umani (Tipo 2: 1 gate; Tipo 3: 2 gate) e sulle
domande d'intake, **tutte insieme all'inizio**: niente fermate in più per il routing.

## 0. Intake (una sola volta, con `AskUserQuestion`, domande raggruppate)
1. **Tipo di lavoro**: Tipo 1 — clone 1:1 · Tipo 2 — redesign (stessa struttura, pelle nuova) · Tipo 3 — nuovo sito.
2. **Cliente**: nome, dominio (→ slug), URL del sito vecchio (obbligatorio per Tipo 1/2; consigliato per il 3).
3. **Tier**: `static` (default; contenuti nel repo) o `emdash` (il cliente edita da solo / blog GRIP 2 → solo aggancio in v2).
4. **Tracciamento**: iubenda (siteId + cookiePolicyId) e/o GTM (`GTM-…`) sì/no; BlackBox sì/no.
5. **Tipo di attività** per il JSON-LD (`LocalBusiness`, `Restaurant`, `DrivingSchool`, `Organization`…).
6. **Collezioni opzionali**: blog, sedi, servizi, avvisi (bacheca a scadenza), eventi.
8. **Lingue**: solo la principale (default `it`) o anche altre (es. `en`) → `--lingue=en`. Ogni pagina tradotta va scritta
   nella sua lingua (`src/content/pages/<lingua>/…`, campi `lang` e `translationKey`): niente traduzioni automatiche non riviste.
9. **Modulo contatti**: sì/no e **email del destinatario** → `--contatti=<email>`. Senza modulo resta il blocco `contact`
   (link email/telefono). Il modulo invia davvero solo dopo che il dominio è abilitato a Email Sending (`docs/ONBOARDING-CLIENTE.md`).
7. **ClickUp**: la skill cerca da sola la cartella progetto del cliente (`02-PROGETTI/<CLIENTE>`, `clickup_search`).
   - Se esiste: chiedi solo conferma. Se **non esiste → fermati e chiedi a Federico** (non creare cartelle).
   - Cervello cliente `00_[CLIENTE]_AI`: se esiste, annota l'URL (SOLA LETTURA: tono di voce, KPI; mai copiato nel repo).
   - Memoria AI: se hai il tool MENTE usala (conferma solo il nome `project`); altrimenti salta in silenzio. Mind Exsafe solo su richiesta esplicita.

## 1. Scaffold del codice e inizializzazione del repo cliente
Il repo creato "da template" contiene **solo istruzioni**. Il codice del sito (Astro, blocchi, controlli, workflow) si copia
dall'implementazione di riferimento, il ramo **`v2-astro-riferimento`** del template:
```bash
git clone -q --depth 1 --branch v2-astro-riferimento https://github.com/AdabuStudio/Adabu-Site-Template /tmp/v2
(cd /tmp/v2 && tar cf - src public examples tools qa worker astro.config.mjs wrangler.jsonc package.json package-lock.json \
  tsconfig.json .env.example setup.sh .github/workflows) | tar xf -     # funziona su Linux e macOS
npm install && npm test          # deve essere verde PRIMA di toccare i contenuti
node tools/init-client.mjs <slug> "<Nome Brand>" <dominio> --tipo=<1|2|3> --tier=<static|emdash> [--lingue=en] [--contatti=<email>]
```
Se il clone viene negato (sessione limitata al solo repo cliente): `add_repo` per `AdabuStudio/Adabu-Site-Template` in lettura, poi riprova.
Non modificare mai il ramo `v2-astro-riferimento` da un repo cliente: è la base comune di tutti i siti.
Azzera la memoria ereditata dal template (`00_PROTOCOL`), riduce `CLAUDE.md`/`AGENTS.md` all'entrypoint del
protocollo, imposta slug/nome/URL. Poi, se la rete lo consente, aggiorna le regole del protocollo:
`git clone --depth 1 https://github.com/AdabuStudio/adabu-vibecode /tmp/avc && /tmp/avc/install.sh .`
(sovrascrive solo README/RULES/BOOTSTRAP_PROMPT; non tocca mai i file di progetto). Compila `PROJECT.yaml`
(`sync.clickup.folder_id/url`, `client_brain`, `mente_ai`) con quanto ricavato all'intake: `bound: true` solo
per ciò che hai davvero agganciato. Leggi i **task di modifica sito** nella cartella cliente (sola lettura) e
riportali in `00_PROTOCOL/TASKS.md`.

## 2. Flusso per tipo

### TIPO 1 — Clone 1:1 (zero gate, nessuna raccolta MCP)
Mirror statico in `mirror/` (il workflow, se esiste `mirror/`, salta Astro e pubblica quella cartella):
```bash
wget --mirror --convert-links --adjust-extension --page-requisites --no-parent -P mirror/ https://SITO-CLIENTE.it/
mv mirror/SITO-CLIENTE.it/* mirror/ && rmdir mirror/SITO-CLIENTE.it
```
Sostituisci URL assoluti del vecchio dominio con path relative root; controlla i link; salta a §3 (deploy) e §4 (recap).
Nessun gate. Recap: URL di anteprima, prossimo passo = DNS.

### TIPO 2 — Redesign (1 gate: direzione grafica)
- **Regola madre**: dal sito vecchio si **estrae e reinterpreta** (logo, colori, font, tono, contenuti, struttura, elementi
  "firma"); non si copia 1:1; mai palette/tipografia/hero di un altro cliente.
- T2.1 Estrai (WebFetch/screenshot): logo, palette, font, struttura e priorità delle pagine, testi chiave, tono.
- T2.2 Archetipo e alberatura: decidi da solo un default sensato.
- T2.3 Direzione grafica con `impeccable` + `ui-ux-pro-max` (regia `house-style`) → `docs/DESIGN.md` (modello `templates/DESIGN.md`).
  **🚦 GATE 1**: presenta 1 direzione (palette fedele e modernizzata) o al massimo 2; itera finché approvata.
- Poi §2bis (semina) e oltre. Nessun GATE 2: lo scope è il sito vecchio (`docs/SCOPE.md`: Fase 1 = tutto il vecchio sito).

### TIPO 3 — Nuovo sito (2 gate)
- T3.1 Nome/slug dal dominio. T3.2 Raccolta MCP **in sola lettura** (se un MCP chiede approvazione o è offline, prosegui e segnalalo):
  Google Drive (brand book, palette, loghi, tono), Marketing HUB (`get_client_detail`, `get_client_strategy`), ClickUp
  (cartella cliente), cervello cliente `00_[CLIENTE]_AI` se esiste.
- T3.3 Archetipo e alberatura (vetrina locale, prodotto, evento…): decidi da solo; chiedi in GATE 2 solo se resta ambiguo.
- T3.4 Scouting 2–4 competitor (WebSearch, Meta Ads Library, WebFetch) → `docs/DESIGN.md` con `impeccable` + `ui-ux-pro-max`.
  **🚦 GATE 1**: 2–3 direzioni, approvazione umana.
- T3.5 `docs/SCOPE.md` a 2 fasi (modello `templates/SCOPE.md`). **🚦 GATE 2**: conferma cosa entra in Fase 1 (go-live) e cosa in Fase 2.

## 2bis. Semina dei contenuti (Tipo 2 e 3)
Compila `src/content/` coi dati raccolti (skill `build-astro-site`): `settings/site.json` (identità, `url` di produzione,
contatti, legale, `tier`, `businessType`, `collections`, `tracking`, `design` dai token approvati), `pages/*.json`,
eventuali `posts/`, `locations/`, `notices/`… Immagini in `src/assets/images/`. Meno placeholder possibile; dove un dato
manca davvero lascia un `{{...}}` evidente (STRICT lo bloccherà su `main`). Per ogni pagina principale compila `seo`
(`metaDescription`) e `geo` (`summary`, `faq`, `keyFacts`): contratto in `docs/CONTENT-CONTRACT.md`.
Aggiungi `scheduledRebuild: true` se usi avvisi/eventi a scadenza.

## 3. Build, QA, asset, deploy
1. `npm run assets -- <logo> <hero>` → favicon + og-image brandizzati (toglie il marker dei segnaposto).
2. `npm run build` (poi `STRICT=1 npm run build`) e `npm test`. Correggi finché pulito.
3. `npm run qa`: **guarda davvero gli screenshot** (auto-QA, non un gate): coerenza con `docs/DESIGN.md`, mobile, contrasto.
   Poi `stop-slop` su tutti i testi e `web-quality-audit` sul sito buildato (Lighthouse mobile ≥95); regole in `house-style`.
4. Lancia `npm run check:prod-clean`: in produzione niente editor né password.
5. Branch di lavoro del repo cliente (mai `main`); commit; **PR draft**. Il push fa partire `deploy.yml` sull'unico Worker:
   ramo → anteprima del ramo, `staging` → anteprima "staging" (`https://staging-<slug>.<sottodominio>.workers.dev`, quella da
   mandare al cliente), `main` → produzione al merge/fast-forward. Se mancano i secret CF il job si salta: segnalalo come unico
   setup residuo (`docs/ONBOARDING-CLIENTE.md`). Nel recap metti l'URL dell'anteprima letto dal log del job.
6. Checklist pre-lancio: `docs/SITE-RULES.md` §Pre-lancio (dati legali, DNS su Cloudflare, custom domain, privacy validata).

## 4. Chiusura: protocollo, roadmap ClickUp, recap
- Aggiorna `STATE.md` (con `Last verified commit`), `TASKS.md`, `DECISIONS.md` (inclusi i gate approvati) e riscrivi `HANDOFF.md`.
  **Dopo il commit** sincronizza (cadenza `on_milestone`): trova/crea il doc **`SITO — Roadmap di sviluppo`** nella cartella
  cliente con le 4 pagine di `templates/client/roadmap-doc/` (Stato, Roadmap, Decisioni, Rilasci); payload breve; **rileggi**
  per confermare. Se la cartella cliente non esiste, ti eri già fermato al §0.7. Aggiorna `last_synced`.
- Recap all'utente: tipo di lavoro, cosa è stato costruito, link a repo + PR draft + anteprima, esito dei gate, stato degli MCP
  (cosa letto / offline), prerequisiti one-time mancanti.

## Definition of done
- Tutti: veste ridisegnata da zero (Tipo 2/3); `npm test` e `STRICT=1 npm run build` verdi; produzione senza editor; mai push su `main`;
  protocollo aggiornato e roadmap ClickUp scritta e riletta.
- Tipo 1: `mirror/` pulito, link ok, deploy avviato. Tipo 2: GATE 1 approvato. Tipo 3: GATE 1 e 2 approvati.
