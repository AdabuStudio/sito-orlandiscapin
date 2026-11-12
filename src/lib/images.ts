/** Risoluzione dei nomi immagine (src/assets/images/ oppure examples/<nome>/images/) → metadata astro:assets. */
import { getImage } from 'astro:assets';

const files = import.meta.glob<{ default: ImageMetadata }>(
  ['/src/assets/images/**/*.{jpg,jpeg,png,webp,avif,gif}', '/examples/**/images/**/*.{jpg,jpeg,png,webp,avif,gif}'],
  { eager: true },
);

export const isUrlLike = (s: string) => /^(https?:)?\/\//.test(s) || s.startsWith('/');

export function findImage(name: string): ImageMetadata | undefined {
  const key = Object.keys(files).find((k) => k.endsWith(`/images/${name}`));
  return key ? files[key].default : undefined;
}

/** URL (root-relative) di un'immagine per og:image: 1200×630 JPG ottimizzato se è un asset, altrimenti il path dato. */
export async function ogImagePath(name: string): Promise<string> {
  const meta = findImage(name);
  if (meta) return (await getImage({ src: meta, width: 1200, height: 630, format: 'jpg', fit: 'cover' })).src;
  return isUrlLike(name) ? name : `/assets/img/${name}`;
}
