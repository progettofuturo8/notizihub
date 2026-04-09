import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Head from 'next/head';

const OUTPUT_DIR = path.join(process.cwd(), '..', 'output');

const NICCHIE_INFO = {
  finanza: { nome: 'Finanza Personale', colore: '#1a56db', bg: '#EBF5FF' },
  crypto: { nome: 'Crypto & Web3', colore: '#b45309', bg: '#FFFBEB' },
  tech: { nome: 'Tecnologia & AI', colore: '#6d28d9', bg: '#F5F3FF' },
  salute: { nome: 'Salute & Wellness', colore: '#065f46', bg: '#ECFDF5' },
  viaggi: { nome: 'Viaggi', colore: '#9d174d', bg: '#FFF1F2' },
  motori: { nome: 'Motori & Auto', colore: '#166534', bg: '#F0FDF4' },
  gaming: { nome: 'Gaming & Esport', colore: '#86198f', bg: '#FDF4FF' },
  casa: { nome: 'Casa & Immobiliare', colore: '#44403c', bg: '#FAFAF9' },
  lavoro: { nome: 'Lavoro & Carriera', colore: '#991b1b', bg: '#FEF2F2' },
  sport: { nome: 'Sport', colore: '#0f766e', bg: '#F0FDFA' },
  assicurazioni: { nome: 'Assicurazioni', colore: '#1a56db', bg: '#EBF5FF' },
  fisco: { nome: 'Fisco & Tasse', colore: '#991b1b', bg: '#FEF2F2' },
  pensioni: { nome: 'Pensioni', colore: '#44403c', bg: '#FAFAF9' },
  prestiti: { nome: 'Prestiti & Credito', colore: '#b45309', bg: '#FFFBEB' },
  trading: { nome: 'Trading Online', colore: '#065f46', bg: '#ECFDF5' },
  cucina: { nome: 'Cucina & Ricette', colore: '#9d174d', bg: '#FFF1F2' },
  moda: { nome: 'Moda & Stile', colore: '#86198f', bg: '#FDF4FF' },
  bellezza: { nome: 'Bellezza & Cura', colore: '#9d174d', bg: '#FFF1F2' },
  genitori: { nome: 'Genitori & Figli', colore: '#065f46', bg: '#ECFDF5' },
  animali: { nome: 'Animali Domestici', colore: '#166534', bg: '#F0FDF4' },
  politica: { nome: 'Politica', colore: '#991b1b', bg: '#FEF2F2' },
  esteri: { nome: 'Notizie dal Mondo', colore: '#1a56db', bg: '#EBF5FF' },
  ambiente: { nome: 'Ambiente & Green', colore: '#166534', bg: '#F0FDF4' },
  startup: { nome: 'Startup & Business', colore: '#6d28d9', bg: '#F5F3FF' },
  energia: { nome: 'Energia & Bollette', colore: '#b45309', bg: '#FFFBEB' },
  cinema: { nome: 'Cinema & Serie TV', colore: '#44403c', bg: '#FAFAF9' },
  musica: { nome: 'Musica', colore: '#86198f', bg: '#FDF4FF' },
  libri: { nome: 'Libri & Cultura', colore: '#44403c', bg: '#FAFAF9' },
  fumetti: { nome: 'Fumetti & Manga', colore: '#6d28d9', bg: '#F5F3FF' },
  'calcio-mercato': { nome: 'Calciomercato', colore: '#065f46', bg: '#ECFDF5' },
  psicologia: { nome: 'Psicologia & Mente', colore: '#6d28d9', bg: '#F5F3FF' },
  università: { nome: 'Università & Studio', colore: '#1a56db', bg: '#EBF5FF' },
  bricolage: { nome: 'Bricolage & Fai da te', colore: '#b45309', bg: '#FFFBEB' },
  giardinaggio: { nome: 'Giardinaggio', colore: '#166534', bg: '#F0FDF4' },
  medicina: { nome: 'Medicina & Farmaci', colore: '#065f46', bg: '#ECFDF5' },
  smartphone: { nome: 'Smartphone & App', colore: '#6d28d9', bg: '#F5F3FF' },
  'turismo-food': { nome: 'Turismo Enogastronomico', colore: '#9d174d', bg: '#FFF1F2' },
  meteo: { nome: 'Meteo', colore: '#1a56db', bg: '#EBF5FF' },
  cronaca: { nome: 'Cronaca', colore: '#991b1b', bg: '#FEF2F2' },
  scienza: { nome: 'Scienza & Spazio', colore: '#0f766e', bg: '#F0FDFA' },
};

