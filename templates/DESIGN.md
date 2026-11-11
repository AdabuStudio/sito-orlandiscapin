<!--
  TEMPLATE della direzione grafica. L'orchestratore lo riempie e lo committa nel repo cliente.
  Obiettivo: un look DISTINTIVO legato al brand, non un default templato. Vedi skill impeccable (regia in house-style).
-->
# DESIGN — {{NOME_BRAND}}

## Brief in una riga
{{BRIEF}}  <!-- soggetto concreto + pubblico + il singolo compito della home -->

## Direzione scelta
{{DIREZIONE}}  <!-- la tesi visiva: cosa rende questo sito riconoscibile -->

## Token
- **Palette** (4–6 colori con nome + hex):
  - primary: {{COLOR_PRIMARY}}
  - secondary: {{COLOR_SECONDARY}}
  - bg: {{COLOR_BG}}
  - text: {{COLOR_TEXT}}
  - accent: {{COLOR_ACCENT}}
- **Tipografia**: display = {{FONT_DISPLAY}} · body = {{FONT_BODY}} · (utility = {{FONT_UTILITY}})
- **Signature element**: {{SIGNATURE}}  <!-- l'unica cosa memorabile; il resto resta quieto -->
- **Motion**: {{MOTION}}  <!-- di default minimale; se presente, CSS/CDN, off-by-default -->

## Scouting competitor (riferimenti reali)
{{COMPETITOR}}  <!-- 2-4 voci: nome, link, cosa rubare/evitare, da WebSearch / Meta Ads Library -->

## Cosa NON fare (anti-AI-slop)
- Evita i 3 cliché: cream+serif+terracotta · near-black+accent acido · broadsheet a colonne.
- Niente animazioni decorative; niente gradienti/numeri 01/02/03 se non significano qualcosa.
- {{NO_FARE_EXTRA}}

## Mappatura sul template
- `design.colors` / `design.fonts` in `site.config.json` ← token qui sopra.
- Signature element → realizzalo in un blocco esistente o in CSS mirato (no framework).
