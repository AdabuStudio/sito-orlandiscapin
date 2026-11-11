#!/usr/bin/env node
/**
 * (1) Nessun file in src/ importa `astro:content` / usa getCollection|getEntry, tranne
 *     l'adattatore `files` e content.config.ts.
 * (2) Interfaccia indipendente dall'adattatore: la build dell'esempio con CONTENT_ADAPTER=fs
 *     deve produrre lo stesso HTML di quella con l'adattatore `files`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ALLOWED = new Set(['src/lib/content/adapters/files.ts', 'src/content.config.ts']);
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const bad = [];
for (const f of walk('src')) {
  const p = f.split(path.sep).join('/');
  if (!/\.(astro|ts|js|mjs|tsx)$/.test(p) || ALLOWED.has(p)) continue;
  const code = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');   // ignora i commenti
  if (/astro:content|getCollection\s*\(|getEntry\s*\(/.test(code)) bad.push(p);
}
if (bad.length) { console.log('✗ Accesso diretto alle content collections fuori dallo strato dati:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('✓ Nessun accesso diretto a astro:content fuori da src/lib/content');

const env = { ...process.env, CONTENT_DIR: 'examples/local-business/content', PUBLIC_STAGE: 'production' };
const build = (adapter, out) => execSync('npx astro build', { env: { ...env, CONTENT_ADAPTER: adapter, OUT_DIR: out }, stdio: 'pipe' });
build('', 'dist-adapter-files'); build('fs', 'dist-adapter-fs');
const htmls = (d) => walk(d).filter((f) => /\.(html|xml|txt)$/.test(f)).map((f) => path.relative(d, f)).sort();
const a = htmls('dist-adapter-files'), b = htmls('dist-adapter-fs');
let diff = 0;
if (a.join() !== b.join()) { console.log('✗ Elenco file diverso tra adattatori'); diff++; }
const norm = (s) => s.replace(/ id="[^"]*"/g, '');   // gli id dei titoli li aggiunge solo il renderer Astro
for (const f of a.filter((x) => b.includes(x))) {
  if (norm(fs.readFileSync(path.join('dist-adapter-files', f), 'utf8')) !== norm(fs.readFileSync(path.join('dist-adapter-fs', f), 'utf8'))) { console.log(`✗ Output diverso: ${f}`); diff++; }
}
fs.rmSync('dist-adapter-files', { recursive: true, force: true }); fs.rmSync('dist-adapter-fs', { recursive: true, force: true });
if (diff) process.exit(1);
console.log(`✓ Adattatori files e fs producono lo stesso sito (${a.length} file confrontati)`);
