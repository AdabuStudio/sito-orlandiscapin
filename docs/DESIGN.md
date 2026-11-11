# DESIGN — Orlandi & Scapin Studio Tecnico

> Stato: **PROPOSTA — GATE 1 da approvare** (Federico). Finché non è approvata non si costruisce la grafica.

## Brief in una riga
Studio tecnico di progettazione a Castelfranco Veneto (TV) per privati che costruiscono o ristrutturano casa: la home deve
far vedere **case vere fatte dallo studio** e portare al contatto.

## Direzione scelta — "Tavola tecnica"
Il logo è una tavola da disegno con matita rossa e un marchio in maiuscolo spaziato nero. Il sito ne prende il linguaggio:
fondo bianco carta, inchiostro nero, linee sottili da disegno tecnico in grigio-azzurro, e **un solo segno rosso matita**
per evidenziare. Le protagoniste sono le foto dei lavori (esterni e interni ristrutturati), grandi e senza filtri.
Rispetto al sito Horizons: via l'oro-sabbia e l'antracite pesante (non c'entrano col logo), via le foto Unsplash.

## Token
- **Palette**
  - ink (testo e marchio): `#1A1A1A`
  - paper (fondo): `#FFFFFF` · paper-2 (fasce alterne): `#F3F5F6`
  - blueprint (linee, etichette, dettagli): `#6E8796`
  - pencil (accento, uso parsimonioso: sottolineature, CTA hover, quote): `#B5322A`
  - muted (testo secondario): `#5A6066`
- **Tipografia**: display = **Archivo** (titoli; maiuscoletto spaziato per etichette, come il marchio) · body = **Inter** ·
  self-hosted con @fontsource (niente Google Fonts).
- **Signature element**: le **linee di quota** del disegno tecnico (`|—— 15+ anni ——|`) usate per i numeri dello studio e
  come divisori di sezione, in blueprint con le frecce/terminali in rosso matita. È l'unico vezzo grafico; il resto resta quieto.
- **Motion**: minimale. Dissolvenza lenta tra le foto dell'hero, nessuna animazione allo scroll; rispetta `prefers-reduced-motion`.

## Struttura (pagina unica, come l'originale + una sezione)
1. **Hero** — slider di 3–4 foto vere (es. villa moderna con cielo blu, casa rurale ristrutturata, interno con travi bianche),
   titolo "Progettiamo spazi. Realizziamo visioni.", sottotitolo, CTA "Parlaci del tuo progetto" + telefono.
2. **Lo studio** — testo Chi siamo + gli 8 servizi in griglia sobria (icona a linea, nome).
3. **Lavori** *(nuova)* — 6 interventi fotografati, ognuno con 3–5 foto in galleria (lightbox). Titoli **neutri** per tipo di
   intervento (es. "Ristrutturazione di casa rurale"), **mai i nomi dei proprietari**.
4. **Team / numeri** — testo + 4 numeri con linee di quota; foto dell'ufficio.
5. **Contatti** — indirizzo, telefono, email cliccabili + modulo (invio dal Worker a info@) + mappa statica/link Maps.
6. Footer — P.IVA, Instagram, Privacy/Cookie Policy (da collegare prima del go-live).

## Immagini
- Logo: varianti in `materiale/logo/` (versioni su trasparente per header chiaro, versioni su nero per footer).
- Foto: `materiale/CASE FOTOGRAFATE/` e `materiale/FOTO UFFICI.png` (cartelle **non versionate**: repo pubblico).
  Nel sito vanno copiate in `src/assets/images/lavori/` con nomi neutri (`lavoro-01-esterno-1.webp`…), ridimensionate e senza metadati.
- Le relazioni tecniche PDF restano fuori dal repo.

## Cosa NON fare (anti-AI-slop)
- Evita i 3 cliché: cream+serif+terracotta · near-black+accent acido · broadsheet a colonne.
- Niente animazioni decorative, niente numerazioni 01/02/03 di sezione, niente gradienti.
- Il rosso matita non diventa un colore di sfondo: solo segni sottili.
- Niente nomi di clienti privati in testi, alt, nomi file o URL.

## Mappatura sul template
- `src/content/settings/site.json` (`design.colors` / `design.fonts`) ← token qui sopra.
- Linee di quota → CSS mirato nel blocco numeri e nei divisori; galleria lavori → blocco galleria con lightbox.
