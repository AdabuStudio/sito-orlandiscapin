# Rifare un sito esistente col template v2 — senza casino

Vale per tre casi. Il principio è sempre lo stesso: **il sito vecchio resta online e intatto finché il nuovo non è verificato**.
Non si converte il repo vecchio: si fa un repo nuovo e alla fine si sposta il dominio. Se qualcosa va storto si torna indietro in un minuto.

| Caso | Come lo riconosci | Cosa fare |
|---|---|---|
| **A. Sito v1 Adabù** | repo con `build.js` + `site.config.json`, su Cloudflare Pages (es. asolo100km) | §1 → §5 |
| **B. Sito esterno** | WordPress, Wix, altro hosting: nessun repo Adabù | §1 → §5 (differenze segnate con **B**) |
| **C. Sito v2 già fatto** | repo con `template.json` `"engine": "astro"` | solo §6 (aggiornamento, niente rifacimento) |

## 1. Decisione (Federico, 1 minuto)
Un sito esistente passa al v2 **solo se lo chiedi tu per quel sito e confermi**. L'agente non lo propone né lo fa da solo.
La conferma finisce in `00_PROTOCOL/DECISIONS.md` del repo nuovo.

## 2. Preparazione (Federico o Damiano, ~15 minuti)
- [ ] **Inventario del vecchio** (lo può fare Claude in sola lettura): elenco degli URL (`/sitemap.xml` del sito vecchio), moduli,
      numeri di telefono/WhatsApp, script di tracciamento, file scaricabili (PDF, listini), pagine che portano traffico.
- [ ] **DNS su Cloudflare.** I Worker funzionano solo con i nameserver su Cloudflare. **B**: se il dominio è altrove, si spostano
      prima, ricopiando **tutti** i record (MX, SPF, DKIM, DMARC, TXT di verifica, sottodomini): altrimenti si rompe la posta.
- [ ] **Repo, Worker e token nuovi**: `docs/ONBOARDING-CLIENTE.md` passi 1–4. Il nome del Worker può essere già occupato dal
      progetto Pages vecchio: in quel caso usa `<slug>-web`.
- [ ] Repo vecchio: **non si tocca**. Serve solo da fonte in lettura.

## 3. Costruzione (Claude, nel repo nuovo)
Apri Claude Code **sul repo nuovo** e scrivi:
> rifai il sito `<dominio>` col template v2. Sito vecchio: `https://<dominio>`. Repo vecchio in sola lettura: `AdabuStudio/<repo-vecchio>` (solo caso A).

La skill `new-client-site` parte come **Tipo 2 (redesign)**: stessa struttura e contenuti, veste nuova (regola madre).
Tipo 3 se cambiano anche struttura e pagine; Tipo 1 solo se il cliente vuole il sito identico.
Cosa fa in più rispetto a un sito nuovo:
- **A**: porta i contenuti da `site.config.json` a `src/content/` (`site`+`design` → `settings/site.json`; ogni `pages[]` →
  `pages/<slug>.json`, i blocchi hanno gli stessi nomi; `nav` → `nav`/`order`), immagini da `src/assets/img/` a `src/assets/images/`,
  `custom_data/` → `public/`.
- **B**: prende testi e immagini dal sito online.
- **Più lingue**: le pagine in altre lingue vanno in `src/content/pages/<lingua>/` (`--lingue=en`); i vecchi URL di ogni lingua
  finiscono nei redirect come gli altri.
- **Modulo contatti con invio dal server** (al posto di un form PHP/WordPress o di un servizio esterno): blocco `contact-form`
  (`--contatti=<email>`); per l'invio vero serve il dominio abilitato a Email Sending (`docs/ONBOARDING-CLIENTE.md`).
- **Redirect**: per ogni URL vecchio che cambia scrive una riga in `public/_redirects` (es. `/chi-siamo.html /chi-siamo/ 301`).
  Massimo 2.000 righe: per un sito vetrina bastano sempre.
- Si ferma al gate **direzione grafica**; poi pubblica l'anteprima `staging`.

## 4. Verifica prima del cambio (Federico + cliente)
- [ ] Anteprima `https://staging-<slug>.<sottodominio>.workers.dev` approvata dal cliente.
- [ ] **Nessun URL perso**: chiedi a Claude *"controlla che tutti gli URL della vecchia sitemap rispondano sull'anteprima"*
      (devono dare 200 o un 301 verso la pagina giusta).
- [ ] Moduli, telefono, mappe, file scaricabili funzionano; tracciamento (iubenda/GTM) configurato.
- [ ] Checklist pre-lancio di `docs/SITE-RULES.md`.

## 5. Cambio di dominio (cutover) — ~15 minuti, in un orario tranquillo
Cloudflare non collega il dominio al Worker finché esiste il vecchio record DNS: tra il passo 2 e il 3 il sito è **offline per qualche minuto**.
1. **Produzione**: merge `staging` → `main`. Il sito nuovo è online sul Worker, ancora senza dominio.
2. **Stacca il vecchio**:
   - **A** (Pages): progetto Pages → **Custom domains** → rimuovi `www.<dominio>` (e l'apex). In **DNS** controlla che il CNAME
     verso `<progetto>.pages.dev` sia sparito; se c'è ancora, cancellalo.
   - **B**: in **DNS** cancella solo il record (A o CNAME) di `www`/apex che punta al vecchio hosting. **Non toccare** MX e TXT.
3. **Attacca il nuovo**: Worker → **Domains → Add → Custom Domain** → `www.<dominio>`. Per l'altra variante (apex ↔ www)
   aggiungi l'apex come secondo Custom Domain oppure una regola di redirect.
4. **Prova subito**: home, 2–3 pagine, un vecchio URL (deve fare 301), un modulo.

**Se qualcosa non va, torna indietro**: togli il Custom Domain dal Worker e rimetti il dominio sul progetto Pages (**B**: ripristina
il record DNS di prima). Il sito vecchio è ancora lì, identico.

### Dopo il cambio
- Search Console: invia la nuova `sitemap.xml`; per 2 settimane controlla gli errori 404 e aggiungi i redirect mancanti.
- Sharing Debugger / LinkedIn Inspector per rigenerare le anteprime social.
- **Dopo 30 giorni senza problemi** (non prima): archivia il repo vecchio (GitHub → Settings → Archive) e cancella il progetto Pages
  (**B**: disdici il vecchio hosting, ma tieni il dominio e la posta).
- Claude aggiorna la pagina *Rilasci* della roadmap ClickUp.

## 6. Caso C — aggiornare un sito v2 al template nuovo
Non si rifà niente. I repo cliente non si aggiornano da soli: si portano solo i file cambiati.
1. Leggi in `CHANGELOG.md` del template le versioni successive a quella in `template.json` del sito, sezione *Repo cliente già creati*.
2. Nel repo del sito chiedi a Claude: *"aggiorna questo sito al template `<versione>`"*. Copia i file elencati, lancia `npm test`,
   apre una PR draft. Contenuti e grafica del sito non si toccano.
3. Merge dopo aver controllato l'anteprima del ramo.
