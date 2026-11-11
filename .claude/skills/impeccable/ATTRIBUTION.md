# Attribuzione

Skill **vendorizzata**: copiata nel template perché ogni repo cliente deve essere self-contained
(la sessione cloud vede solo il repo).

- Fonte: https://github.com/pbakaus/impeccable/tree/d631a88/.claude/skills/impeccable
- Commit: `d631a88` (aggiornato il 2026-10-09)
- Licenza: Apache License 2.0 (con NOTICE.md) (vedi il file di licenza in questa cartella)
- Modifiche Adabù: `scripts/` sostituita da un segnaposto che non scarica il motore (vedi intestazione di skills/vendor-refresh.sh); `SKILL.md` e `reference/` verbatim.

Per aggiornarla: `bash skills/vendor-refresh.sh` (non modificare a mano: le regole di casa stanno in
`.claude/skills/house-style/SKILL.md`, che dice quando usare questa skill e cosa prevale).
