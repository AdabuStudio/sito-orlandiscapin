// node tools/gen-assets.mjs <logo> <hero>     (npm run assets -- <logo> <hero>)
// Genera favicon (32/192 trasparenti, 180 apple-touch su bianco, favicon.svg) e la social card
// 1200×630 partendo da logo e hero del cliente, in public/assets/img/. <logo> e <hero> sono nomi
// file dentro src/assets/images/ (o percorsi). Titolo/sottotitolo della card: OG_TITLE / OG_SUB,
// altrimenti nome e tagline di settings/site.json. Elimina il marker dei segnaposto.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchChromium } from './browser.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'assets', 'img');
const [logoArg, heroArg] = process.argv.slice(2);
if (!logoArg || !heroArg) { console.error('Uso: npm run assets -- <logo> <hero>  (nomi in src/assets/images/)'); process.exit(1); }

const find = (n) => [resolve(n), join(ROOT, 'src', 'assets', 'images', n)].find(existsSync);
const mime = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' };
const dataURI = async (n) => { const f = find(n); if (!f) throw new Error(`File non trovato: ${n}`); return `data:${mime[extname(f).toLowerCase()] ?? 'image/png'};base64,${(await readFile(f)).toString('base64')}`; };

let settings = {};
try { settings = JSON.parse(await readFile(join(ROOT, process.env.CONTENT_DIR ?? 'src/content', 'settings', 'site.json'), 'utf8')); } catch {}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const TITLE = esc(process.env.OG_TITLE || settings.name || 'Nome');
const SUB = esc(process.env.OG_SUB || settings.tagline || '');
const accent = settings.design?.colors?.accent ?? '#e2543b';

const logo = await dataURI(logoArg), hero = await dataURI(heroArg);
await mkdir(OUT, { recursive: true });
const b = await launchChromium();
const shot = async (w, h, html, file, opts = {}, sel) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const pg = await ctx.newPage();
  await pg.setContent(html);
  await pg.waitForTimeout(300);
  await writeFile(file, sel ? await pg.locator(sel).screenshot(opts) : await pg.screenshot({ ...opts, clip: { x: 0, y: 0, width: w, height: h } }));
  await ctx.close();
};

for (const size of [32, 192]) {
  await shot(size, size, `<style>html,body{margin:0;background:transparent}</style><img src="${logo}" style="width:${size}px;height:${size}px;object-fit:contain">`, join(OUT, `favicon-${size}.png`), { omitBackground: true }, 'img');
}
await shot(180, 180, `<style>html,body{margin:0}</style><div style="width:180px;height:180px;background:#fff;display:flex;align-items:center;justify-content:center"><img src="${logo}" style="width:168px;height:168px;object-fit:contain"></div>`, join(OUT, 'favicon-180.png'), {}, 'div');
await shot(1200, 630, `<style>html,body{margin:0}</style>
  <div style="width:1200px;height:630px;position:relative;overflow:hidden;background:#111">
    <img src="${hero}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.8))"></div>
    <div style="position:absolute;left:72px;right:72px;bottom:66px;color:#fff;font-family:Arial,sans-serif">
      <span style="display:inline-block;background:#fff;padding:14px 16px;border-radius:18px;margin-bottom:24px;border-bottom:6px solid ${accent}"><img src="${logo}" style="height:96px;display:block"></span>
      <div style="font-size:84px;font-weight:800;line-height:.95">${TITLE}</div>
      <div style="font-size:32px;margin-top:18px;opacity:.92">${SUB}</div>
    </div>
  </div>`, join(OUT, 'og-image.jpg'), { type: 'jpeg', quality: 84 });
await b.close();

const png192 = (await readFile(join(OUT, 'favicon-192.png'))).toString('base64');
await writeFile(join(ROOT, 'public', 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><image href="data:image/png;base64,${png192}" width="192" height="192"/></svg>\n`);
await rm(join(ROOT, 'tools', 'PLACEHOLDER-ASSETS.md'), { force: true });
console.log('✓ favicon-32/192/180.png, favicon.svg, og-image.jpg generati; marker segnaposto rimosso');
