# Handoff

Data: 2026-11-11 · Ramo: `staging`

## Fatto
- Repo cliente creato dal template v2, `init-client` (Tipo 2, static, contatti → info@orlandiscapin.it), pubblicato su `AdabuStudio/sito-orlandiscapin` (pubblico), ramo `staging`.
- Inventario sito Horizons: `materiale/export-horizons/inventario.md`.
- Loghi (7 varianti) in `materiale/logo/` (versionati). Foto lavori e ufficio in `materiale/` (NON versionate).
- Proposta di direzione grafica "Tavola tecnica" in `docs/DESIGN.md`.

## Prossimo passo
- Attendere l'approvazione del GATE 1 (`docs/DESIGN.md`). Poi: font @fontsource (Archivo, Inter), token in `site.json`, contenuti in `src/content/pages/`, foto in `src/assets/images/lavori/` con nomi neutri, favicon/og (`npm run assets`), build, QA, PR draft.

## Aperto (umano)
- Worker `orlandiscapin` + token per-Worker + secret `CLOUDFLARE_API_TOKEN` (docs/ONBOARDING-CLIENTE.md).
- Cartella ClickUp del cliente (connettore ClickUp non autenticato in questa sessione).
