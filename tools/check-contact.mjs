#!/usr/bin/env node
/** Test del modulo contatti (worker/contact.js) con richieste finte: nessuna rete, nessuna email vera. */
import { handleContact } from '../worker/contact.js';

const ORIGIN = 'https://www.esempio.test';
const good = { name: 'Mario Rossi', email: 'mario@esempio.test', phone: '+39 333 0000000', message: 'Vorrei informazioni.\nGrazie', consent: 'on', lang: 'it', page: '/contatti/', elapsed: '8000' };
const req = (fields, { json = true, origin = ORIGIN, method = 'POST' } = {}) => {
  const body = new URLSearchParams(fields);
  return new Request(`${ORIGIN}/api/contact`, {
    method, body: method === 'POST' ? body : undefined,
    headers: { ...(json ? { accept: 'application/json' } : {}), ...(origin ? { origin } : {}) },
  });
};
const mailer = () => { const sent = []; return { sent, send: async (m) => { sent.push(m); return { messageId: 'x' }; } }; };
const env = (extra = {}) => ({ CONTACT_TO: 'cliente@esempio.test, altro@esempio.test', CONTACT_FROM: 'noreply@esempio.test', EMAIL: mailer(), ...extra });

const checks = [];
const check = (name, ok) => checks.push([name, ok]);

let e = env(), r = await handleContact(req(good), e), d = await r.json();
check('invio valido → 200, una email ai 2 destinatari con replyTo del visitatore',
  r.status === 200 && d.ok && e.EMAIL.sent.length === 1 && e.EMAIL.sent[0].to.length === 2 && e.EMAIL.sent[0].replyTo === good.email && /Mario Rossi/.test(e.EMAIL.sent[0].subject));
check('email con testo e HTML escapato', /Messaggio:\nVorrei informazioni/.test(e.EMAIL.sent[0].text) && !/<script/.test((await (async () => { const x = env(); await handleContact(req({ ...good, message: '<script>alert(1)</script>' }), x); return x.EMAIL.sent[0].html; })())));

r = await handleContact(req({ ...good, email: 'non-una-email' }), (e = env())); d = await r.json();
check('email non valida → 400 con il campo indicato, nessun invio', r.status === 400 && d.fields.includes('email') && !e.EMAIL.sent.length);
r = await handleContact(req({ ...good, consent: '' }), (e = env())); d = await r.json();
check('senza consenso privacy → 400', r.status === 400 && d.fields.includes('consent') && !e.EMAIL.sent.length);
r = await handleContact(req({ ...good, company: 'Spam Srl' }), (e = env())); d = await r.json();
check('honeypot compilato → finto successo, nessun invio', r.status === 200 && d.ok && !e.EMAIL.sent.length);
r = await handleContact(req({ ...good, elapsed: '900' }), (e = env())); d = await r.json();
check('inviato in meno di 3 s → finto successo, nessun invio', r.status === 200 && d.ok && !e.EMAIL.sent.length);
r = await handleContact(req(good), (e = env({ CONTACT_DRY_RUN: '1' }))); d = await r.json();
check('anteprima (CONTACT_DRY_RUN) → ok in modalità prova, nessun invio', r.status === 200 && d.dryRun === true && !e.EMAIL.sent.length);
r = await handleContact(req(good), { CONTACT_DRY_RUN: '1' }); d = await r.json();
check('anteprima senza configurazione email → funziona lo stesso', r.status === 200 && d.dryRun === true);
r = await handleContact(req(good), { CONTACT_TO: '', CONTACT_FROM: '' });
check('modulo non configurato → 503', r.status === 503);
r = await handleContact(req(good, { origin: 'https://altro-sito.test' }), (e = env()));
check('richiesta da un altro sito → 403, nessun invio', r.status === 403 && !e.EMAIL.sent.length);
r = await handleContact(req(good, { method: 'GET' }), env());
check('GET → 405', r.status === 405);
r = await handleContact(req(good, { json: false }), (e = env()));
check('senza JavaScript → pagina HTML di conferma con link al sito', r.status === 200 && /text\/html/.test(r.headers.get('content-type')) && /href="\/contatti\/"/.test(await r.text()));
e = env({ EMAIL: { send: async () => { throw Object.assign(new Error('x'), { code: 'E_SENDER_NOT_VERIFIED' }); } } });
r = await handleContact(req(good), e);
check('errore di Email Service → 502', r.status === 502);

// Turnstile: senza token → 403 (nessuna chiamata di rete); con token valido (fetch finto) → invio.
r = await handleContact(req(good), (e = env({ TURNSTILE_SECRET_KEY: 'segreto' })));
check('Turnstile attivo e token assente → 403', r.status === 403 && !e.EMAIL.sent.length);
const realFetch = globalThis.fetch;
globalThis.fetch = async () => new Response(JSON.stringify({ success: true }), { headers: { 'content-type': 'application/json' } });
r = await handleContact(req({ ...good, 'cf-turnstile-response': 'token-ok' }), (e = env({ TURNSTILE_SECRET_KEY: 'segreto' })));
globalThis.fetch = realFetch;
check('Turnstile attivo e token valido → invio', r.status === 200 && e.EMAIL.sent.length === 1);

let fail = 0;
for (const [n, ok] of checks) { console.log(`${ok ? '✓' : '✗'} ${n}`); if (!ok) fail++; }
process.exit(fail ? 1 : 0);
