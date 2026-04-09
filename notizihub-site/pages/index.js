import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Head from 'next/head';
import React from 'react';

const NICCHIE = [
  { id: 'finanza', nome: 'Finanza', colore: '#1a56db', bg: '#EBF5FF' },
  { id: 'crypto', nome: 'Crypto', colore: '#b45309', bg: '#FFFBEB' },
  { id: 'tech', nome: 'Tech & AI', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'salute', nome: 'Salute', colore: '#065f46', bg: '#ECFDF5' },
  { id: 'viaggi', nome: 'Viaggi', colore: '#9d174d', bg: '#FFF1F2' },
  { id: 'motori', nome: 'Motori', colore: '#166534', bg: '#F0FDF4' },
  { id: 'gaming', nome: 'Gaming', colore: '#86198f', bg: '#FDF4FF' },
  { id: 'casa', nome: 'Casa', colore: '#44403c', bg: '#FAFAF9' },
  { id: 'lavoro', nome: 'Lavoro', colore: '#991b1b', bg: '#FEF2F2' },
  { id: 'sport', nome: 'Sport', colore: '#0f766e', bg: '#F0FDFA' },
  { id: 'assicurazioni', nome: 'Assicurazioni', colore: '#1a56db', bg: '#EBF5FF' },
  { id: 'fisco', nome: 'Fisco & Tasse', colore: '#991b1b', bg: '#FEF2F2' },
  { id: 'pensioni', nome: 'Pensioni', colore: '#44403c', bg: '#FAFAF9' },
  { id: 'prestiti', nome: 'Prestiti', colore: '#b45309', bg: '#FFFBEB' },
  { id: 'trading', nome: 'Trading', colore: '#065f46', bg: '#ECFDF5' },
  { id: 'cucina', nome: 'Cucina', colore: '#9d174d', bg: '#FFF1F2' },
  { id: 'moda', nome: 'Moda', colore: '#86198f', bg: '#FDF4FF' },
  { id: 'bellezza', nome: 'Bellezza', colore: '#9d174d', bg: '#FFF1F2' },
  { id: 'genitori', nome: 'Genitori', colore: '#065f46', bg: '#ECFDF5' },
  { id: 'animali', nome: 'Animali', colore: '#166534', bg: '#F0FDF4' },
  { id: 'politica', nome: 'Politica', colore: '#991b1b', bg: '#FEF2F2' },
  { id: 'esteri', nome: 'Esteri', colore: '#1a56db', bg: '#EBF5FF' },
  { id: 'ambiente', nome: 'Ambiente', colore: '#166534', bg: '#F0FDF4' },
  { id: 'startup', nome: 'Startup', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'energia', nome: 'Energia', colore: '#b45309', bg: '#FFFBEB' },
  { id: 'cinema', nome: 'Cinema & TV', colore: '#44403c', bg: '#FAFAF9' },
  { id: 'musica', nome: 'Musica', colore: '#86198f', bg: '#FDF4FF' },
  { id: 'libri', nome: 'Libri', colore: '#44403c', bg: '#FAFAF9' },
  { id: 'fumetti', nome: 'Fumetti', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'calcio-mercato', nome: 'Calciomercato', colore: '#065f46', bg: '#ECFDF5' },
  { id: 'psicologia', nome: 'Psicologia', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'università', nome: 'Università', colore: '#1a56db', bg: '#EBF5FF' },
  { id: 'bricolage', nome: 'Bricolage', colore: '#b45309', bg: '#FFFBEB' },
  { id: 'giardinaggio', nome: 'Giardinaggio', colore: '#166534', bg: '#F0FDF4' },
  { id: 'medicina', nome: 'Medicina', colore: '#065f46', bg: '#ECFDF5' },
  { id: 'smartphone', nome: 'Smartphone', colore: '#6d28d9', bg: '#F5F3FF' },
  { id: 'turismo-food', nome: 'Turismo Food', colore: '#9d174d', bg: '#FFF1F2' },
  { id: 'meteo', nome: 'Meteo', colore: '#1a56db', bg: '#EBF5FF' },
  { id: 'cronaca', nome: 'Cronaca', colore: '#991b1b', bg: '#FEF2F2' },
  { id: 'scienza', nome: 'Scienza', colore: '#0f766e', bg: '#F0FDFA' },
];

function getNicchia(id) {
  return NICCHIE.find(n => n.id === id) || NICCHIE[0];
}

