/**
 * Modulo contatti: POST /api/contact → email al cliente con Cloudflare Email Service (binding `EMAIL`).
 * Zero dipendenze, testato da tools/check-contact.mjs.
 *
 * Variabili del Worker (wrangler.jsonc → "vars"; secret con `wrangler secret put`):
 *   CONTACT_TO            destinatari (uno o più, separati da virgola). Vuoto = modulo non configurato (503).
 *   CONTACT_FROM          mittente su un dominio abilitato a Email Sending (es. noreply@<dominio>).
 *   CONTACT_FROM_NAME     nome del mittente (facoltativo, default "Sito web").
 *   CONTACT_SUBJECT       oggetto (facoltativo, default "Nuovo messaggio dal sito").
 *   CONTACT_DRY_RUN = "1" anteprime: valida tutto ma NON invia (impostato nel blocco `previews`).
 *   TURNSTILE_SECRET_KEY  (secret, facoltativo) attiva la verifica antispam Turnstile.
 *
 * Antispam sempre attivo: campo nascosto "company" (honeypot) e invio troppo veloce (< 3 s dal caricamento, misurato
 * nel browser in `elapsed`: niente problemi di orologi sballati): risposta di successo finta, nessuna email. Solo richieste dallo stesso sito (header Origin).
 */

const MAX_BODY = 32 * 1024;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

const TEXTS = {
  it: { ok: 'Grazie! Ti risponderemo al più presto.', test: 'Anteprima: messaggio valido, non inviato (modalità prova).', invalid: 'Controlla i campi obbligatori e riprova.', error: 'Invio non riuscito. Riprova tra poco.', back: 'Torna al sito' },
  en: { ok: 'Thank you! We will get back to you soon.', test: 'Preview: valid message, not sent (test mode).', invalid: 'Please check the required fields and try again.', error: 'Sending failed. Please try again shortly.', back: 'Back to the site' },
};
const texts = (lang) => TEXTS[String(lang || '').slice(0, 2)] ?? TEXTS.en;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clean = (v, max) => String(v ?? '').replace(/\r\n?/g, '\n').trim().slice(0, max);

/** Risposta JSON (fetch dal sito) oppure piccola pagina HTML (invio senza JavaScript). */
function reply(request, status, body, lang, back) {
  if ((request.headers.get('accept') || '').includes('application/json')) return Response.json(body, { status });
  const t = texts(lang);
  const msg = body.ok ? (body.dryRun ? t.test : t.ok) : body.error === 'invalid' ? t.invalid : t.error;
  const href = back && back.startsWith('/') && !back.startsWith('//') ? back : '/';
  const html = `<!doctype html><html lang="${esc(lang || 'it')}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(msg)}</title></head>`
    + `<body style="font-family:system-ui,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1rem;line-height:1.5"><p>${esc(msg)}</p><p><a href="${esc(href)}">${esc(t.back)}</a></p></body></html>`;
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

async function verifyTurnstile(secret, token, ip) {
  if (!token || token.length > 2048) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip || '' }),
      signal: AbortSignal.timeout(10_000),
    });
    return r.ok && (await r.json()).success === true;
  } catch { return false; }
}

/** @param {Request} request @param {Record<string, any>} env */
export async function handleContact(request, env) {
  const url = new URL(request.url);
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });

  // Solo dallo stesso sito (produzione o anteprima che sia).
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return reply(request, 403, { ok: false, error: 'forbidden' });

  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) return reply(request, 413, { ok: false, error: 'too-large' });
  let form;
  try { form = await request.formData(); } catch { return reply(request, 400, { ok: false, error: 'invalid' }); }

  const lang = clean(form.get('lang'), 10);
  const page = clean(form.get('page'), 300);
  const data = {
    name: clean(form.get('name'), 120),
    email: clean(form.get('email'), 254),
    phone: clean(form.get('phone'), 40),
    message: clean(form.get('message'), 5000),
  };
  const consent = ['on', '1', 'true', 'yes'].includes(String(form.get('consent') ?? '').toLowerCase());

  // Antispam: honeypot compilato o invio in meno di 3 secondi → finto successo, nessuna email.
  const elapsed = Number(form.get('elapsed') || 0);
  if (clean(form.get('company'), 200) || (elapsed > 0 && elapsed < 3000)) return reply(request, 200, { ok: true }, lang, page);

  const fields = [];
  if (!data.name) fields.push('name');
  if (!EMAIL_RE.test(data.email)) fields.push('email');
  if (!data.message) fields.push('message');
  if (!consent) fields.push('consent');
  if (fields.length) return reply(request, 400, { ok: false, error: 'invalid', fields }, lang, page);

  if (env.TURNSTILE_SECRET_KEY) {
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, String(form.get('cf-turnstile-response') ?? ''), request.headers.get('cf-connecting-ip'));
    if (!ok) return reply(request, 403, { ok: false, error: 'captcha' }, lang, page);
  }

  // Anteprime: tutto validato, nessun invio.
  if (env.CONTACT_DRY_RUN === '1') {
    console.log('[contact] dry-run: messaggio valido, non inviato');
    return reply(request, 200, { ok: true, dryRun: true }, lang, page);
  }

  const to = String(env.CONTACT_TO || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!to.length || !env.CONTACT_FROM || !env.EMAIL) {
    console.error('[contact] modulo non configurato: servono CONTACT_TO, CONTACT_FROM e il binding send_email "EMAIL"');
    return reply(request, 503, { ok: false, error: 'not-configured' }, lang, page);
  }

  const rows = [['Nome', data.name], ['Email', data.email], ['Telefono', data.phone], ['Pagina', page ? `${url.origin}${page}` : ''], ['Lingua', lang]].filter(([, v]) => v);
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nMessaggio:\n${data.message}\n`;
  const html = `<table>${rows.map(([k, v]) => `<tr><th align="left" style="padding-right:1em">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>`
    + `<p><strong>Messaggio</strong></p><p>${esc(data.message).replace(/\n/g, '<br>')}</p>`;
  try {
    await env.EMAIL.send({
      to,
      from: { email: env.CONTACT_FROM, name: env.CONTACT_FROM_NAME || 'Sito web' },
      replyTo: data.email,
      subject: `${env.CONTACT_SUBJECT || 'Nuovo messaggio dal sito'} — ${data.name}`,
      text,
      html,
    });
  } catch (e) {
    console.error('[contact] invio fallito:', e && (e.code || e.message));
    return reply(request, 502, { ok: false, error: 'send-failed' }, lang, page);
  }
  return reply(request, 200, { ok: true }, lang, page);
}
