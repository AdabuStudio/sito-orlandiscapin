#!/usr/bin/env node
/**
 * Nome del Worker (da wrangler.jsonc, unica fonte) e nome dell'anteprima di un ramo. Zero dipendenze.
 *
 *   node tools/worker-name.mjs                    → <slug>
 *   node tools/worker-name.mjs --preview <ramo>   → nome anteprima valido per Cloudflare
 *
 * L'URL di un'anteprima è <anteprima>-<worker>.<sottodominio>.workers.dev: "<anteprima>-<worker>" è un'etichetta
 * DNS, quindi solo minuscole/numeri/trattini, inizia con una lettera, al massimo 63 caratteri in tutto.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonc = fs.readFileSync(path.join(ROOT, 'wrangler.jsonc'), 'utf8');
const worker = jsonc.match(/"name"\s*:\s*"([^"]+)"/)?.[1];
if (!worker) { console.error('✗ "name" non trovato in wrangler.jsonc'); process.exit(1); }

export function previewName(ref, workerName = worker) {
  let n = String(ref).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!/^[a-z]/.test(n)) n = `r-${n}`;
  n = n.slice(0, 63 - workerName.length - 1).replace(/-+$/, '');
  return n || 'anteprima';
}

const i = process.argv.indexOf('--preview');
if (i === -1) console.log(worker);
else {
  const ref = process.argv[i + 1];
  if (!ref) { console.error('✗ Uso: node tools/worker-name.mjs --preview <ramo>'); process.exit(1); }
  console.log(previewName(ref));
}
