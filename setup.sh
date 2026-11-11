#!/usr/bin/env bash
# setup.sh — prepara l'ambiente per costruire e fare QA del sito.
# IDEMPOTENTE: controlla cosa è già presente prima di installare.
# Pensato per la sandbox cloud (network "Trusted"): se un comando fallisce per
# rete, stampa il comando esatto e il dominio da consentire, poi prosegue.
set -uo pipefail

ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
info() { printf '  \033[36m•\033[0m %s\n' "$1"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$1"; }

NET_FAIL=0
note_net_fail() {
  NET_FAIL=1
  warn "FALLITO (probabile rete): $1"
  warn "  Dominio da consentire nell'environment: $2"
}

echo "==> Adabu Site Template — setup"

# 1) Node + npm (non li installiamo nella sandbox: li verifichiamo soltanto)
if command -v node >/dev/null 2>&1; then
  ok "Node $(node --version) presente"
else
  warn "Node non trovato: installalo (>=18) prima di continuare."
fi
if command -v npm >/dev/null 2>&1; then
  ok "npm $(npm --version) presente"
else
  warn "npm non trovato."
fi

# 2) Dipendenze di progetto (astro, wrangler, playwright). Salta se già installate.
if [ -f package.json ]; then
  if [ -d node_modules/astro ] && [ -d node_modules/playwright ]; then
    ok "node_modules già presenti (skip npm install)"
  else
    info "Installo le dipendenze (npm install)…"
    if npm install --no-audit --no-fund; then
      ok "npm install completato"
    else
      note_net_fail "npm install" "registry.npmjs.org"
    fi
  fi
fi

# 3) Browser Playwright (chromium) con dipendenze di sistema. Idempotente.
if command -v npx >/dev/null 2>&1; then
  if [ -d "${HOME}/.cache/ms-playwright" ] && ls "${HOME}/.cache/ms-playwright" 2>/dev/null | grep -qi chromium; then
    ok "Chromium Playwright già installato (skip)"
  else
    info "Installo Chromium Playwright (--with-deps)…"
    if npx --yes playwright install --with-deps chromium; then
      ok "Chromium installato (con dipendenze di sistema)"
    else
      warn "install --with-deps fallito (spesso è l'apt-get delle dipendenze di sistema)."
      info "Riprovo col solo binario del browser…"
      if npx --yes playwright install chromium; then
        ok "Chromium (binario) installato. Se la QA dà errori di librerie, servono le system deps via apt."
      else
        note_net_fail "npx playwright install chromium" "cdn.playwright.dev, playwright.download.prss.microsoft.com"
      fi
    fi
  fi
else
  warn "npx non disponibile: impossibile installare Playwright."
fi

# 4) Wrangler CLI (deploy Cloudflare Workers). Idempotente; usiamo npx come fallback.
if command -v wrangler >/dev/null 2>&1; then
  ok "wrangler $(wrangler --version 2>/dev/null | head -1) presente"
elif npx --yes wrangler --version >/dev/null 2>&1; then
  ok "wrangler disponibile via 'npx wrangler' (nessuna install globale necessaria)"
else
  info "Provo a rendere disponibile wrangler via npx…"
  if npx --yes wrangler --version >/dev/null 2>&1; then
    ok "wrangler ok"
  else
    note_net_fail "npx wrangler --version" "registry.npmjs.org, *.cloudflare.com"
  fi
fi

echo
if [ "$NET_FAIL" -eq 0 ]; then
  ok "Setup completato."
else
  warn "Setup completato con avvisi di rete: vedi sopra i domini da consentire."
fi
echo "    Prossimo passo:  npm run build   (oppure  npm run build:example && npm run qa)"
