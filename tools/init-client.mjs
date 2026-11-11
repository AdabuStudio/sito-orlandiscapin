#!/usr/bin/env node
/**
 * Trasforma una COPIA del template in un repo cliente pulito. Si lancia UNA volta, DENTRO il repo
 * del cliente (creato "da template"): è il primo passo di `new-client-site`.
 *
 *   node tools/init-client.mjs <slug> "<Nome Brand>" <dominio> [--tipo=1|2|3] [--tier=static|emdash] [--lingue=en,de] [--contatti=<email>] [--dry-run]
 *
 * Cosa fa:
 *  - azzera la memoria di progetto ereditata dal template (00_PROTOCOL: PROJECT/STATE/TASKS/DECISIONS/HANDOFF)
 *    con le versioni "cliente" di templates/client/, e riduce CLAUDE.md/AGENTS.md al solo entrypoint
 *    del protocollo (le regole del sito vivono in docs/SITE-RULES.md e nelle skill);
 *  - rimuove i documenti che riguardano solo il lavoro sul template (spec/piano v2);
 *  - imposta slug/nome/URL in package.json, wrangler.jsonc, template.json e settings/site.json;
 *  - --lingue=en,de  aggiunge le lingue oltre alla principale (settings.locales);
 *  - --contatti=<email> attiva il modulo contatti: destinatario nel Worker (CONTACT_TO), mittente noreply@<dominio>,
 *    binding send_email. Il dominio va abilitato a Email Sending (docs/ONBOARDING-CLIENTE.md).
 * Rifiuta di girare nel repo del template o su un repo già inizializzato. Zero dipendenze.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
const [slug, name, domain] = args.filter((a) => !a.startsWith('--'));
const DRY = !!flags['dry-run'];
const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };

if (!slug || !name || !domain) die('Uso: node tools/init-client.mjs <slug> "<Nome Brand>" <dominio> [--tipo=1|2|3] [--tier=static|emdash] [--lingue=en,de] [--contatti=<email>] [--dry-run]');
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) die(`slug non valido: "${slug}" (minuscole, numeri, trattini)`);
if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) die(`dominio non valido: "${domain}" (es. cliente.it, senza https://)`);
const tier = flags.tier ?? 'static';
if (!['static', 'emdash'].includes(tier)) die('--tier: static | emdash');
const tipo = { 1: 'Tipo 1 — clone 1:1', 2: 'Tipo 2 — redesign', 3: 'Tipo 3 — nuovo sito' }[flags.tipo ?? 3] ?? die('--tipo: 1 | 2 | 3');
const lingue = String(flags.lingue ?? '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
for (const l of lingue) if (!/^[a-z]{2}(-[a-z]{2})?$/.test(l)) die(`--lingue: codice lingua non valido "${l}" (es. en, de, fr)`);
const contatti = flags.contatti === undefined ? '' : String(flags.contatti);
if (flags.contatti !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contatti)) die(`--contatti: email non valida "${contatti}"`);
const mailDomain = domain.replace(/^www\./i, '');

const tj = JSON.parse(fs.readFileSync(path.join(ROOT, 'template.json'), 'utf8'));
if (tj.client) die(`Repo già inizializzato per "${tj.client.slug}". Niente da fare (non si re-inizializza).`);
let remote = ''; try { remote = execSync('git remote get-url origin', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString(); } catch {}
if (/adabu-site-template/i.test(remote) && !flags['force-template-repo']) die('Questo è il repo del TEMPLATE: i siti cliente NON si onboardano qui. Crea il repo cliente da template e lancia lo script lì.');

const today = new Date().toISOString().slice(0, 10);
const vars = { '{{SLUG}}': slug, '{{NOME_BRAND}}': name, '{{DOMINIO}}': domain, '{{DATA}}': today, '{{TIER}}': tier, '{{TIPO_LAVORO}}': tipo, '{{TEMPLATE_VERSION}}': tj.version };
const fill = (s) => Object.entries(vars).reduce((acc, [k, v]) => acc.split(k).join(v), s);
const log = (m) => console.log(`  ${DRY ? '[dry-run] ' : ''}${m}`);
const write = (rel, content) => { log(`scrive   ${rel}`); if (!DRY) { fs.mkdirSync(path.dirname(path.join(ROOT, rel)), { recursive: true }); fs.writeFileSync(path.join(ROOT, rel), content); } };
const remove = (rel) => { if (fs.existsSync(path.join(ROOT, rel))) { log(`rimuove  ${rel}`); if (!DRY) fs.rmSync(path.join(ROOT, rel), { recursive: true, force: true }); } };

console.log(`→ ${name} (${slug}) · ${domain} · ${tipo} · tier ${tier}${lingue.length ? ` · lingue +${lingue.join(',')}` : ''}${contatti ? ` · modulo → ${contatti}` : ''}`);

// 1) memoria di progetto: versioni "cliente"
const tplProto = path.join(ROOT, 'templates', 'client', '00_PROTOCOL');
for (const f of ['PROJECT.yaml', 'STATE.md', 'TASKS.md', 'DECISIONS.md', 'HANDOFF.md']) write(`00_PROTOCOL/${f}`, fill(fs.readFileSync(path.join(tplProto, f), 'utf8')));
// 2) entrypoint
for (const f of ['CLAUDE.md', 'AGENTS.md']) write(f, fs.readFileSync(path.join(ROOT, 'templates', 'client', f), 'utf8'));
// 3) documenti solo-template
for (const f of ['docs/TEMPLATE-V2-SPEC.md', 'docs/TEMPLATE-V2-PLAN.md']) remove(f);
// 4) identità
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
pkg.name = slug; pkg.version = '0.1.0'; pkg.description = `Sito di ${name} (${domain}) — generato da adabu-site-template v${tj.version}`;
write('package.json', JSON.stringify(pkg, null, 2) + '\n');
let wr = fs.readFileSync(path.join(ROOT, 'wrangler.jsonc'), 'utf8').replace('"name": "adabu-site-template"', `"name": "${slug}"`);
if (contatti) {
  wr = wr.replace('"vars": { "CONTACT_TO": "", "CONTACT_FROM": "" }', `"vars": { "CONTACT_TO": "${contatti}", "CONTACT_FROM": "noreply@${mailDomain}", "CONTACT_FROM_NAME": ${JSON.stringify(name)} }`)
    .replace('// "send_email": [{ "name": "EMAIL" }],', '"send_email": [{ "name": "EMAIL" }],');
  if (!wr.includes(`"CONTACT_TO": "${contatti}"`) || !wr.includes('\n  "send_email"')) die('wrangler.jsonc: blocco del modulo contatti non riconosciuto (template modificato?)');
}
write('wrangler.jsonc', wr);
write('template.json', JSON.stringify({ ...tj, tier, client: { slug, name, domain, initialized: today, tipo: Number(flags.tipo ?? 3) } }, null, 2) + '\n');
const sp = path.join(ROOT, 'src', 'content', 'settings', 'site.json');
const settings = JSON.parse(fs.readFileSync(sp, 'utf8'));
Object.assign(settings, { name, url: `https://${domain}`, tier });
if (lingue.length) settings.locales = lingue.filter((l) => l !== settings.lang);
if (contatti) settings.contactForm = { ...(settings.contactForm ?? {}), enabled: true };
write('src/content/settings/site.json', JSON.stringify(settings, null, 2) + '\n');

console.log(`\n${DRY ? 'Simulazione completata (nessun file toccato).' : '✓ Repo cliente inizializzato.'}`);
console.log('Prossimi passi: compila src/content/, `npm install`, `npm run build`; poi bootstrap del protocollo (00_PROTOCOL/BOOTSTRAP_PROMPT.md) e roadmap ClickUp.');
