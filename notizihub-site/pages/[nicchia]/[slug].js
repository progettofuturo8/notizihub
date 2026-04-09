import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import Head from 'next/head';
import Link from 'next/link';

const OUTPUT_DIR = path.join(process.cwd(), '..', 'output');
export async function getStaticPaths() {
  const paths = [];
  if (!fs.existsSync(OUTPUT_DIR)) return { paths: [], fallback: 'blocking' };

  const nicchie = fs.readdirSync(OUTPUT_DIR).filter(f =>
    fs.statSync(path.join(OUTPUT_DIR, f)).isDirectory() && !f.startsWith('.')
  );

  for (const nicchia of nicchie) {
    const dir = path.join(OUTPUT_DIR, nicchia);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const { data } = matter(raw);
      if (data.slug) {
        paths.push({ params: { nicchia, slug: data.slug } });
      }
    }
  }
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const dir = path.join(OUTPUT_DIR, params.nicchia);
  if (!fs.existsSync(dir)) return { notFound: true };

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  let articolo = null;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data, content } = matter(raw);
    if (data.slug === params.slug) {
      const processed = await remark().use(html).process(content);
      articolo = { ...data, contenuto: processed.toString() };
      break;
    }
  }

  if (!articolo) return { notFound: true };
  return { props: { articolo }, revalidate: 86400 };
}

export default function Articolo({ articolo }) {
  return (
    <>
      <Head>
        <title>{articolo.title} — NotiziHub</title>
        <meta name="description" content={articolo.meta_description || ''} />
        <meta property="og:title" content={articolo.title} />
        <meta property="og:description" content={articolo.meta_description || ''} />
      </Head>

      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 780, margin: '0 auto', padding: '0 16px' }}>

        <header style={{ borderBottom: '1px solid #eee', padding: '16px 0', marginBottom: 32 }}>
          <Link href="/" style={{ fontSize: 20, fontWeight: 700, color: '#111', textDecoration: 'none' }}>
            Notizie<span style={{ color: '#185FA5' }}>Hub</span>
          </Link>
        </header>

        <div style={{ marginBottom: 12 }}>
          <Link href={`/nicchia/${articolo.nicchia}`} style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 99,
            fontSize: 12, fontWeight: 600, background: '#E6F1FB', color: '#0C447C',
            textDecoration: 'none', marginBottom: 16
          }}>{articolo.nicchia_nome}</Link>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.3, color: '#111', marginBottom: 12 }}>
          {articolo.title}
        </h1>

        <div style={{ fontSize: 13, color: '#999', marginBottom: 32 }}>
          Pubblicato il {articolo.date} · Lettura: 5 min
        </div>

        <div
          style={{ fontSize: 17, lineHeight: 1.8, color: '#222' }}
          dangerouslySetInnerHTML={{ __html: articolo.contenuto }}
        />

        {/* AdSense placeholder */}
        <div style={{
          margin: '40px 0', padding: 20, background: '#f8f9fa',
          borderRadius: 8, textAlign: 'center', color: '#aaa', fontSize: 13
        }}>
          [ Spazio pubblicitario AdSense ]
        </div>

        <footer style={{ borderTop: '1px solid #eee', padding: '20px 0', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
          © {new Date().getFullYear()} NotiziHub
        </footer>
      </div>
    </>
  );
}
