/**
 * Percorsi statici del blog per una lingua (indice + articoli) con le traduzioni di ciascun articolo.
 * Lingua principale: indice sempre generato se `collections.posts` è attivo; altre lingue: solo se hanno articoli.
 */
import { getPosts, getSettings } from './content';
import type { Post } from './content';
import { blogPath, postPath } from './seo/url';
import { keyOf, langOf, localePrefix, siteLocales } from './i18n';

export async function blogPaths(lang: string) {
  const s = await getSettings();
  if (!s.collections.posts) return [];
  const all = await getPosts();
  const posts = all.filter((p) => langOf(s, p) === lang);
  if (lang !== s.lang && !posts.length) return [];
  const pathOf = (p: Post) => postPath(p.slug, localePrefix(s, langOf(s, p)));
  const indexAlternates = siteLocales(s)
    .filter((l) => l === s.lang || all.some((p) => langOf(s, p) === l))
    .map((l) => ({ lang: l, path: blogPath(localePrefix(s, l)) }));
  return [
    { params: { slug: undefined }, props: { lang, post: undefined, posts, alternates: indexAlternates } },
    ...posts.map((post) => ({
      params: { slug: post.slug },
      props: { lang, post, posts, alternates: all.filter((x) => keyOf(x) === keyOf(post) && !x.seo.noindex).map((x) => ({ lang: langOf(s, x), path: pathOf(x) }))
        .sort((a, b) => siteLocales(s).indexOf(a.lang) - siteLocales(s).indexOf(b.lang)) },
    })),
  ];
}