export async function getStaticPaths() {
  return {
    paths: Object.keys(NICCHIE_INFO).map(id => ({ params: { nicchia: id } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const dir = path.join(OUTPUT_DIR, params.nicchia);
  const articoli = [];

  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const { data } = matter(raw);
      articoli.push({
        titolo: data.title || '',
        slug: data.slug || '',
        data: data.date || '',
        meta: data.meta_description || '',
      });
    }
  }

  articoli.sort((a, b) => new Date(b.data) - new Date(a.data));
  const info = NICCHIE_INFO[params.nicchia] || { nome: params.nicchia, colore: '#eee', testo: '#333' };
  return { props: { articoli, nicchia: params.nicchia, info }, revalidate: 3600 };
}

export default function PaginaNicchia({ articoli, nicchia, info }) {
  return (
    <>
      <Head>
        <title>{info.nome} — NotiziHub</title>
        <meta name="description" content={`Tutte le notizie su ${info.nome}: aggiornamenti quotidiani, guide e approfondimenti.`} />
      </Head>

      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>

        <header style={{ background: '#111', color: '#fff', borderBottom: '3px solid #e63946', marginBottom: 0 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            <div style={{ padding: '16px 0 12px', textAlign: 'center' }}>
              <Link href="/" style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
                NotiziHub
              </Link>
            </div>
            <nav style={{ display: 'flex', flexWrap: 'wrap', borderTop: '1px solid #333', paddingBottom: 4 }}>
              {['finanza','crypto','tech','salute','viaggi','motori','gaming','casa','lavoro','sport','assicurazioni','fisco','pensioni','trading','cucina','moda','bellezza','politica','sport','cronaca','scienza'].map(n => (
                <Link key={n} href={`/nicchia/${n}`} style={{ padding: '8px 12px', fontFamily: 'system-ui', fontSize: 12, color: '#aaa', textDecoration: 'none' }}>{n.charAt(0).toUpperCase()+n.slice(1)}</Link>
              ))}
            </nav>
          </div>
        </header>

        <div style={{ marginBottom: 24 }}>
          <span style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 99,
            fontSize: 14, fontWeight: 700, background: info.colore, color: info.testo
          }}>{info.nome}</span>
          <p style={{ color: '#666', fontSize: 14, marginTop: 8 }}>
            {articoli.length} articoli pubblicati
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 40 }}>
          {articoli.map((art, i) => {
            const imgUrl = `/nicchie/${nicchia}.png`;
            return (
              <div key={i} style={{ border: '1px solid #eee', borderRadius: 10, overflow: 'hidden', background: '#fff', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.08)'; }}
                onMouseOut={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{ height: 160, overflow: 'hidden' }}>
                  <img src={imgUrl} alt={art.titolo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '14px 16px 16px', borderTop: `3px solid ${info.colore || '#333'}` }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, marginBottom: 8, color: '#111' }}>
                    <Link href={`/${nicchia}/${art.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {art.titolo}
                    </Link>
                  </h2>
                  {art.meta && art.meta !== art.titolo && (
                    <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5, marginBottom: 8 }}>{art.meta?.substring(0, 100)}...</p>
                  )}
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>{art.data}</div>
                </div>
              </div>
            );
          })}
        </div>

        {articoli.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
            Nessun articolo ancora. Avvia lo script per generarne!
          </div>
        )}

        <footer style={{ borderTop: '1px solid #eee', padding: '20px 0', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
          © {new Date().getFullYear()} NotiziHub
        </footer>
      </div>
    </>
  );
}
