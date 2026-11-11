# Contratto contenuti SEO/GEO (con GRIP 2)

Identico in **tutti** i siti. Fonte unica: `src/lib/content/schema.ts` (`seoSchema`, `geoSchema`, `postSchema`, `pageSchema`).
Chi produce contenuti (umani o **GRIP 2**) deve rispettare campi, tipi e limiti: la build li valida con zod e fallisce sugli errori.
Date: ISO 8601 con orario e offset espliciti (`2026-10-11T23:59:59+02:00`). Immagini: nome file in `src/assets/images/` o URL.

## `seo` (ogni pagina e ogni post)
| Campo | Tipo | Limite | Default |
|---|---|---|---|
| `metaTitle` | string, opz. | ≤ 70 | `title — nome sito` (home: `nome — tagline`) |
| `metaDescription` | string, opz. | ≤ 160 | description della pagina / tagline |
| `ogTitle` | string, opz. | ≤ 95 | `metaTitle` |
| `ogDescription` | string, opz. | ≤ 200 | `metaDescription` |
| `ogImage` | string, opz. | — | cover del post o `settings.ogImage` o `/assets/img/og-image.jpg` (per gli asset: 1200×630 JPG generato) |
| `canonical` | URL, opz. | — | URL della pagina su `settings.url` |
| `noindex` | boolean | — | `false` (escluso da sitemap/llms.txt se `true`) |

## `geo` (post e pagine principali)
| Campo | Tipo | Note |
|---|---|---|
| `summary` | string ≤ 400 | TL;DR 2–3 frasi; finisce in `llms.txt` e nel riquadro "In breve" |
| `faq` | `[{q, a}]` | genera `FAQPage` JSON-LD e la sezione FAQ del post |
| `keyFacts` | `string[]` | fatti verificabili, uno per riga |
| `author` | string | autore mostrato e nel JSON-LD |
| `reviewedAt` | ISO datetime | ultima revisione dei fatti |

## Post (`src/content/posts/<slug>.md`)
Frontmatter: `title`, `slug` (kebab-case), `date`, `updated?`, `author`, `cover?`, `coverAlt?`, `excerpt` (≤ 300), `draft` (default false), `seo`, `geo`. Corpo in Markdown.
Visibili solo se non bozza e con `date` non futura (in staging anche le bozze). Esempio completo: `examples/local-business/content/posts/` (nel ramo `v2-astro-riferimento` e nei repo cliente dopo lo scaffold).

## Contenuti a scadenza (`notices`, `events`)
`validFrom`/`validUntil` ISO con offset. Filtrati al **build**; con `settings.scheduledRebuild: true` il workflow giornaliero (05:00 UTC) ricostruisce.

## Cosa genera il template da questi campi
canonical e `og:*` per pagina · JSON-LD (`Organization`/`LocalBusiness` con sottotipo, `WebSite`, `BreadcrumbList`, `BlogPosting`, `FAQPage`, `LocalBusiness` per ogni sede, `Event`) · `sitemap.xml` · `robots.txt` (staging: `Disallow: /`) · `llms.txt`.
