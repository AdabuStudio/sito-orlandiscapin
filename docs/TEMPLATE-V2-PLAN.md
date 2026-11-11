# Piano di lavoro v2 — Adabu Site Template

> **Nota (5 ott 2026):** piano storico. La v2 è stata implementata e poi il codice è stato spostato nel ramo
> `v2-astro-riferimento`: il template contiene solo istruzioni. Il tag v1 non è stato creato (push dei tag bloccato
> dalla sessione cloud): il riferimento v1 è il commit `1ce1727`.

> Companion di `TEMPLATE-V2-SPEC.md` (la spec resta la fonte per decisioni e criteri di
> accettazione). Questo piano ordina il lavoro in fasi e **integra** ciò che la spec non
> copre: audit del template v1, protocollo VibeCode, sync ClickUp.

## Decisioni prese (oltre a quelle della spec §0)

| Tema | Decisione |
|---|---|
| Branch | Si lavora sul branch di sessione `claude/laughing-clarke-1vpg0s`; PR draft verso `setup-base`. Tag `v1-static-zero-build` prima di ogni modifica. |
| Protocollo nei cloni | Non si copia la cartella `00_PROTOCOL/` com'è: l'onboarding lancia `install.sh` di `adabu-vibecode` (non tocca mai i file di stato) e azzera `PROJECT.yaml`, `STATE`, `TASKS`, `DECISIONS`, `HANDOFF` ereditati. Il template ha un proprio `00_PROTOCOL/` per il lavoro sul template. |
| `CLAUDE.md` | Nei repo cliente è solo entrypoint del protocollo (il bootstrap elimina quanto sta sotto il separatore). Regola madre, regole ferme e guardrail si spostano in `docs/` e nelle skill; il guardrail "niente siti cliente qui" resta solo nel repo template. |
| Domande di routing | Il bootstrap non aggiunge una terza fermata: le domande si fanno nell'intake di `new-client-site`, insieme a Tipo 1/2/3 e `tier`. |
| Sync in uscita | Repo → ClickUp, mai il contrario. Destinazione: doc **`SITO — Roadmap di sviluppo`** nella cartella progetto del cliente (`02-PROGETTI/<CLIENTE>`), un doc per cliente, nome fisso. |
| Pagine del doc | `Stato` · `Roadmap` (NOW/NEXT/BLOCKED da `TASKS.md`) · `Decisioni` (inclusi i gate umani) · `Rilasci` (deploy in produzione, data e commit). |
| Cadenza | `on_milestone`: deploy in produzione, nuova decisione, cambio stack, blocker, chiusura fase. Payload breve; dopo la scrittura si rilegge per verificare. |
| Lettura da ClickUp | I task di modifica sito stanno nella cartella cliente: all'ingresso nel repo si leggono e si riportano in `TASKS.md`, che da lì è autoritativo. Il doc non è mai riletto come fonte di verità. |
| Cartella cliente assente | La skill si ferma e chiede; non crea cartelle nel workspace ClickUp. Se manca solo il doc, lo crea con le 4 pagine. |

## Fasi

### Fase 0 — Preparazione
- [ ] Tag `v1-static-zero-build` su `setup-base`.
- [ ] `00_PROTOCOL/` del template inizializzato (`runtime: repo`, `type: internal`).
- [ ] Spec e piano in `docs/`.

### Fase 1 — Scheletro Astro (spec §3, §4)
- [ ] Astro `output: 'static'`, `astro:assets`, layout `Base.astro`.
- [ ] `src/lib/content/schema.ts` come fonte unica degli schemi; `index.ts` + adattatore `files`; scheletro `emdash` che lancia "not implemented".
- [ ] Blocchi come componenti: hero, text, feature-grid, gallery, cta, logos, faq, steps, contact.
- [ ] **Aggiunte dall'audit v1:** blocchi `stat-band`, `timeline`, `map` (collegato a `locations`), `split` immagine+testo; testo ricco (paragrafi/liste) nel blocco `text`; stato link attivo (`aria-current`); CTA pill nell'header (`settings.headerCta`); link Privacy/Cookie e dati legali nel footer.
- [ ] **Test dell'interfaccia dati:** un secondo adattatore finto (JSON da altra cartella) che fa girare l'esempio senza toccare i componenti.

### Fase 2 — SEO / GEO (spec §5)
- [ ] `Head.astro` con canonical e og per pagina; `JsonLd.astro` + `lib/seo/schema.ts`.
- [ ] sitemap, `robots.txt` (staging `Disallow: /`), `llms.txt`, 404.
- [ ] `docs/CONTENT-CONTRACT.md` (contratto `seo` + `geo` con GRIP 2).
- [ ] `noindex` sulle anteprime e su staging.

### Fase 3 — Consenso, editor, deploy (spec §6, §7, §8)
- [ ] Consent Mode v2 (denied) → iubenda → GTM; banner informativo se nessun tracciamento.
- [ ] Editor solo con `PUBLIC_STAGE=staging`; password da `EDITOR_PASSWORD`; `.env.example` aggiornato.
- [ ] `wrangler.jsonc` + `deploy.yml` (Workers static assets); salto pulito senza secret.
- [ ] **Build `--strict`:** fallisce su placeholder `{{...}}` rimasti, almeno su `main`.
- [ ] Fallback per favicon/og-image se `gen-assets` non è stato lanciato.
- [ ] Workflow `schedule` per ricostruire i contenuti a scadenza (`scheduledRebuild`).

### Fase 4 — Protocollo e skill (spec §9, §10)
- [ ] `new-client-site`: intake esteso (`tier`, tracciamento, tipo `LocalBusiness`, collezioni) + routing ClickUp/cervello cliente; passo `install.sh` + reset stato; ricerca/creazione del doc `SITO — Roadmap di sviluppo`.
- [ ] `build-cf-site` → `build-astro-site`.
- [ ] `playwright-qa`: controlli SEO e assenza di `editor.js`/password in produzione.
- [ ] `CLAUDE.md` ridotto; regole spostate in `docs/` e skill; `TEMPLATE-GUIDELINES.md`, `TEMPLATE-INFRA-CODE.md`, `README.md` aggiornati.
- [ ] Strategia di aggiornamento dei repo cliente: `CHANGELOG.md` + procedura "porta le novità del template in un sito esistente".

### Fase 5 — Verifica (spec §12)
- [ ] Criteri di accettazione della spec spuntati, uno per uno, con evidenza.
- [ ] Deploy di prova su un Worker di staging.
- [ ] PR draft con riassunto.

## Da chiarire
- Il repo `AdabuStudio/adabu-vibecode` è pubblico, mentre il doc ClickUp lo dice privato: decidere se è voluto (contiene URL MENTE e routing interno).
- Nome definitivo della cartella/lista del protocollo nei cloni se diverso da `00_PROTOCOL`.
