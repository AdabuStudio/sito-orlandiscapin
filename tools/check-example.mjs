#!/usr/bin/env node
/** Criteri dell'esempio (examples/local-business): 3 pagine + blog + 2 post + 2 sedi + avviso scaduto assente + inglese + modulo. */
import fs from 'node:fs';
import path from 'node:path';

const D = process.argv[2] ?? 'dist';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const html = walk(D).filter((f) => f.endsWith('.html'));
const all = html.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const ex = (p) => fs.existsSync(path.join(D, p));
const read = (p) => (ex(p) ? fs.readFileSync(path.join(D, p), 'utf8') : '');
const checks = [
  ['3 pagine (home, corsi, contatti)', ['index.html', 'corsi/index.html', 'contatti/index.html'].every(ex)],
  ['blog con indice e 2 post', ex('blog/index.html') && html.filter((f) => /blog[\\/][^\\/]+[\\/]index\.html$/.test(f)).length === 2],
  ['2 sedi in JSON-LD (LocalBusiness/DrivingSchool)', (all.match(/"@id":"[^"]*#location-/g) || []).length >= 2 && /#location-asolo/.test(all) && /#location-bassano/.test(all)],
  ['avviso scaduto NON compare', !/AVVISO-SCADUTO|Chiusura estiva SCADUTA/.test(all)],
  ['avviso valido compare', /Iscrizioni aperte/.test(all)],
  ['immagini ottimizzate (webp + srcset)', /srcset="[^"]*\.webp \d+w/.test(all)],
  ['FAQPage nei corsi', /"@type":"FAQPage"/.test(fs.readFileSync(path.join(D, 'corsi/index.html'), 'utf8'))],
  ['BlogPosting nei post', /"@type":"BlogPosting"/.test(all)],
  ['inglese: /en/ e /en/contact/ con html lang="en"', ['en/index.html', 'en/contact/index.html'].every(ex) && /<html lang="en"/.test(read('en/contact/index.html'))],
  ['hreflang it ↔ en tra contatti e contact', /hreflang="en" href="[^"]*\/en\/contact\/"/.test(read('contatti/index.html')) && /hreflang="it" href="[^"]*\/contatti\/"/.test(read('en/contact/index.html'))],
  ['selettore lingua presente', /class="lang-switch"/.test(read('index.html'))],
  ['nessun blog inglese (nessun articolo in inglese)', !ex('en/blog/index.html')],
  ['modulo contatti verso /api/contact, con consenso privacy', /action="\/api\/contact"/.test(read('contatti/index.html')) && /name="consent"[^>]*required/.test(read('contatti/index.html'))],
];
let fail = 0;
for (const [n, ok] of checks) { console.log(`${ok ? '✓' : '✗'} ${n}`); if (!ok) fail++; }
process.exit(fail ? 1 : 0);
