/**
 * Lingue del sito e testi fissi dell'interfaccia (quelli che non stanno nei contenuti).
 *
 * - Lingua principale = `settings.lang` (URL senza prefisso); altre lingue = `settings.locales` (URL `/<lingua>/…`).
 * - Per una lingua nuova: aggiungi qui il suo blocco di testi copiando `en`. Se manca, si usa `en` (avviso in build).
 * - Nessun testo di un cliente qui: solo etichette generiche dell'interfaccia.
 */
import type { Settings } from './content/schema';

const it = {
  skipLink: 'Salta al contenuto',
  navMain: 'Navigazione principale',
  navFooter: 'Navigazione footer',
  menuOpen: 'Apri menu',
  language: 'Lingua',
  privacy: 'Privacy',
  cookiePolicy: 'Cookie policy',
  vat: 'P.IVA',
  rights: 'Tutti i diritti riservati.',
  cookieAria: 'Avviso cookie',
  cookieText: 'Usiamo solo cookie tecnici necessari al funzionamento del sito:',
  cookieStrong: 'nessun cookie di profilazione',
  cookieMore: 'Dettagli nella',
  cookieOk: 'Ho capito',
  notFoundTitle: 'Pagina non trovata',
  notFoundDesc: 'La pagina che cerchi non esiste.',
  notFoundText: 'Il link potrebbe essere errato o la pagina è stata spostata.',
  notFoundBack: 'Torna alla home',
  privacyTitle: 'Privacy e cookie',
  privacyDesc: 'Informativa privacy e cookie di',
  privacyIubenda: "L'informativa completa è gestita con iubenda:",
  privacyTechnical: 'Questo sito usa solo cookie tecnici necessari al funzionamento: nessun cookie di profilazione e nessun tracciamento.',
  privacyController: 'Titolare del trattamento',
  privacyPlaceholder: "Testo informativo generico: va sostituito con un'informativa validata prima del lancio (checklist pre-lancio).",
  blog: 'Blog',
  blogDesc: 'Novità e approfondimenti di',
  updatedOn: 'aggiornato il',
  inShort: 'In breve',
  faq: 'Domande frequenti',
  contactEmail: 'Email',
  contactPhone: 'Telefono',
  contactWhere: 'Dove',
  directions: 'Indicazioni',
  details: 'Dettagli',
  map: 'Mappa',
  formName: 'Nome e cognome',
  formEmail: 'Email',
  formPhone: 'Telefono',
  formMessage: 'Messaggio',
  formOptional: 'facoltativo',
  formConsentBefore: 'Ho letto la',
  formConsentAfter: 'e acconsento al trattamento dei dati per ricevere una risposta.',
  formSend: 'Invia',
  formSending: 'Invio in corso…',
  formOk: 'Grazie! Ti risponderemo al più presto.',
  formTest: 'Anteprima: il messaggio è valido ma non è stato inviato (modalità prova).',
  formInvalid: 'Controlla i campi obbligatori e riprova.',
  formError: 'Invio non riuscito. Riprova tra poco o scrivici via email.',
  formBack: 'Torna al sito',
};
export type Strings = typeof it;

const en: Strings = {
  skipLink: 'Skip to content',
  navMain: 'Main navigation',
  navFooter: 'Footer navigation',
  menuOpen: 'Open menu',
  language: 'Language',
  privacy: 'Privacy',
  cookiePolicy: 'Cookie policy',
  vat: 'VAT',
  rights: 'All rights reserved.',
  cookieAria: 'Cookie notice',
  cookieText: 'We only use technical cookies needed for the site to work:',
  cookieStrong: 'no profiling cookies',
  cookieMore: 'Details in the',
  cookieOk: 'Got it',
  notFoundTitle: 'Page not found',
  notFoundDesc: 'The page you are looking for does not exist.',
  notFoundText: 'The link may be wrong or the page may have moved.',
  notFoundBack: 'Back to home',
  privacyTitle: 'Privacy and cookies',
  privacyDesc: 'Privacy and cookie policy of',
  privacyIubenda: 'The full policy is managed with iubenda:',
  privacyTechnical: 'This site only uses technical cookies needed for it to work: no profiling cookies and no tracking.',
  privacyController: 'Data controller',
  privacyPlaceholder: 'Generic text: replace it with a validated policy before launch (pre-launch checklist).',
  blog: 'Blog',
  blogDesc: 'News and insights from',
  updatedOn: 'updated on',
  inShort: 'In short',
  faq: 'Frequently asked questions',
  contactEmail: 'Email',
  contactPhone: 'Phone',
  contactWhere: 'Address',
  directions: 'Directions',
  details: 'Details',
  map: 'Map',
  formName: 'Full name',
  formEmail: 'Email',
  formPhone: 'Phone',
  formMessage: 'Message',
  formOptional: 'optional',
  formConsentBefore: 'I have read the',
  formConsentAfter: 'and agree to the processing of my data in order to receive a reply.',
  formSend: 'Send',
  formSending: 'Sending…',
  formOk: 'Thank you! We will get back to you soon.',
  formTest: 'Preview: the message is valid but was not sent (test mode).',
  formInvalid: 'Please check the required fields and try again.',
  formError: 'Sending failed. Please try again shortly or email us.',
  formBack: 'Back to the site',
};

const STRINGS: Record<string, Strings> = { it, en };
const warned = new Set<string>();

/** Testi dell'interfaccia nella lingua richiesta (fallback: inglese). */
export function t(lang = 'it'): Strings {
  const base = lang.toLowerCase().split('-')[0];
  if (STRINGS[base]) return STRINGS[base];
  if (!warned.has(base)) { warned.add(base); console.warn(`[i18n] Nessun testo per "${base}" in src/lib/i18n.ts: uso l'inglese.`); }
  return en;
}

/** Tutte le lingue del sito, la principale per prima. */
export const siteLocales = (s: Settings): string[] => [s.lang, ...s.locales.filter((l) => l !== s.lang)];
export const isMultilingual = (s: Settings) => siteLocales(s).length > 1;
/** Prefisso URL della lingua: '' per la principale, '/en' per le altre. */
export const localePrefix = (s: Settings, lang: string) => (lang === s.lang ? '' : `/${lang}`);
/** Lingua di una voce di contenuto (assente = principale). */
export const langOf = (s: Settings, item: { lang?: string }) => item.lang ?? s.lang;
/** Chiave che collega le traduzioni (default = slug). */
export const keyOf = (item: { translationKey?: string; slug: string }) => item.translationKey ?? item.slug;
/** Nome di una lingua scritto nella lingua stessa (es. "English", "italiano"). */
export const languageName = (lang: string) => {
  try { const n = new Intl.DisplayNames([lang], { type: 'language' }).of(lang); return n ? n.charAt(0).toUpperCase() + n.slice(1) : lang; }
  catch { return lang; }
};
/** Settings con i testi tradotti della lingua (tagline, headerCta). */
export const localizedSettings = (s: Settings, lang: string): Settings => (lang === s.lang ? s : { ...s, ...(s.translations[lang] ?? {}) });
/** Percorso della privacy nella lingua. */
export const privacyPath = (s: Settings, lang: string) => `${localePrefix(s, lang)}/privacy/`;
