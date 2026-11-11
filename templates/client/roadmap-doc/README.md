# Doc ClickUp "SITO — Roadmap di sviluppo"

Un doc per cliente, nella cartella progetto del cliente (`02-PROGETTI/<CLIENTE>`), nome fisso
`SITO — Roadmap di sviluppo`. Quattro pagine, scritte SOLO dal repo (mai riletto come fonte di verità).
Payload sintetico (< ~100 righe a pagina, niente pipe fuori dalle tabelle): dopo ogni scrittura, rileggere.
Cadenza `on_milestone`: deploy in produzione, nuova decisione, cambio stack, blocker, chiusura fase.

| Pagina | Contenuto | Fonte nel repo |
|---|---|---|
| Stato | versione template, tier, URL produzione/staging, ultimo deploy, ultimo commit verificato | `STATE.md`, `template.json` |
| Roadmap | NOW / NEXT / BLOCKED (+ fasi chiuse) | `TASKS.md` |
| Decisioni | voci di `DECISIONS.md`, inclusi i gate umani (direzione grafica, scope Fase 1) | `DECISIONS.md` |
| Rilasci | registro dei deploy in produzione: data, commit, note | git + deploy |

## Lettura (ClickUp → repo)
I task di modifica sito stanno nella stessa cartella cliente: all'ingresso nel repo si leggono e si
riportano in `TASKS.md`, che da quel momento è autoritativo. Il repo non riscrive mai ClickUp con i task.
