// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* Stage: `staging` (default di `npm run dev`/build:staging) o `production` (default).
   In produzione NON esistono né editor.js né la password dell'editor (vedi tools/check-prod-clean.mjs). */
const STAGE = process.env.PUBLIC_STAGE === 'staging' ? 'staging' : 'production';
const CONTENT_DIR = process.env.CONTENT_DIR ?? './src/content';

/** `site` = URL di produzione, letto da settings/site.json (la config non può usare la content API). */
function readSiteUrl() {
  try {
    return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, 'settings', 'site.json'), 'utf8')).url;
  } catch { return undefined; }
}
const siteUrl = readSiteUrl();

/** Copia l'editor mockup in dist SOLO nelle build di staging. */
const stagingEditor = () => ({
  name: 'adabu-staging-editor',
  hooks: {
    'astro:build:done': ({ dir }) => {
      if (STAGE !== 'staging') return;
      const out = path.join(fileURLToPath(dir), 'assets', 'js');
      fs.mkdirSync(out, { recursive: true });
      fs.copyFileSync('src/editor/editor.js', path.join(out, 'editor.js'));
    },
  },
});

export default defineConfig({
  site: siteUrl && !siteUrl.includes('{{') ? siteUrl : undefined,
  output: 'static',
  outDir: process.env.OUT_DIR ?? './dist',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [stagingEditor()],
  vite: { define: { 'import.meta.env.PUBLIC_STAGE': JSON.stringify(STAGE) } },
});