function getImmagine(nicchia_id) {
  return `/nicchie/${nicchia_id}.png`;
}

export async function getStaticProps() {
  const outputDir = path.join(process.cwd(), '..', 'output');
  const articoli = [];

  if (fs.existsSync(outputDir)) {
    for (const nicchia of NICCHIE) {
      const dir = path.join(outputDir, nicchia.id);
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).slice(-5);
      for (const file of files) {
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
        const { data } = matter(raw);
        articoli.push({
          titolo: data.title || '',
          slug: data.slug || '',
          nicchia: nicchia.id,
          nicchia_nome: nicchia.nome,
          data: data.date || '',
          meta: data.meta_description || '',
        });
      }
    }
  }

  articoli.sort((a, b) => new Date(b.data) - new Date(a.data));
  return { props: { articoli: articoli.slice(0, 40) }, revalidate: 3600 };
}

export default function Home({ articoli }) {
  if (!articoli || articoli.length === 0) return null;

  const principale = articoli[0];
  const secondari = articoli.slice(1, 4);
  const resto = articoli.slice(4);

  return (
    <>
      <Head>
        <title>NotiziHub — Notizie italiane aggiornate</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Georgia', serif; background: #f9f9f7; color: #111; }
          a { text-decoration: none; color: inherit; }
          .badge { display: inline-block; padding: 3px 10px; border-radius: 3px; font-family: system-ui; font-size: 11px; font-weight: 700; text-transform: uppercase; }
          .nav-link:hover { color: #fff !important; background: rgba(255,255,255,0.1) !important; }
        `}</style>
      </Head>

      <header style={{ background: '#111', color: '#fff', borderBottom: '3px solid #e63946' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          
          <div style={{ padding: '8px 0', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'system-ui', fontSize: 12, color: '#888' }}>
              {new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ fontFamily: 'system-ui', fontSize: 12, color: '#888' }}>40 categorie · aggiornamento automatico</div>
          </div>

          <div style={{ padding: '16px 0 12px', textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: 52, fontWeight: 700, color: '#fff', letterSpacing: '-2px' }}>NotiziHub</Link>
          </div>

          <div style={{ borderTop: '1px solid #333' }}>
            {/* Prima riga nicchie (0-20) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
              {NICCHIE.slice(0, 20).map(n => (
                <Link key={n.id} href={`/nicchia/${n.id}`} className="nav-link" style={{ padding: '9px 12px', fontSize: 12, color: '#aaa' }}>{n.nome}</Link>
              ))}
            </div>
            {/* Seconda riga nicchie (20-40) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, borderTop: '1px solid #222' }}>
              {NICCHIE.slice(20).map(n => (
                <Link key={n.id} href={`/nicchia/${n.id}`} className="nav-link" style={{ padding: '9px 12px', fontSize: 12, color: '#777' }}>{n.nome}</Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        {/* Resto del contenuto (Hero e Griglia) rimane lo stesso */}
        {principale && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, marginBottom: 40, borderBottom: '2px solid #111', paddingBottom: 40 }}>
            <div>
              <img src={getImmagine(principale.nicchia)} style={{ width: '100%', height: 350, borderRadius: 8, marginBottom: 16, objectFit: 'cover' }} />
              <Link href={`/${principale.nicchia}/${principale.slug}`}><h1 style={{ fontSize: 34, fontWeight: 700 }}>{principale.titolo}</h1></Link>
              <p style={{ marginTop: 10, color: '#444', lineHeight: 1.6 }}>{principale.meta}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {secondari.map((art, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, borderBottom: '1px solid #eee', paddingBottom: 16 }}>
                  <img src={getImmagine(art.nicchia)} style={{ width: 100, height: 70, borderRadius: 4, objectFit: 'cover' }} />
                  <Link href={`/${art.nicchia}/${art.slug}`}><h3 style={{ fontSize: 14, fontWeight: 700 }}>{art.titolo}</h3></Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
          {resto.map((art, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden' }}>
              <img src={getImmagine(art.nicchia)} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              <div style={{ padding: 15 }}>
                <span className="badge" style={{ background: getNicchia(art.nicchia).bg, color: getNicchia(art.nicchia).colore }}>{art.nicchia_nome}</span>
                <Link href={`/${art.nicchia}/${art.slug}`}><h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 10 }}>{art.titolo}</h2></Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}