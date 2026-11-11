# Decisions

Formato: data · decisione · perché · Status (accepted | inferred | superseded).

- 2026-11-11 · Sito su template `adabu-site-template` v2 (Astro statico + Cloudflare Workers, un Worker `orlandiscapin`), migrazione dal sito Hostinger Horizons · standard Adabù, come Orostyle; Federico ha scritto "Pages", si è seguito il template (Worker) · Status: inferred
- 2026-11-11 · Slug `orlandiscapin`, dominio `orlandiscapin.it`, cartella locale e repo `sito-orlandiscapin` senza la "e" · indicazione di Federico · Status: accepted
- 2026-11-11 · Tipo 2 — redesign: stessa struttura (pagina unica: hero, chi siamo + servizi, team + numeri, contatti), grafica migliorata · scelta di Federico ("Migliorato", "Pagina unica") · Status: accepted
- 2026-11-11 · Logo: NON quello del sito attuale; si usano le varianti fornite dal cliente in `materiale/logo/` · indicazione di Federico · Status: accepted
- 2026-11-11 · Foto: provvisorie marcate "Foto provvisoria", da sostituire con foto vere prima del lancio · scelta di Federico · Status: accepted
- 2026-11-11 · Modulo contatti dal Worker verso `info@orlandiscapin.it` (il vecchio sito non inviava nulla) · default proposto, Federico senza preferenza · Status: inferred
- 2026-11-11 · Nessun tracciamento per ora (iubenda/GTM/BlackBox da decidere prima del go-live) · scelta di Federico · Status: accepted
- 2026-11-11 · `astro.config.mjs`: percorso dell'editor staging con `fileURLToPath` (con `URL.pathname` la build di staging falliva su Windows) · fix locale, da riportare sul ramo `v2-astro-riferimento` · Status: accepted
- Direzione grafica (GATE 1): DA APPROVARE.
