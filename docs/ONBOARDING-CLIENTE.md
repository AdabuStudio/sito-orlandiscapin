# Onboarding di un nuovo cliente — procedura per chi sviluppa (Federico, Damiano)

**4 passi a mano, circa 5 minuti.** Poi Claude fa il resto.
Principio: **un cliente = un Worker = un token**. Il token può pubblicare solo il Worker di quel sito (non vede grip,
adabu-finance né gli altri Worker dell'account). Niente Worker di staging: le anteprime vivono dentro lo stesso Worker.

Sostituisci `<slug>` con lo slug del cliente (minuscole e trattini, es. `pivato-serramenti`).

**Una volta sola (già fatto):** l'account Cloudflare è scritto nel template (`account_id` in `wrangler.jsonc`), quindi nessun
repo cliente ha bisogno del secret `CLOUDFLARE_ACCOUNT_ID`. L'account deve avere un sottodominio `*.workers.dev` (Workers & Pages):
le anteprime vivono lì.

## 1. Cloudflare — crea il Worker
1. Dashboard → **Workers & Pages**: controlla che `<slug>` non esista già (es. `trattoriaalbristol` è già preso).
2. **Create** → *Start with Hello World* → nome `<slug>` → **Deploy**. Il contenuto è provvisorio: la CI lo sostituisce.
3. Nel Worker → **Domains** → sotto *Worker URL* controlla che **Preview** sia acceso (servono le anteprime).

## 2. Cloudflare — crea il token del cliente
**Manage Account → Account API Tokens → Create Token** ([link](https://dash.cloudflare.com/?to=/:account/api-tokens)):
- Nome: `site-<slug>-ci`
- Permesso: **Workers** → scope **Specified Workers** → seleziona `<slug>` → ruolo **Editor**. Nient'altro.
Copia il token: Cloudflare lo mostra una volta sola. Va **solo** nel passo 3, mai in file, chat o `.env`.

## 3. GitHub — repo del cliente e secret (dal tuo terminale)
```bash
gh repo create AdabuStudio/sito-<slug> --template AdabuStudio/Adabu-Site-Template --private
gh secret set CLOUDFLARE_API_TOKEN -R AdabuStudio/sito-<slug>
```
Il secondo comando chiede di incollare il token (non resta nella cronologia). Il repo può crearlo anche Claude; il token lo
incolli sempre tu (o da GitHub → Settings → Secrets and variables → Actions → New repository secret).
- Facoltativo: `gh secret set EDITOR_PASSWORD -R AdabuStudio/sito-<slug>` (password dell'editor mockup nelle anteprime).
Il nome del Worker non va da nessuna parte: lo scrive Claude in `wrangler.jsonc` all'onboarding.

## 4. ClickUp e servizi
- Controlla che esista la cartella del cliente in `02-PROGETTI` (il doc `SITO — Roadmap di sviluppo` lo crea Claude).
- Se previsti: iubenda (`siteId`, `cookiePolicyId`, Google Consent Mode attivo) e GTM (`GTM-XXXX`).
- Più lingue? Tieni pronti i testi tradotti (o chi li rivede). Modulo contatti? L'email che riceve i messaggi.

## 5. Avvio
Claude Code **sul repo `sito-<slug>`** (non sul template) → *"prepara tutto per <dominio>"*. La skill `new-client-site` fa le
domande, copia il codice, costruisce, fa QA, apre la PR e pubblica l'anteprima.

## Come si pubblica (dopo l'onboarding)
| Ramo | Dove va | URL |
|---|---|---|
| ramo di lavoro | anteprima del ramo | `https://<ramo>-<slug>.<sottodominio>.workers.dev` |
| `staging` | anteprima "staging" (quella da mandare al cliente) | `https://staging-<slug>.<sottodominio>.workers.dev` |
| `main` | produzione | dominio del cliente (dopo il go-live) |

Le anteprime sono `noindex` e senza tracciamento. Quando un ramo viene cancellato, la sua anteprima sparisce da sola.

## Go-live (dopo l'approvazione del cliente)
Il dominio lo collega **una persona dal pannello**: il token per-Worker non può farlo (limite di Cloudflare).
1. DNS del dominio su Cloudflare. Prima di cambiare i nameserver **ricopia tutti i record** (MX, SPF, DKIM, TXT): altrimenti si rompe la posta.
2. Merge `staging` → `main`: la CI pubblica la produzione.
3. Worker `<slug>` → **Domains → Add → Custom Domain** → `www.<dominio>` (e l'apex, se serve).
4. Search Console e invio `sitemap.xml`. La pagina *Rilasci* della roadmap ClickUp la aggiorna Claude.

## Cosa non si fa
- Mai la *Global API Key* né un token "tutti i Worker" per un sito cliente.
- Mai token nei `.env` locali o negli environment di Claude: il deploy passa solo dalla CI del repo.
- Mai `routes`/`custom_domain` in `wrangler.jsonc`: col token per-Worker il deploy fallirebbe.
- Se un cliente se ne va: cancelli il suo token e il suo Worker, senza toccare gli altri.

## Solo se il sito ha il modulo contatti
Il modulo lo configura Claude (`--contatti=<email>`). Nelle anteprime funziona in modalità prova (non invia). Per le email vere:
1. Il dominio del cliente deve avere i **DNS su Cloudflare** (di solito al go-live).
2. Cloudflare → **Email** → **Email Sending** → aggiungi il dominio `<dominio>`: Cloudflare crea da solo i record SPF/DKIM.
   (Da terminale, con un account che ne ha i permessi: `npx wrangler email sending enable <dominio>`.)
3. Dopo il primo deploy di produzione, fai un invio di prova dal sito e controlla che arrivi.
4. Facoltativo, antispam più forte: Cloudflare → **Turnstile** → nuovo widget per `<dominio>` → la chiave pubblica va in
   `settings.contactForm.turnstileSiteKey` (lo fa Claude), la chiave segreta nel Worker → **Settings → Variables and Secrets** →
   secret `TURNSTILE_SECRET_KEY`.

## Solo livello `emdash` (CMS): database e file
Oltre al Worker: un D1 `<slug>-db` e un bucket R2 `<slug>-media`, **una copia sola** condivisa da produzione e anteprime
(regole in `docs/SITE-RULES.md` §Dati). Si creano a mano dal pannello come il Worker.

## Chi fa cosa
| Passo | Chi |
|---|---|
| 1–4 (Worker, token, repo, secret, ClickUp, servizi) | Federico o Damiano |
| Intake, codice, design, build, QA, PR, anteprima, protocollo, roadmap | Claude (`new-client-site`) |
| Approvazioni (direzione grafica, scope) | Federico o Damiano, con il cliente |
| Go-live: DNS, merge `staging` → `main`, dominio sul Worker | Federico o Damiano |
