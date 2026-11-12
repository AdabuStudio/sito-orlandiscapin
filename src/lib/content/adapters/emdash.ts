/**
 * Adattatore LIVELLO 2 (`emdash`) — SOLO SCHELETRO. Non implementato in v2.
 *
 * Mappatura prevista (EmDash = CMS Cloudflare su Astro, dati su D1, media su R2):
 *   getSettings()           → getEmDashEntry('settings', 'site')
 *   getPages()/getPage()    → getEmDashCollection('pages') / getEmDashEntry('pages', slug)
 *   getPosts()              → getEmDashCollection('posts'); `body` = HTML già renderizzato
 *                             (portable text → html) per restare identico all'adattatore `files`
 *   getCollectionItems(n)   → getEmDashCollection(n)
 * Gli schemi dei campi sono QUELLI di ../schema.ts: il seed EmDash si deriva da lì
 * (collezioni e campi con gli stessi nomi) e i JSON esistenti si importano as-is.
 * Passare da `static` a `emdash` = cambiare `settings.tier`, implementare questo file,
 * importare i JSON. Nessun componente da riscrivere.
 */
import type { ContentAdapter } from './types';

const nope = (): never => { throw new Error('Adattatore EmDash non implementato (tier "emdash"): vedi src/lib/content/adapters/emdash.ts'); };

export const emdashAdapter: ContentAdapter = {
  getSettings: nope, getPage: nope, getPages: nope, getPosts: nope, getCollectionItems: nope,
};
