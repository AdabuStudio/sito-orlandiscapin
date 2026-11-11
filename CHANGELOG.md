# Changelog del template

I repo cliente creati dal template **non** si aggiornano da soli. Qui si vede cosa è cambiato, per portarlo a mano dove serve.
I siti v1 attivi restano v1 (`docs/V1-LEGACY.md`).

## 2.3.0 — 2026-10-10
**Più lingue e modulo contatti**, universali (per qualsiasi cliente).
- Lingue: `settings.lang` principale (URL senza prefisso) + `settings.locales` (URL `/<lingua>/…`); voci con `lang` e
  `translationKey`; `hreflang` + `x-default`, selettore lingua, menu/footer/privacy/blog/sitemap/`llms.txt` per lingua; testi
  dell'interfaccia in `src/lib/i18n.ts` (it, en). Siti in una lingua sola: output identico a prima.
- Modulo contatti: blocco `contact-form` + `worker/contact.js` su `/api/contact` (unico codice del Worker, solo `/api/*`).
  Email con Cloudflare Email Service, `replyTo` del visitatore, consenso privacy, antispam (campo nascosto, tempo minimo,
  Turnstile facoltativo), nessun dato salvato. Funziona anche senza JavaScript. Nelle anteprime: modalità prova, nessun invio.
- `init-client`: `--lingue=en,de` e `--contatti=<email>`. Test: `npm run check:contact` (dentro `npm test`).
- `account_id` in `wrangler.jsonc`: niente più secret `CLOUDFLARE_ACCOUNT_ID`.
- Onboarding: copia del codice con `tar` (funziona anche su macOS) e cartella `worker/` inclusa.
- **Repo cliente già creati**: copia `src/`, `worker/`, `tools/`, `wrangler.jsonc` (tenendo il tuo `name`), `package.json` e i workflow;
  poi `npm test`. Contenuti e grafica non cambiano.

## 2.2.0 — 2026-10-08
**Kit di skill per lo sviluppo frontend**, per Claude e Codex.
- Vendorizzate (con licenza e `ATTRIBUTION.md`): `impeccable` in modalità **solo istruzioni** (motore disattivato: non scarica nulla), al posto di
  `frontend-design`; `ui-ux-pro-max` (archivio stili/palette/font/regole UX, script Python locale),
  `stop-slop` (testi senza tic da AI), `web-quality-audit` + `performance`, `core-web-vitals`, `accessibility`, `seo`, `best-practices`
  (Lighthouse/Core Web Vitals).
- `house-style` diventa la regia: quale skill in quale fase, cosa prevale (SITE-RULES → CONTENT-CONTRACT → house-style → kit), nota per l'italiano.
- Codex: `.agents/skills/` collegata a `.claude/skills/`; MCP `astro-docs` in `.mcp.json` (Claude) e `.codex/config.toml` (Codex).
- `skills/vendor-refresh.sh` scarica tutto il kit e rigenera i collegamenti.
- `impeccable`: il suo launcher scaricherebbe un binario da GitHub; qui è sostituito da un segnaposto e la skill usa il suo percorso ufficiale senza motore.
- Nuova guida `docs/MIGRAZIONE.md`: rifare un sito esistente (v1 Adabù o esterno) col template v2, e aggiornare un v2 già fatto.
- **Repo cliente già creati**: per adottarlo copia `.claude/skills/`, `.agents/`, `.mcp.json` e `.codex/` dal template (cancella `frontend-design`).

## 2.1.0 — 2026-10-06
**Un Worker per cliente.** Niente più Worker `<slug>-staging`: `main` → produzione (`wrangler deploy`), `staging` e ogni ramo →
**anteprima** dello stesso Worker (Worker Previews, `wrangler preview`); ramo cancellato → anteprima eliminata.
- Token per cliente limitato al solo Worker `<slug>`; tolta la variabile `CF_WORKER_NAME` (il nome sta solo in `wrangler.jsonc`).
- Onboarding in 4 passi (~5 minuti) con `gh repo create --template` e `gh secret set` (`docs/ONBOARDING-CLIENTE.md`).
- Livello `emdash`: un D1 e un R2 condivisi da produzione e anteprime; nelle anteprime solo grafica e codice, `EMDASH_MIGRATIONS_MODE=check`;
  backup DB con Time Travel; cestino R2 `_cestino/` svuotato dopo 1 anno (`docs/SITE-RULES.md` §Dati).
- Repo template: `main` è il ramo di default (i repo cliente nascono con `main`); tag `v1-static-zero-build` e `v1-main-archivio`.
- Codice (ramo `v2-astro-riferimento`): `deploy.yml` riscritto, `wrangler.jsonc` con `previews`, nuovo `tools/worker-name.mjs`.
- **Repo cliente già creati**: per adottarlo copia `deploy.yml`, `wrangler.jsonc` (blocco `previews`) e `tools/worker-name.mjs`, poi
  cancella il Worker `<slug>-staging`.

## 2.0.1 — 2026-10-05
Il template torna a contenere **solo istruzioni** (CLAUDE.md, skill, protocollo, modelli, docs). Il codice del sito v2 è nel ramo
**`v2-astro-riferimento`** e viene copiato nel repo cliente all'onboarding (`new-client-site`, passo 1). Il riferimento v1 è il commit `1ce1727`.

## 2.0.0 — 2026-10-05
Riscrittura: Astro 7 (output statico) su Cloudflare Workers con file statici. Il v1 resta nel commit `1ce1727`.
- Contenuti in content collections con schemi zod (`schema.ts`, fonte unica); strato dati con adattatori (`files`, `fs` di test, scheletro `emdash`).
- 18 blocchi (nuovi: stat-band, timeline, split, map, locations, services, events, notices, post-list); blog; collezioni opzionali; contenuti a scadenza.
- SEO/GEO: canonical e og per pagina (corregge il v1, dove `og:url` era sempre la home), JSON-LD, sitemap, robots, llms.txt, 404.
- Consenso: Consent Mode v2 → iubenda → GTM; banner informativo se nessun tracciamento.
- Editor mockup solo in staging, password da `EDITOR_PASSWORD` (nessun default); test di produzione pulita.
- Deploy su Workers (main/staging/anteprime), rebuild giornaliero, CI.
- Protocollo VibeCode in ogni repo; `tools/init-client.mjs`; doc ClickUp `SITO — Roadmap di sviluppo`.
- Scostamento dalla spec: sitemap generata da endpoint (non `@astrojs/sitemap`) per escludere noindex/bozze e valorizzare lastmod.
