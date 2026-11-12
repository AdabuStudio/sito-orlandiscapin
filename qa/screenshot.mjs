// qa/screenshot.mjs — QA visiva + link con Playwright (Chromium).
// Serve ./dist con un mini server statico (come fa Cloudflare: /x → /x/index.html, 404.html),
// salva screenshot desktop+mobile in ./qa, segnala link/immagini rotti ed errori JS, e lancia
// tools/validate-seo.mjs (canonical, og, JSON-LD, sitemap, robots, editor in produzione…).
//
// Uso:  npm run qa                 (tutte le pagine in dist)
//       node qa/screenshot.mjs /corsi/   (solo una pagina)
import { launchChromium } from '../tools/browser.mjs';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join, resolve } from 'node:path';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, process.env.OUT_DIR ?? 'dist');
const OUT = join(ROOT, 'qa');
if (!existsSync(DIST)) { console.error('✗ dist/ assente. Lancia prima:  npm run build   (o build:example)'); process.exit(1); }

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' };
const resolveFile = (p) => {
  const clean = decodeURIComponent(p.split('?')[0].split('#')[0]);
  for (const c of [clean, join(clean, 'index.html'), `${clean}.html`]) { const f = join(DIST, c); if (existsSync(f) && statSync(f).isFile()) return f; }
};
const server = createServer((req, res) => {
  const f = resolveFile(req.url);
  const file = f ?? join(DIST, '404.html');
  res.writeHead(f ? 200 : 404, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const only = process.argv[2];
const paths = walk(DIST).filter((f) => f.endsWith('.html')).map((f) => '/' + f.slice(DIST.length + 1).replace(/index\.html$/, '').replace(/\.html$/, '')).sort().filter((p) => !only || p === only);

const viewports = [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }];
const browser = await launchChromium();
let problems = 0;
const warn = (m) => { console.warn(`  ! ${m}`); problems++; };

for (const p of paths) {
  const slug = p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '_').replace(/\.html$/, '');
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => warn(`errore JS in ${p}: ${e.message}`));
    page.on('response', (r) => { const u = new URL(r.url()); if (u.origin === BASE && r.status() >= 400 && p !== '/404.html') warn(`${r.status()} ${u.pathname} (da ${p})`); });
    await page.goto(BASE + p, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('in')));
    await page.waitForTimeout(900);   // fine della transizione di reveal
    await page.screenshot({ path: join(OUT, `${slug}-${vp.name}.png`), fullPage: true });
    console.log(`  ✓ ${p} @ ${vp.name} → qa/${slug}-${vp.name}.png`);
    if (vp.name === 'desktop') {
      const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
      for (const href of new Set(hrefs)) {
        if (!href || /^(https?:|\/\/|mailto:|tel:|#)/.test(href)) continue;
        if (!resolveFile(href)) warn(`link rotto in ${p}: ${href}`);
      }
      const horizontal = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      if (horizontal) warn(`scroll orizzontale in ${p} (desktop)`);
    } else {
      const horizontal = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      if (horizontal) warn(`scroll orizzontale in ${p} (mobile)`);
    }
    await ctx.close();
  }
}
await browser.close();
server.close();

console.log(`\nScreenshot in qa/. Problemi visivi/link: ${problems}.`);
const seo = spawnSync('node', [join(ROOT, 'tools', 'validate-seo.mjs'), DIST], { stdio: 'inherit', env: process.env });
if (problems > 0 || seo.status !== 0) process.exitCode = 2;
