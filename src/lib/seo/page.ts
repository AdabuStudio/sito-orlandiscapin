import { getCollectionItems, getSettings } from '../content';
import type { Page } from '../content';
import { breadcrumb, event, faqPage, locationBusiness, organization, website } from './schema';
import { localePrefix } from '../i18n';

/** JSON-LD di una pagina: Organization/WebSite in home (di ogni lingua), Breadcrumb altrove, FAQPage e Event dove servono. */
export async function pageJsonLd(page: Page, lang?: string, path?: string): Promise<Record<string, unknown>[]> {
  const s = await getSettings();
  lang ??= s.lang;
  const home = `${localePrefix(s, lang)}/`;
  const out: Record<string, unknown>[] = [];
  if (page.slug === 'index') {
    out.push(organization(s), website(s, lang, home));
    if (s.collections.locations) for (const l of await getCollectionItems('locations', { lang })) out.push(locationBusiness(s, l));
  } else {
    out.push(breadcrumb(s, [{ name: s.name, path: home }, { name: page.title, path: path ?? home }]));
  }
  const faqs = [...(page.geo?.faq ?? []), ...page.sections.flatMap((x) => (x.type === 'faq' ? x.items : []))];
  if (faqs.length) out.push(faqPage(faqs));
  if (page.sections.some((x) => x.type === 'events')) for (const e of await getCollectionItems('events', { lang })) out.push(event(s, e));
  return out;
}
