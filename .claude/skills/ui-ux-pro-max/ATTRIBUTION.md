# Attribuzione

Skill **vendorizzata**: copiata nel template perché ogni repo cliente deve essere self-contained
(la sessione cloud vede solo il repo).

- Fonte: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/50d8a7d/.claude/skills/ui-ux-pro-max
- Commit: `50d8a7d` (aggiornato il 2026-10-09)
- Licenza: MIT (vedi il file di licenza in questa cartella)
- Modifiche Adabù: solo la skill principale (non banner/brand/slides…); tolti `scripts/tests`; percorsi `${CLAUDE_PLUGIN_ROOT}/…` → `.claude/skills/ui-ux-pro-max/…`.

Per aggiornarla: `bash skills/vendor-refresh.sh` (non modificare a mano: le regole di casa stanno in
`.claude/skills/house-style/SKILL.md`, che dice quando usare questa skill e cosa prevale).
