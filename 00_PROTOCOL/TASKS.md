# Tasks

## Da confermare con il cliente (prima del go-live)
- [ ] Galleria Lavori: escluse 3 foto "prima/durante i lavori"; rimetterle solo se il cliente vuole un prima/dopo.
- [ ] Righe descrittive degli 8 servizi (il sito vecchio aveva solo i nomi).
- [ ] Numeri dello studio: "100% clienti soddisfatti" va tenuto? (affermazione non verificabile).
- [ ] La foto `FOTO UFFICI` (sezione Team) è la sede dello studio? Se sì, alt e didascalia da aggiornare.
- [ ] Ragione sociale esatta per footer e privacy (ora: nome + P.IVA IT04782910267).

## Go-live
- [ ] Tracciamento/cookie: iubenda (o privacy del template) e GTM se servono.
- [ ] DNS di orlandiscapin.it su Cloudflare (ricopiare MX/SPF/DKIM) e Email Sending sul dominio per il modulo.
- [ ] Merge `staging` → `main`, Custom Domain sul Worker, vecchio Horizons staccato (docs/MIGRAZIONE.md §5).
- [ ] Search Console + sitemap.

## Tecnico
- [ ] Riportare il fix `fileURLToPath` di `astro.config.mjs` sul ramo `v2-astro-riferimento` del template (e su Orostyle).
