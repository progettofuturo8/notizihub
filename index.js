/**
 * NotiziHub - Auto Publisher
 * Legge RSS feed per 10 nicchie, genera articoli con Claude (Anthropic),
 * li salva come file Markdown pronti per Next.js
 */

import Parser from 'rss-parser';
import nodemailer from 'nodemailer';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parser = new Parser();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const NICCHIE = [
  { id: 'finanza', nome: 'Finanza Personale',
    feed: ['https://www.ansa.it/sito/notizie/economia/economia_rss.xml','https://news.google.com/rss/search?q=finanza+personale+investimenti&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['investire', 'risparmio', 'ETF', 'borsa', 'mutuo'] },
  { id: 'crypto', nome: 'Crypto & Web3',
    feed: ['https://news.google.com/rss/search?q=bitcoin+ethereum+crypto&hl=it&gl=IT&ceid=IT:it','https://coinjournal.net/it/feed/'],
    keyword_base: ['bitcoin', 'ethereum', 'altcoin', 'DeFi', 'staking'] },
  { id: 'tech', nome: 'Tecnologia & AI',
    feed: ['https://news.google.com/rss/search?q=intelligenza+artificiale+tecnologia&hl=it&gl=IT&ceid=IT:it','https://www.hwupgrade.it/rss/news.xml'],
    keyword_base: ['intelligenza artificiale', 'smartphone', 'laptop', 'software'] },
  { id: 'salute', nome: 'Salute & Wellness',
    feed: ['https://www.ansa.it/canale_saluteebenessere/notizie/salute_feed.xml','https://news.google.com/rss/search?q=salute+benessere+medicina&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['dieta', 'alimentazione', 'benessere', 'prevenzione'] },
  { id: 'viaggi', nome: 'Viaggi',
    feed: ['https://news.google.com/rss/search?q=viaggi+vacanze+turismo+italia&hl=it&gl=IT&ceid=IT:it','https://www.ansa.it/sito/notizie/cultura_e_spettacoli/cultura_e_spettacoli_rss.xml'],
    keyword_base: ['voli low cost', 'hotel', 'vacanze', 'itinerari'] },
  { id: 'motori', nome: 'Motori & Auto',
    feed: ['https://news.google.com/rss/search?q=auto+motori+elettrico&hl=it&gl=IT&ceid=IT:it','https://www.quattroruote.it/rss/news.xml'],
    keyword_base: ['auto elettrica', 'SUV', 'incentivi auto', 'assicurazione'] },
  { id: 'gaming', nome: 'Gaming & Esport',
    feed: ['https://news.google.com/rss/search?q=videogiochi+gaming+ps5+xbox&hl=it&gl=IT&ceid=IT:it','https://www.everyeye.it/rss/news.rss'],
    keyword_base: ['PS5', 'Xbox', 'PC gaming', 'uscite videogiochi'] },
  { id: 'casa', nome: 'Casa & Immobiliare',
    feed: ['https://news.google.com/rss/search?q=immobiliare+casa+affitto+mutuo&hl=it&gl=IT&ceid=IT:it','https://www.ansa.it/sito/notizie/economia/economia_rss.xml'],
    keyword_base: ['mutuo', 'affitto', 'bonus ristrutturazione', 'arredamento'] },
  { id: 'lavoro', nome: 'Lavoro & Carriera',
    feed: ['https://news.google.com/rss/search?q=lavoro+occupazione+stipendio+italia&hl=it&gl=IT&ceid=IT:it','https://www.ansa.it/sito/notizie/economia/economia_rss.xml'],
    keyword_base: ['smart working', 'stipendio', 'curriculum', 'partita IVA'] },
  { id: 'sport', nome: 'Sport',
    feed: ['https://www.ansa.it/sito/notizie/sport/sport_rss.xml','https://news.google.com/rss/search?q=serie+a+calcio+sport+italia&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['Serie A', 'calcio', 'Formula 1', 'tennis'] },
  { id: 'assicurazioni', nome: 'Assicurazioni',
    feed: ['https://news.google.com/rss/search?q=assicurazione+auto+rc+polizza&hl=it&gl=IT&ceid=IT:it','https://www.ansa.it/sito/notizie/economia/economia_rss.xml'],
    keyword_base: ['assicurazione auto', 'RC auto', 'assicurazione vita', 'polizza'] },
  { id: 'fisco', nome: 'Fisco & Tasse',
    feed: ['https://news.google.com/rss/search?q=fisco+tasse+730+dichiarazione+redditi&hl=it&gl=IT&ceid=IT:it','https://www.fiscooggi.it/rss.xml'],
    keyword_base: ['dichiarazione dei redditi', '730', 'partita IVA', 'tasse'] },
  { id: 'pensioni', nome: 'Pensioni',
    feed: ['https://news.google.com/rss/search?q=pensioni+INPS+quota+pensione&hl=it&gl=IT&ceid=IT:it','https://www.ansa.it/sito/notizie/economia/economia_rss.xml'],
    keyword_base: ['pensione', 'INPS', 'quota 103', 'pensione anticipata'] },
  { id: 'prestiti', nome: 'Prestiti & Credito',
    feed: ['https://news.google.com/rss/search?q=prestito+finanziamento+credito+banca&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['prestito personale', 'finanziamento', 'tasso interesse', 'credito'] },
  { id: 'trading', nome: 'Trading Online',
    feed: ['https://news.google.com/rss/search?q=trading+borsa+azioni+investimenti&hl=it&gl=IT&ceid=IT:it','https://www.ilsole24ore.com/rss/finanza-e-mercati.xml'],
    keyword_base: ['trading', 'azioni', 'borsa', 'investimenti online'] },
  { id: 'cucina', nome: 'Cucina & Ricette',
    feed: ['https://news.google.com/rss/search?q=ricette+cucina+italiana+gastronomia&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['ricette', 'cucina italiana', 'dolci', 'antipasti'] },
  { id: 'moda', nome: 'Moda & Stile',
    feed: ['https://news.google.com/rss/search?q=moda+tendenze+fashion+italia&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['moda', 'tendenze', 'outfit', 'stilisti'] },
  { id: 'bellezza', nome: 'Bellezza & Cura',
    feed: ['https://news.google.com/rss/search?q=bellezza+skincare+trucco+beauty&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['skincare', 'trucco', 'capelli', 'beauty'] },
  { id: 'genitori', nome: 'Genitori & Figli',
    feed: ['https://news.google.com/rss/search?q=genitori+figli+educazione+famiglia&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['educazione figli', 'gravidanza', 'neonato', 'scuola'] },
  { id: 'animali', nome: 'Animali Domestici',
    feed: ['https://news.google.com/rss/search?q=animali+cane+gatto+veterinario&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['cane', 'gatto', 'animali', 'veterinario'] },
  { id: 'politica', nome: 'Politica',
    feed: ['https://www.ansa.it/sito/notizie/politica/politica_rss.xml','https://news.google.com/rss/search?q=politica+governo+italia&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['governo', 'parlamento', 'elezioni', 'politica italiana'] },
  { id: 'esteri', nome: 'Notizie dal Mondo',
    feed: ['https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml','https://news.google.com/rss/search?q=notizie+mondo+esteri&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['guerra', 'USA', 'Europa', 'notizie internazionali'] },
  { id: 'ambiente', nome: 'Ambiente & Green',
    feed: ['https://news.google.com/rss/search?q=ambiente+clima+sostenibilita+green&hl=it&gl=IT&ceid=IT:it','https://www.greenme.it/feed/'],
    keyword_base: ['sostenibilità', 'clima', 'energia rinnovabile', 'riciclo'] },
  { id: 'startup', nome: 'Startup & Business',
    feed: ['https://news.google.com/rss/search?q=startup+imprenditoria+business+innovazione&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['startup', 'imprenditoria', 'business', 'innovazione'] },
  { id: 'energia', nome: 'Energia & Bollette',
    feed: ['https://news.google.com/rss/search?q=bolletta+energia+gas+luce+fotovoltaico&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['bolletta luce', 'gas', 'fotovoltaico', 'risparmio energia'] },
  { id: 'cinema', nome: 'Cinema & Serie TV',
    feed: ['https://news.google.com/rss/search?q=film+serie+tv+netflix+cinema&hl=it&gl=IT&ceid=IT:it','https://www.ansa.it/sito/notizie/cultura_e_spettacoli/cultura_e_spettacoli_rss.xml'],
    keyword_base: ['film', 'serie TV', 'Netflix', 'cinema'] },
  { id: 'musica', nome: 'Musica',
    feed: ['https://news.google.com/rss/search?q=musica+concerti+album+artisti+italia&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['musica', 'concerti', 'album', 'artisti'] },
  { id: 'libri', nome: 'Libri & Cultura',
    feed: ['https://news.google.com/rss/search?q=libri+romanzi+cultura+letteratura&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['libri', 'romanzi', 'narrativa', 'saggistica'] },
  { id: 'fumetti', nome: 'Fumetti & Manga',
    feed: ['https://news.google.com/rss/search?q=manga+fumetti+anime+marvel+dc&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['manga', 'fumetti', 'anime', 'Marvel'] },
  { id: 'calcio-mercato', nome: 'Calciomercato',
    feed: ['https://news.google.com/rss/search?q=calciomercato+trasferimenti+serie+a&hl=it&gl=IT&ceid=IT:it','https://www.gazzetta.it/rss/home.xml'],
    keyword_base: ['calciomercato', 'trasferimenti', 'Serie A', 'Champions League'] },
  { id: 'psicologia', nome: 'Psicologia & Mente',
    feed: ['https://news.google.com/rss/search?q=psicologia+ansia+benessere+mentale&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['ansia', 'depressione', 'psicologia', 'benessere mentale'] },
  { id: 'università', nome: 'Università & Studio',
    feed: ['https://news.google.com/rss/search?q=università+borse+studio+laurea+studenti&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['università', 'borse di studio', 'esami', 'laurea'] },
  { id: 'bricolage', nome: 'Bricolage & Fai da te',
    feed: ['https://news.google.com/rss/search?q=fai+da+te+ristrutturazione+casa+bonus&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['fai da te', 'ristrutturazione', 'idraulica', 'elettricità casa'] },
  { id: 'giardinaggio', nome: 'Giardinaggio',
    feed: ['https://news.google.com/rss/search?q=giardinaggio+piante+orto+fiori&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['piante', 'orto', 'giardino', 'fiori'] },
  { id: 'medicina', nome: 'Medicina & Farmaci',
    feed: ['https://www.ansa.it/canale_saluteebenessere/notizie/salute_feed.xml','https://news.google.com/rss/search?q=medicina+farmaci+malattie+cure&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['farmaci', 'malattie', 'sintomi', 'cure'] },
  { id: 'smartphone', nome: 'Smartphone & App',
    feed: ['https://news.google.com/rss/search?q=smartphone+iphone+android+app&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['iPhone', 'Android', 'app', 'smartphone'] },
  { id: 'turismo-food', nome: 'Turismo Enogastronomico',
    feed: ['https://news.google.com/rss/search?q=vino+gastronomia+ristoranti+turismo+food&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['ristoranti', 'vino', 'gastronomia', 'turismo culinario'] },
  { id: 'meteo', nome: 'Meteo',
    feed: ['https://news.google.com/rss/search?q=meteo+previsioni+allerta+temperatura+italia&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['meteo', 'previsioni', 'temperature', 'allerta meteo'] },
  { id: 'cronaca', nome: 'Cronaca',
    feed: ['https://www.ansa.it/sito/notizie/cronaca/cronaca_rss.xml','https://news.google.com/rss/search?q=cronaca+notizie+italia+oggi&hl=it&gl=IT&ceid=IT:it'],
    keyword_base: ['notizie', 'cronaca', 'Italia', 'attualità'] },
  { id: 'scienza', nome: 'Scienza & Spazio',
    feed: ['https://news.google.com/rss/search?q=scienza+spazio+ricerca+scoperta&hl=it&gl=IT&ceid=IT:it','https://www.media.inaf.it/feed/'],
    keyword_base: ['scienza', 'spazio', 'NASA', 'ricerca scientifica'] },
];

const CONFIG = {
  articoli_per_nicchia: parseInt(process.env.ARTICLES_PER_NICHE || '1'),
  output_dir: process.env.OUTPUT_DIR || path.join(__dirname, 'output'),
  lunghezza_articolo: 1000,
};

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 80);
}
function oggi() { return new Date().toISOString().split('T')[0]; }
function hash(str) { return crypto.createHash('md5').update(str).digest('hex').substring(0, 8); }

async function leggiArticoliGiaGenerati() {
  try { return new Set(JSON.parse(await fs.readFile(path.join(CONFIG.output_dir, '.generated.json'), 'utf-8'))); }
  catch { return new Set(); }
}
async function salvaArticoloGenerato(id, generati) {
  generati.add(id);
  await fs.writeFile(path.join(CONFIG.output_dir, '.generated.json'), JSON.stringify([...generati]));
}

async function leggiFeed(nicchia) {
  const items = [];
  const trenta_giorni_fa = new Date();
  trenta_giorni_fa.setDate(trenta_giorni_fa.getDate() - 30);

  for (const feedUrl of nicchia.feed) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items.slice(0, 10)) {
        if (!item.title) continue;
        // Filtra articoli più vecchi di 30 giorni
        if (item.pubDate) {
          const dataArticolo = new Date(item.pubDate);
          if (dataArticolo < trenta_giorni_fa) {
            console.log(`  [skip-vecchio] ${item.title.substring(0, 40)}... (${item.pubDate})`);
            continue;
          }
        }
        items.push({ titolo: item.title, sommario: item.contentSnippet || '', link: item.link || '', data: item.pubDate || '' });
      }
    } catch (err) { console.warn(`  [!] Feed non raggiungibile: ${feedUrl}`); }
  }
  return items.sort(() => Math.random() - 0.5).slice(0, CONFIG.articoli_per_nicchia * 2);
}

async function generaArticolo(nicchia, spunto) {
  const dataOggi = new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' });
  const annoCorrente = new Date().getFullYear();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    system: `Sei un giornalista esperto di ${nicchia.nome} che scrive per un pubblico italiano. Scrivi SOLO l'articolo in formato Markdown, senza commenti aggiuntivi. Oggi è ${dataOggi}. Scrivi sempre al presente, riferendoti ad eventi e dati attuali del ${annoCorrente}. Non usare mai date passate o anni precedenti al ${annoCorrente}.`,
    messages: [{
      role: 'user',
      content: `Scrivi un articolo SEO di circa ${CONFIG.lunghezza_articolo} parole su:

SPUNTO NOTIZIA RECENTE: "${spunto.titolo}"
SOMMARIO: "${spunto.sommario.substring(0, 200)}"
KEYWORD: ${nicchia.keyword_base.slice(0, 3).join(', ')}
DATA OGGI: ${dataOggi}

Regole importanti:
- Scrivi come se la notizia fosse di oggi
- Usa sempre l'anno ${annoCorrente} nei riferimenti temporali
- Non citare mai anni passati come attuali
- Struttura: H1 con keyword, introduzione, 3-5 sezioni H2, lista puntata, conclusione
- Alla fine aggiungi: <!-- META: [meta description 155 caratteri] -->
- Italiano professionale e aggiornato`
    }]
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}

async function salvaMarkdown(nicchia, spunto, contenuto) {
  const slug = slugify(spunto.titolo);
  const data = oggi();
  const metaMatch = contenuto.match(/<!--\s*META:\s*(.+?)\s*-->/s);
  const metaDesc = metaMatch ? metaMatch[1].trim() : spunto.titolo.substring(0, 155);
  const testo = contenuto.replace(/<!--\s*META:.*?-->/s, '').trim();
  const frontmatter = `---\ntitle: "${spunto.titolo.replace(/"/g, "'")}"\nslug: "${slug}"\ndate: "${data}"\nnicchia: "${nicchia.id}"\nnicchia_nome: "${nicchia.nome}"\nmeta_description: "${metaDesc.replace(/"/g, "'")}"\ntags: [${nicchia.keyword_base.slice(0, 3).map(k => `"${k}"`).join(', ')}]\nauto_generated: true\n---\n\n`;
  const dir = path.join(CONFIG.output_dir, nicchia.id);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${data}-${slug}.md`);
  await fs.writeFile(filePath, frontmatter + testo, 'utf-8');
  return { filePath, slug, id: hash(spunto.titolo + data), titolo: spunto.titolo };
}

async function inviaReportEmail(risultati, errori) {
  const EMAIL = process.env.REPORT_EMAIL || 'progettofuturo8@gmail.com';
  const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
  if (!GMAIL_PASS) { console.log('  [!] GMAIL_APP_PASSWORD non configurata, email saltata'); return; }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL, pass: GMAIL_PASS }
  });

  // Raggruppa per nicchia
  const perNicchia = {};
  risultati.forEach(r => {
    if (!perNicchia[r.nicchia]) perNicchia[r.nicchia] = [];
    perNicchia[r.nicchia].push(r.titolo);
  });

  // Costruisci tabella HTML
  let righe = '';
  let i = 0;
  for (const [nicchia, articoli] of Object.entries(perNicchia)) {
    const bg = i % 2 === 0 ? '#f8f9fa' : '#ffffff';
    righe += `<tr style="background:${bg}">
      <td style="padding:8px 12px;border:1px solid #dee2e6;font-weight:500">${nicchia}</td>
      <td style="padding:8px 12px;border:1px solid #dee2e6;text-align:center;color:#065f46;font-weight:bold">${articoli.length}</td>
      <td style="padding:8px 12px;border:1px solid #dee2e6;font-size:12px;color:#555">${articoli[0].substring(0, 60)}${articoli.length > 1 ? ` (+${articoli.length-1} altri)` : ''}</td>
    </tr>`;
    i++;
  }

  const costo = (risultati.length * 0.001).toFixed(4);
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto">
    <div style="background:#111;padding:20px;text-align:center;border-bottom:3px solid #e63946">
      <h1 style="color:#fff;margin:0;font-size:24px">NotiziHub</h1>
      <p style="color:#888;margin:5px 0 0">Report giornaliero — ${oggi()}</p>
    </div>
    <div style="padding:20px;background:#fff">
      <div style="display:flex;gap:16px;margin-bottom:20px">
        <div style="flex:1;background:#EAF3DE;border-radius:8px;padding:16px;text-align:center">
          <div style="font-size:32px;font-weight:bold;color:#065f46">${risultati.length}</div>
          <div style="color:#3B6D11;font-size:13px">Articoli generati</div>
        </div>
        <div style="flex:1;background:#FEF2F2;border-radius:8px;padding:16px;text-align:center">
          <div style="font-size:32px;font-weight:bold;color:#991b1b">${errori}</div>
          <div style="color:#991b1b;font-size:13px">Errori</div>
        </div>
        <div style="flex:1;background:#EBF5FF;border-radius:8px;padding:16px;text-align:center">
          <div style="font-size:32px;font-weight:bold;color:#1a56db">€${costo}</div>
          <div style="color:#1a56db;font-size:13px">Costo API</div>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#111">
            <th style="padding:10px 12px;border:1px solid #dee2e6;color:#fff;text-align:left">Nicchia</th>
            <th style="padding:10px 12px;border:1px solid #dee2e6;color:#fff;text-align:center">Articoli</th>
            <th style="padding:10px 12px;border:1px solid #dee2e6;color:#fff;text-align:left">Ultimo articolo</th>
          </tr>
        </thead>
        <tbody>${righe}</tbody>
      </table>
    </div>
    <div style="background:#f8f9fa;padding:12px;text-align:center;font-size:12px;color:#888">
      NotiziHub Auto Publisher · Report automatico giornaliero
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"NotiziHub Bot" <${EMAIL}>`,
    to: EMAIL,
    subject: `NotiziHub — ${risultati.length} articoli generati oggi (${oggi()})`,
    html
  });
  console.log(`  [email] Report inviato a ${EMAIL}`);
}

async function main() {
  console.log(`\n=== NotiziHub Auto Publisher — ${oggi()} ===\n`);
  await fs.mkdir(CONFIG.output_dir, { recursive: true });
  const giàGenerati = await leggiArticoliGiaGenerati();
  const risultati = [];
  let errori = 0;

  for (const nicchia of NICCHIE) {
    console.log(`\n[${nicchia.nome}] Leggo feed RSS...`);
    const spunti = await leggiFeed(nicchia);
    if (!spunti.length) { console.log(`  [!] Nessun spunto`); continue; }
    let generatiNicchia = 0;
    for (const spunto of spunti) {
      if (generatiNicchia >= CONFIG.articoli_per_nicchia) break;
      const spuntoId = hash(spunto.titolo);
      if (giàGenerati.has(spuntoId)) { console.log(`  [skip] ${spunto.titolo.substring(0, 50)}...`); continue; }
      console.log(`  [gen] ${spunto.titolo.substring(0, 60)}...`);
      try {
        const contenuto = await generaArticolo(nicchia, spunto);
        const { filePath, slug, id, titolo } = await salvaMarkdown(nicchia, spunto, contenuto);
        await salvaArticoloGenerato(spuntoId, giàGenerati);
        risultati.push({ nicchia: nicchia.id, slug, titolo, file: filePath });
        generatiNicchia++;
        console.log(`  [ok]  ${path.basename(filePath)}`);
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) { console.error(`  [err] ${err.message}`); errori++; }
    }
  }

  console.log(`\n=== Completato ===`);
  console.log(`Articoli generati: ${risultati.length}`);
  console.log(`Errori: ${errori}`);
  console.log(`Costo stimato: €${(risultati.length * 0.001).toFixed(4)}`);

  console.log('\n--- Invio report email...');
  await inviaReportEmail(risultati, errori);
}

main().catch(err => { console.error('Errore fatale:', err); process.exit(1); });
