# Regole fisse dei siti Adabù (v2)

Valgono per ogni sito cliente. I comandi e i file citati (`npm test`, `tools/…`, `src/…`) esistono nel **repo cliente** dopo lo scaffold dal ramo `v2-astro-riferimento`: il repo template contiene solo istruzioni. Le ex "Regole ferme" di `CLAUDE.md` stanno qui, così il `CLAUDE.md` dei repo
cliente può restare solo entrypoint del protocollo.

## Regola madre — redesign DA ZERO
Ogni nuovo sito ridisegna la veste partendo dal **sito vecchio del cliente**: si **estrae e reinterpreta** (logo, colori, font, tono,
contenuti, struttura, elementi "firma"), **non si copia 1:1**. Mai ereditare palette/tipografia/hero/"ritmo" da un altro cliente.
La direzione va approvata (gate "direzione grafica") prima del build. Strumenti: `impeccable` + `ui-ux-pro-max` con la regia di `house-style`; testi con `stop-slop`.

## Architettura e vincoli
- **Astro, output statico**, servito da **Cloudflare Workers con file statici**. Niente SSR al livello `static`.
- **Un Worker per cliente** (nome = slug, solo in `wrangler.jsonc`). Niente Worker `-staging`: le anteprime stanno nello stesso Worker.
- Il codice del Worker gira **solo su `/api/*`** (modulo contatti): le pagine restano file statici. Niente altro codice server senza decisione esplicita.
- **Mai D1/R2 al livello `static`.** D1/R2 solo al tier `emdash`, uno per cliente (§Dati). E-commerce: fuori da questo template (WooCommerce/Shopify).
- Contenuti **solo** in `src/content/` (schemi in `src/lib/content/schema.ts`); componenti e pagine **solo** via `src/lib/content`.
- JS a runtime solo se serve: `src/scripts/site.js` (micro-interazioni, progressive enhancement). L'editor mockup è **solo nelle anteprime**.
- Niente Three.js/GSAP pesanti; motion con parsimonia.

## Lingue
Una lingua principale senza prefisso (`settings.lang`) e lingue aggiuntive sotto `/<lingua>/` (`settings.locales`).
Ogni pagina tradotta è scritta (o rivista) da una persona nella sua lingua: niente traduzioni automatiche pubblicate senza revisione.
`hreflang`, selettore lingua, sitemap e `llms.txt` per lingua sono generati: non si scrivono a mano.

## Modulo contatti
Un solo endpoint (`/api/contact`), email al cliente con Cloudflare Email Service dal suo dominio. Consenso privacy obbligatorio,
antispam sempre attivo, nessun dato salvato: il messaggio va solo per email. Nelle anteprime non parte nessuna email.

## URL indipendenti dal dominio
Link interni e asset sempre **root-relative** (`/…`). Assoluti solo canonical, `og:*`, JSON-LD e sitemap, sempre su `settings.url`
(dominio di **produzione**), mai `*.pages.dev`/`*.workers.dev`. Verificato da `tools/validate-seo.mjs`.

## Branch e pubblicazione
Mai push su `main`. Ogni ramo → la sua **anteprima** (`wrangler preview`, URL `<ramo>-<slug>.<sottodominio>.workers.dev`);
`staging` → anteprima "staging" da mandare al cliente; al "pubblica" merge **fast-forward** `staging` → `main` → produzione (`wrangler deploy`).
PR sempre draft. `main` builda con `STRICT=1`. Le anteprime buildano con `PUBLIC_STAGE=staging` (noindex, niente tracciamento, editor).
Ramo cancellato → anteprima eliminata dalla CI.

## Dati (solo livello `emdash`)
- **Una copia sola**: 1 D1 + 1 R2 per cliente, condivisi da produzione e anteprime (stessi binding nel blocco `previews` di `wrangler.jsonc`).
- **Nelle anteprime si lavora solo su grafica e codice**: nessun contenuto si inserisce lì. I contenuti si inseriscono **solo in produzione**.
- **Migrazioni**: EmDash aggiorna il DB da solo all'avvio (`auto`). Nelle anteprime `EMDASH_MIGRATIONS_MODE=check` (in `previews.vars`):
  se il DB andrebbe aggiornato l'anteprima si ferma invece di toccare la produzione. Gli aggiornamenti di EmDash si provano in locale
  (`wrangler dev` con copia locale dei dati) e vanno online solo col deploy di produzione.
- **Backup DB**: D1 Time Travel (ripristino a un minuto qualsiasi degli ultimi 30 giorni col piano a pagamento). Niente da configurare.
- **Cestino file (R2)**: R2 non ha backup né cestino. Cancellare un file dal CMS = **spubblicarlo**: l'adattatore R2 del template (da scrivere insieme
  al livello `emdash`: EmDash permette di sostituire lo storage) lo sposta in `_cestino/` dello stesso bucket invece di cancellarlo; una regola del bucket svuota il cestino dopo **1 anno**. EmDash dà già un
  nome unico a ogni upload, quindi non ci sono sovrascritture. Ciò che si cancella a mano dal pannello Cloudflare è perso.

## Infrastruttura sempre attiva (la funzione non cambia col cliente, cambia la pelle)
Editor mockup (solo anteprime, password da `EDITOR_PASSWORD`) · micro-interazioni · consenso (iubenda o banner "solo tecnici") ·
SEO/GEO generati · favicon + og-image (`npm run assets`) · 404 · `llms.txt`.

## Pattern strutturali (default, ri-skinnati per cliente)
Header: logo sx, a destra nav + CTA pill + hamburger (mobile: dropdown a destra, header compatto). Footer mobile: logo sx + tagline dx, menu e social centrati.
Sponsor/loghi a riquadri uniformi (`logos`, `object-fit: contain`).

## Per-cliente — non si eredita mai
Token di design · hero · contenuti e immagini · dati legali (ragione sociale, P.IVA, sede) · dominio e nome Worker · ID di tracciamento.

## Pre-lancio (produzione)
- [ ] Dati legali confermati col cliente; testo privacy/cookie **validato** (iubenda o testo legale), non il segnaposto.
- [ ] `settings.url` sul dominio reale; `STRICT=1 npm run build` verde; `npm test` verde.
- [ ] Favicon + og-image brandizzati (nessun `tools/PLACEHOLDER-ASSETS.md`).
- [ ] DNS su Cloudflare con record importati (MX/SPF/…); custom domain collegato **dal pannello** (non in `wrangler.jsonc`); redirect dai vecchi URL.
- [ ] File scaricabili/legacy in `public/` ai path attesi.
- [ ] Consenso: Consent Mode denied → iubenda → GTM verificato; niente tracciamento nelle anteprime.
- [ ] Modulo contatti (se c'è): dominio abilitato a Email Sending, un invio di prova in produzione arrivato al cliente.
- [ ] Più lingue (se ci sono): ogni pagina tradotta rivista da una persona; selettore lingua e `hreflang` verificati.
- [ ] Pubblicazione `staging` → `main`; Search Console + sitemap; Sharing Debugger / LinkedIn Inspector.
- [ ] Roadmap ClickUp aggiornata (Rilasci).
