#!/usr/bin/env bash
# vendor-refresh.sh — scarica/aggiorna le skill vendorizzate del kit Adabù e i collegamenti per Codex.
# Idempotente: riscarica da upstream, sovrascrive, riscrive ATTRIBUTION.md con il commit usato.
# Richiede git e rete verso github.com. Lancialo dalla radice del repo template: bash skills/vendor-refresh.sh
#
# Kit (decisione 2026-10-08, docs in .claude/skills/house-style/SKILL.md):
#   impeccable        pbakaus/impeccable                    Apache-2.0  direzione grafica e rifinitura (SOLO istruzioni: motore disattivato)
#   ui-ux-pro-max     nextlevelbuilder/ui-ux-pro-max-skill  MIT         archivio stili/palette/font/regole UX (Python, locale)
#   stop-slop         hardikpandya/stop-slop                MIT         testi senza tic da AI
#   accessibility, best-practices, core-web-vitals, performance, seo, web-quality-audit
#                     addyosmani/web-quality-skills          MIT         qualità web / Lighthouse
# impeccable: il suo launcher scarica ed esegue un binario da GitHub a ogni sessione. Qui scripts/ è sostituita da un
# segnaposto che non scarica nulla ed esce con errore: la skill passa al suo percorso ufficiale "Launcher unavailable"
# (legge DESIGN.md/PRODUCT.md e continua con le sole istruzioni). Si perdono detector, comp-diff e modalità live.
set -euo pipefail
cd "$(dirname "$0")/.."
SK=.claude/skills
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT

clone() { # owner/repo → stampa il commit
  git clone -q --depth 1 "https://github.com/$1.git" "$TMP/${1//\//_}"
  git -C "$TMP/${1//\//_}" rev-parse --short HEAD
}

attribution() { # skill  repo  percorso  commit  licenza  modifiche
  cat > "$SK/$1/ATTRIBUTION.md" <<EOF
# Attribuzione

Skill **vendorizzata**: copiata nel template perché ogni repo cliente deve essere self-contained
(la sessione cloud vede solo il repo).

- Fonte: https://github.com/$2/tree/$4/$3
- Commit: \`$4\` (aggiornato il $(date +%Y-%m-%d))
- Licenza: $5 (vedi il file di licenza in questa cartella)
- Modifiche Adabù: $6

Per aggiornarla: \`bash skills/vendor-refresh.sh\` (non modificare a mano: le regole di casa stanno in
\`.claude/skills/house-style/SKILL.md\`, che dice quando usare questa skill e cosa prevale).
EOF
}

replace_dir() { rm -rf "${SK:?}/$1"; mkdir -p "$SK/$1"; }

echo "==> impeccable (pbakaus/impeccable) — solo istruzioni"
c=$(clone pbakaus/impeccable); r="$TMP/pbakaus_impeccable"
rm -rf "${SK:?}/frontend-design"   # sostituita da impeccable (che parte dalla stessa base Anthropic)
replace_dir impeccable; cp -R "$r/.claude/skills/impeccable/SKILL.md" "$r/.claude/skills/impeccable/reference" "$SK/impeccable/"
cp "$r/LICENSE" "$SK/impeccable/LICENSE"; cp "$r/NOTICE.md" "$SK/impeccable/NOTICE.md"
mkdir -p "$SK/impeccable/scripts"
cat > "$SK/impeccable/scripts/impeccable" <<'STUB'
#!/bin/sh
# Segnaposto Adabù: il motore di impeccable (binario scaricato da GitHub) è disattivato in questo template.
# Esce con errore di proposito: la skill usa il suo percorso "Launcher unavailable" e continua con le sole istruzioni.
echo "impeccable: motore disattivato nel template Adabù (nessun download). Continua leggendo docs/DESIGN.md e le istruzioni della skill." >&2
exit 1
STUB
chmod +x "$SK/impeccable/scripts/impeccable"
printf '@echo off\r\necho impeccable: motore disattivato nel template Adabu (nessun download). 1>&2\r\nexit /b 1\r\n' > "$SK/impeccable/scripts/impeccable.cmd"
attribution impeccable pbakaus/impeccable .claude/skills/impeccable "$c" "Apache License 2.0 (con NOTICE.md)" \
  "\`scripts/\` sostituita da un segnaposto che non scarica il motore (vedi intestazione di skills/vendor-refresh.sh); \`SKILL.md\` e \`reference/\` verbatim."

echo "==> ui-ux-pro-max (nextlevelbuilder/ui-ux-pro-max-skill)"
c=$(clone nextlevelbuilder/ui-ux-pro-max-skill); r="$TMP/nextlevelbuilder_ui-ux-pro-max-skill"
replace_dir ui-ux-pro-max; cp -R "$r/.claude/skills/ui-ux-pro-max/." "$SK/ui-ux-pro-max/"; cp "$r/LICENSE" "$SK/ui-ux-pro-max/LICENSE"
rm -rf "$SK/ui-ux-pro-max/scripts/tests"
# Upstream è pensata come plugin (\${CLAUDE_PLUGIN_ROOT}); nel repo gli script stanno in .claude/skills/ui-ux-pro-max/.
find "$SK/ui-ux-pro-max" -name '*.md' -exec sed -i.bak 's#"${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/#".claude/skills/ui-ux-pro-max/#g; s#${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/#.claude/skills/ui-ux-pro-max/#g' {} \;
find "$SK/ui-ux-pro-max" -name '*.bak' -delete
attribution ui-ux-pro-max nextlevelbuilder/ui-ux-pro-max-skill .claude/skills/ui-ux-pro-max "$c" "MIT" \
  "solo la skill principale (non banner/brand/slides…); tolti \`scripts/tests\`; percorsi \`\${CLAUDE_PLUGIN_ROOT}/…\` → \`.claude/skills/ui-ux-pro-max/…\`."

echo "==> stop-slop (hardikpandya/stop-slop)"
c=$(clone hardikpandya/stop-slop); r="$TMP/hardikpandya_stop-slop"
replace_dir stop-slop; cp -R "$r/SKILL.md" "$r/references" "$r/LICENSE" "$SK/stop-slop/"
attribution stop-slop hardikpandya/stop-slop "" "$c" "MIT" "nessuna (verbatim). La nota per i testi in italiano è in house-style."

echo "==> web-quality-skills (addyosmani/web-quality-skills)"
c=$(clone addyosmani/web-quality-skills); r="$TMP/addyosmani_web-quality-skills"
for s in accessibility best-practices core-web-vitals performance seo web-quality-audit; do
  replace_dir "$s"; cp -R "$r/skills/$s/." "$SK/$s/"; cp "$r/LICENSE" "$SK/$s/LICENSE"
  attribution "$s" addyosmani/web-quality-skills "skills/$s" "$c" "MIT" "nessuna (verbatim). Per SEO/GEO prevale \`docs/CONTENT-CONTRACT.md\`."
done

echo "==> Collegamenti per Codex (.agents/skills → .claude/skills)"
rm -rf .agents/skills; mkdir -p .agents/skills
for d in "$SK"/*/; do n=$(basename "$d"); ln -s "../../.claude/skills/$n" ".agents/skills/$n"; done
ls .agents/skills | tr '\n' ' '; echo
echo "Fatto."
