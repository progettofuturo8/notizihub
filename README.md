# NotiziHub — Auto Publisher

Sistema automatico che genera articoli SEO per 10 nicchie ogni giorno usando Claude AI.

## Come funziona

```
RSS Feed (30+ fonti) → Claude API → Markdown → Git commit → Sito live
```

Ogni mattina alle 07:00, GitHub Actions esegue lo script che:
1. Legge i feed RSS di tutte e 10 le nicchie
2. Manda i titoli/sommari a Claude API che genera articoli originali
3. Salva i file Markdown con frontmatter SEO
4. Aggiorna la sitemap XML
5. Fa il commit automatico nel repository

---

## Setup (15 minuti)

### 1. Clona e installa

```bash
git clone https://github.com/TUO-USERNAME/notizihub.git
cd notizihub
npm install
```

### 2. Crea il file `.env` (solo per sviluppo locale)

```bash
cp .env.example .env
```

Modifica `.env`:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
SITE_URL=https://notizihub.it
OUTPUT_DIR=./output
ARTICLES_PER_NICHE=3
```

### 3. Testa in locale (genera solo 1 articolo per nicchia)

```bash
npm run dev
```

### 4. Configura GitHub Actions

Nel tuo repository GitHub:
- Vai in **Settings → Secrets → Actions**
- Aggiungi i secret:
  - `ANTHROPIC_API_KEY` — la tua chiave API di Anthropic
  - `SITE_URL` — l'URL del tuo sito (es. `https://notizihub.it`)

Il workflow parte automaticamente ogni giorno alle 07:00.
Puoi anche lanciarlo manualmente da **Actions → Auto Publisher → Run workflow**.

---

## Struttura output

```
output/
├── finanza/
│   ├── 2025-09-01-come-investire-1000-euro.md
│   └── 2025-09-01-etf-vs-fondi-comuni.md
├── crypto/
│   └── 2025-09-01-bitcoin-analisi-tecnica.md
├── ...
├── sitemap.xml
├── report-2025-09-01.json
└── .generated.json        ← tiene traccia degli articoli già generati
```

Ogni file Markdown ha questo frontmatter:

```yaml
---
title: "Come investire €1.000 al mese nel 2025"
slug: "come-investire-1000-euro-al-mese-2025"
date: "2025-09-01"
nicchia: "finanza"
nicchia_nome: "Finanza Personale"
meta_description: "Guida completa su come investire 1000 euro al mese..."
tags: ["investire", "risparmio", "ETF"]
auto_generated: true
---
```

---

## Integrazione con Ghost CMS

Per pubblicare automaticamente su Ghost, aggiungi nel workflow:

```yaml
- name: Pubblica su Ghost
  env:
    GHOST_URL: ${{ secrets.GHOST_URL }}
    GHOST_API_KEY: ${{ secrets.GHOST_API_KEY }}
  run: node ghost-publisher.js
```

## Integrazione con Next.js

I file Markdown in `output/` sono già compatibili con Next.js + `next-mdx-remote` o `gray-matter`.

---

## Costi stimati

| Articoli/giorno | Costo Claude API | Costo mensile |
|---|---|---|
| 10 (1/nicchia) | ~€0.03/giorno | ~€0.90 |
| 30 (3/nicchia) | ~€0.09/giorno | ~€2.70 |
| 100 (10/nicchia) | ~€0.30/giorno | ~€9.00 |

Hosting: Vercel gratuito fino a 100GB bandwidth.

---

## Personalizzare le nicchie

Modifica l'array `NICCHIE` in `index.js`:

```js
{
  id: 'mia-nicchia',
  nome: 'La Mia Nicchia',
  slug: 'mia-nicchia',
  feed: [
    'https://esempio.com/feed.rss',
  ],
  keyword_base: ['parola chiave 1', 'parola chiave 2'],
  cpm_stimato: 15,
}
```

---

## Variabili d'ambiente

| Variabile | Default | Descrizione |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | **Obbligatoria.** La tua chiave API |
| `SITE_URL` | `https://notizihub.it` | URL base per la sitemap |
| `OUTPUT_DIR` | `./output` | Directory di output |
| `ARTICLES_PER_NICHE` | `3` | Articoli generati per nicchia al giorno |
