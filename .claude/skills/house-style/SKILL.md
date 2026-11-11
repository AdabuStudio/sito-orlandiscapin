---
name: house-style
description: >
  Standard di casa Adabù per i siti brochure e regia del kit di skill (impeccable, ui-ux-pro-max, stop-slop, web-quality): quale skill usare in ogni fase
  (direzione grafica, testi, qualità) e cosa prevale. Direzione visiva, tono di voce, accessibilità minima,
  performance immagini, regola "no JS inutile". Usalo durante design, scrittura contenuti e review di un sito.
---

# house-style — standard Adabù

## Kit di skill: quando usare cosa
| Fase | Skill | Note Adabù |
|---|---|---|
| Direzione grafica e rifinitura | `impeccable` + `ui-ux-pro-max` | Si parte **sempre dal sito vecchio e dal brand del cliente** (regola madre). `ui-ux-pro-max` serve a proporre e verificare palette, abbinamenti di font, pattern e regole UX dal suo archivio (`python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<settore> <keywords>" --design-system`, anche `--stack astro`): è un **consulente**, non un catalogo di temi da applicare. Non usare `--persist`: la direzione scelta va in `docs/DESIGN.md`. **impeccable** gira in modalità *solo istruzioni*: il suo motore è disattivato (lo script risponde "motore disattivato", è normale: segui il percorso "Launcher unavailable"). Per impeccable `DESIGN.md` = `docs/DESIGN.md` e `PRODUCT.md` = `docs/SCOPE.md`: non creare `DESIGN.md`/`PRODUCT.md` nella radice. Mai `npx impeccable` né installare il motore. |
| Testi del sito | `stop-slop` | Su ogni testo prima della PR. È scritta per l'inglese. In italiano valgono le regole di **struttura**: niente "non è X, è Y", due elementi invece di tre, niente chiuse a slogan, nessun trattino lungo (—), soggetto concreto e voce attiva, cose specifiche invece di frasi vaghe. Gli avverbi si tagliano quando fanno solo enfasi. La lista di frasi e il controllo sulle parole "Wh-" sono inglesi: adattali, non tradurli. |
| Qualità prima del lancio | `web-quality-audit` (+ `performance`, `core-web-vitals`, `accessibility`, `seo`, `best-practices`) | Obiettivo Lighthouse mobile ≥95. Lavorano sul sito buildato (`npm run build`), dopo `playwright-qa`. |
| Documentazione Astro | MCP `astro-docs` (`.mcp.json` / `.codex/config.toml`) | Prima di usare un'API di Astro che non conosci bene, controlla lì: il template usa Astro 7. |

**Cosa prevale, in ordine:** `docs/SITE-RULES.md` → `docs/CONTENT-CONTRACT.md` (SEO/GEO generati dal template: la skill `seo`
non li riscrive a mano) → questa skill → le skill vendorizzate. Le skill vendorizzate non si modificano: si aggiornano con
`bash skills/vendor-refresh.sh` (template). Codex le legge da `.agents/skills/` (collegamenti alle stesse cartelle).

## Direzione visiva (no "AI slop")
Per ogni sito usa **`impeccable`** (`.claude/skills/impeccable/`: comandi come `shape`, `critique`, `polish`, `typeset`, `colorize`),
con `ui-ux-pro-max` come archivio di riferimento:
- Identità distintiva radicata nel **soggetto/brand**, non default templati.
- Token compatti: palette 4–6 colori, una **display face** caratteriale + una **body face**, ev. utility.
- **UN** signature element memorabile; tutto il resto disciplinato e quieto.
- Evita i 3 cliché AI: cream+serif+terracotta · near-black+accent acido · broadsheet a colonne.
- **Motion con parsimonia**: troppa animazione "sa di generato dall'AI". Di default niente
  Three.js/GSAP pesanti (romperebbero performance e SEO (sito statico)). Eventuale motion = CSS o CDN, opzionale e documentato.

## Tono di voce
- Scrivi dal lato dell'utente: nomina le cose come le riconosce chi legge, non come è fatto il sistema.
- Voce attiva, sentence case, frasi brevi, niente filler. "Specifico" batte "creativo".
- Le CTA dicono cosa succede ("Prenota", non "Invia") e restano coerenti in tutto il flusso.
- Adatta il registro al brand e al pubblico del cliente (vedi `DESIGN.md`/brand voice).
- Passa ogni testo con `stop-slop` (regole di struttura) prima della PR.

## Accessibilità minima (quality floor, sempre)
- Un solo `<h1>` per pagina; gerarchia heading coerente.
- Tutte le immagini con `alt` significativo (vuoto solo se decorative).
- Contrasto AA sul testo; focus tastiera visibile; `skip-link` presente (già nel `base.html`).
- `prefers-reduced-motion` rispettato; target touch ≥ 40px; lingua corretta in `<html lang>`.

## Performance immagini
- Comprimi prima di committare; larghezza adeguata al render (no immagini da 4000px in un hero da 1200px).
- Preferisci WebP/AVIF dove possibile; `loading="lazy"` sotto la piega, `eager` solo per l'hero.
- Indica `width`/`height` quando noti per evitare layout shift (CLS).

## No JS inutile
- Il sito è statico: la maggior parte delle interazioni si fa in CSS (es. `<details>` per le FAQ).
- Aggiungi JS solo se serve davvero a un obiettivo, da CDN o file singolo, mai un framework.

## Checklist di review veloce
- [ ] Look distintivo, non generico (passa il test "sembra fatto apposta per questo brand?").
- [ ] Copy chiaro, CTA coerenti, zero filler, passato con `stop-slop`.
- [ ] Accessibilità minima rispettata.
- [ ] Immagini leggere e con alt.
- [ ] `web-quality-audit` sul sito buildato: Lighthouse mobile ≥95, nessun problema bloccante.
