#!/usr/bin/env node
/**
 * Produzione senza editor: con EDITOR_PASSWORD impostata, la build di produzione non deve
 * contenere editor.js, AUT_EDITOR_PASSWORD né la password. Controllo positivo: la build di
 * staging li contiene (altrimenti il test non proverebbe nulla).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const PW = 'pw-di-test-9f3c1a';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const build = (stage, out) => execSync('npx astro build', { env: { ...process.env, CONTENT_DIR: 'examples/local-business/content', PUBLIC_STAGE: stage, EDITOR_PASSWORD: PW, OUT_DIR: out }, stdio: 'pipe' });
const scan = (d) => {
  const all = walk(d);
  const hit = all.filter((f) => /\.(html|js|mjs|css|txt|xml|json)$/.test(f) && /AUT_EDITOR|AUT_STAGE/.test(fs.readFileSync(f, 'utf8')) || (/\.(html|js|mjs|css|txt|xml|json)$/.test(f) && fs.readFileSync(f, 'utf8').includes(PW)));
  return { editorFile: all.some((f) => path.basename(f) === 'editor.js'), hit };
};

build('production', 'dist-prod'); build('staging', 'dist-stage');
const p = scan('dist-prod'), s = scan('dist-stage');
fs.rmSync('dist-prod', { recursive: true, force: true }); fs.rmSync('dist-stage', { recursive: true, force: true });

let fail = 0;
if (p.editorFile || p.hit.length) { console.log(`✗ PRODUZIONE contiene editor/password: editor.js=${p.editorFile} file=${p.hit.join(', ')}`); fail++; } else console.log('✓ Build di produzione: nessun editor.js, nessuna password');
if (!s.editorFile || !s.hit.length) { console.log('✗ Controllo positivo fallito: lo staging non include l\'editor'); fail++; } else console.log('✓ Build di staging: editor e password presenti (controllo positivo)');
process.exit(fail ? 1 : 0);
