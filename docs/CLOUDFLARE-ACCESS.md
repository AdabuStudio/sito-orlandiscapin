# Mappa degli accessi per lavorare su Cloudflare

> Cosa serve, a chi, dove si configura e **cosa è già verificato**. Stato al 2026-10-05.
> Legenda: ✅ verificato · ❓ non verificabile dalla sandbox (da controllare) · 📖 da documentazione Cloudflare.

## 1. Deploy da CI (GitHub Actions → Worker): un Worker e un token PER CLIENTE
Procedura passo passo: **`docs/ONBOARDING-CLIENTE.md`**. Il deploy lo fa `.github/workflows/deploy.yml` del repo cliente.

| Cosa | Dove | Valore / permessi | Stato |
|---|---|---|---|
| `CLOUDFLARE_API_TOKEN` | **secret del repo cliente** | Account API token `site-<slug>-ci`: **Workers → Specified Workers (`<slug>`) → Editor**. Nient'altro. 📖 Il per-Worker si può dare solo a Worker già esistenti: si crea prima dal pannello | per cliente |
| Account Cloudflare | `account_id` in `wrangler.jsonc` del template | id dell'account; da solo non dà accesso a nulla, quindi sta nel codice: nessun secret | ✅ |
| `EDITOR_PASSWORD` | secret del repo (opz.) | password editor mockup, solo anteprime | opzionale |

Il nome del Worker sta solo in `wrangler.jsonc` (`name`, lo imposta `init-client`). 📖 Con **Editor** su quel Worker il token pubblica la
produzione (`wrangler deploy`) e le anteprime (`wrangler preview`), fa rollback e gestisce i secret, ma **non** può creare o cancellare
Worker né toccarne altri. Niente Worker `-staging`: staging e rami sono **Worker Previews** dello stesso Worker (Cloudflare, sett. 2026). 📖 I **Custom Domain** non supportano ancora i permessi per-Worker: il dominio si collega **a mano dal pannello**
al go-live (una volta sola). Dopo, il token con Editor continua a deployare senza problemi. Per questo `wrangler.jsonc` **non** deve
contenere `routes`/`custom_domain`. Mai la Global API Key, mai token "tutti i Worker" per un sito.

## 2. Account Cloudflare (stato reale, letto dal connector)
✅ Il connector "Cloudflare Developer Platform" legge l'account: **13 Worker**, **11 D1**, **6 R2** esistenti (progetti Adabù: grip, adabu-finance, blackbox-qa, zonta-prenotazioni, trattoriaalbristol, dispensarium-staging, hive-preview, catalogo-apoikia…).
- **Controlla le collisioni di nome** prima di scegliere uno slug (es. `trattoriaalbristol` esiste già come Worker).
- I siti `static` non toccano D1/R2 (regola: mai D1/R2 al livello `static`). Al tier `emdash`: **un** D1 `<slug>-db` e **un** R2 `<slug>-media`
  per cliente, condivisi da produzione e anteprime (`docs/SITE-RULES.md` §Dati). 📖 Per deployare un Worker con binding D1/R2 basta Editor sul
  Worker; servono permessi D1/R2 solo per leggere o scrivere i dati direttamente.
- ❓ Il connector non elenca i progetti **Pages**: i siti v1 restano dove sono (vedi `docs/V1-LEGACY.md`).
- ❗ Il connector **non** gestisce secret, DNS, custom domain né token: quelle operazioni restano manuali (dashboard) o via CI.

## 3. Dominio del cliente
| Cosa | Chi | Note |
|---|---|---|
| DNS del dominio **su Cloudflare** (prerequisito del custom domain del Worker) | chi gestisce il registrar | prima di cambiare i nameserver **ricopia tutti i record esistenti** (MX, SPF/DKIM/DMARC, TXT di verifica, sottodomini) o la posta smette di funzionare |
| Zona nell'account Cloudflare Adabù | Adabù | aggiungere la zona e verificare i record importati |
| Custom domain del Worker | **dashboard**, una persona, al go-live | Worker → Settings → Domains & Routes → Custom Domain. Non in `wrangler.jsonc` (il token per-Worker non può gestire i domini) |
| Redirect apex ↔ www, vecchi URL | in `public/_redirects` o regola CF | decidere prima del cutover |
Cutover: anteprima `staging` approvata → merge in `main` → custom domain → verifica canonical/sitemap → Search Console.

## 4. GitHub
| Cosa | Dove | Stato |
|---|---|---|
| Repo marcato **Template repository** | Settings → General | ✅ fatto (ramo di default: `main`) |
| Creare repo cliente da template | owner dell'org o token con permesso | la sessione Claude può essere limitata a un solo repo: `add_repo` o fallback "Use this template" |
| Secret e variable del sito | repo cliente → Settings → Secrets and variables → Actions | per cliente (`docs/ONBOARDING-CLIENTE.md` §3) |
| Mai push su `main`; PR draft; `staging` → `main` fast-forward | regola del template | ✅ documentata |

## 5. Sessioni Claude Code in cloud
| Cosa | Dove | Note |
|---|---|---|
| Rete (egress) | Environment → Network | consentire `registry.npmjs.org`, `cdn.playwright.dev`, `github.com`, `api.cloudflare.com` (se si deploya a mano). Esempio in questa sessione: npm ✅ |
| Secret locali (solo per deploy manuale) | Environment → Secrets | meglio **non** metterli: il deploy passa dalla CI |
| Setup script | Environment | `./setup.sh` (idempotente) |
| Connector MCP | claude.ai → Connectors | Cloudflare Developer Platform ✅, ClickUp ✅, GitHub ✅, Google Drive ✅, Marketing HUB ✅, MENTE ✅. Non autorizzati in questa sessione: n8n, Vercel, Meta MCP, Metricool, ActiveCampaign, OpenRouter, Orshot, Stape Ads, scraper |
| Browser per QA | sandbox | Chromium preinstallato (`/opt/pw-browsers`): `tools/browser.mjs` (nel repo cliente) lo usa se la versione Playwright non coincide |

## 6. Servizi di terzi per cliente
| Servizio | Cosa serve | Dove finisce |
|---|---|---|
| iubenda | `iubendaSiteId` + `iubendaCookiePolicyId`; Google Consent Mode attivo nel pannello | `settings.tracking` |
| Google Tag Manager | `GTM-XXXX` del container | `settings.tracking.gtmId` |
| Search Console / Bing | proprietà di dominio (DNS TXT) + invio `sitemap.xml` | dopo il cutover |
| BlackBox | `blackboxEnabled` + lato server rispettare il consenso | `settings.tracking` |
| ClickUp | cartella progetto del cliente + doc `SITO — Roadmap di sviluppo` | `00_PROTOCOL/PROJECT.yaml` |
| Cloudflare Email Sending (modulo contatti) | dominio del cliente abilitato (DNS su Cloudflare) | `CONTACT_FROM` in `wrangler.jsonc` |
| Cloudflare Turnstile (facoltativo) | widget per il dominio: chiave pubblica + segreta | `settings.contactForm.turnstileSiteKey` + secret `TURNSTILE_SECRET_KEY` |
| Facebook Sharing Debugger / LinkedIn Inspector | rigenerare anteprime post-cutover | — |

## 7. Checklist
Per ogni cliente: **`docs/ONBOARDING-CLIENTE.md`** (Worker → token per-Worker → repo e secret → ClickUp → servizi → sessione Claude → go-live).
Una tantum per Adabù: nulla (l'account è in `wrangler.jsonc`). Per cliente con modulo contatti: dominio abilitato a Email Sending.
