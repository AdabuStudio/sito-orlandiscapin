/**
 * Codice del Worker: gira SOLO per /api/* (wrangler.jsonc → assets.run_worker_first). Tutto il resto del sito sono
 * file statici serviti direttamente da Cloudflare, senza invocare questo codice.
 */
import { handleContact } from './contact.js';

export default {
  /** @param {Request} request @param {Record<string, any>} env */
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/contact' || pathname === '/api/contact/') return handleContact(request, env);
    return new Response('Not found', { status: 404 });
  },
};
