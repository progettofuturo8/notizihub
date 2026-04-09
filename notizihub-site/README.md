# NotiziHub — Sito Next.js

Sito web che legge automaticamente gli articoli generati dallo script `auto-publisher` e li pubblica come pagine web ottimizzate SEO.

## Struttura cartelle

```
notizihub/
├── auto-publisher/      ← lo script che genera gli articoli
│   └── output/          ← articoli Markdown generati ogni giorno
└── notizihub-site/      ← questo sito Next.js
    └── pages/
```

## Avvio in locale

```bash
cd notizihub-site
npm install
npm run dev
```

Apri http://localhost:3000

## Deploy su Vercel (gratis)

1. Crea un account su **vercel.com**
2. Collega il tuo repository GitHub
3. Seleziona la cartella `notizihub-site` come root
4. Aggiungi la variabile d'ambiente:
   - `NEXT_PUBLIC_SITE_URL` = `https://il-tuo-dominio.it`
5. Clicca Deploy

Da quel momento ogni volta che lo script fa il commit dei nuovi articoli, Vercel ricostruisce automaticamente il sito in ~2 minuti.

## Pagine generate

- `/` — Homepage con tutti gli articoli recenti
- `/nicchia/[id]` — Pagina per ogni nicchia (finanza, crypto, tech...)
- `/[nicchia]/[slug]` — Pagina singolo articolo
- `/sitemap.xml` — Sitemap automatica per Google

## Aggiungere AdSense

Quando AdSense è approvato, sostituisci i placeholder `[ Spazio pubblicitario AdSense ]` nei file con il codice script fornito da Google.
