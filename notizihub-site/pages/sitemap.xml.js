import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const OUTPUT_DIR = path.join(process.cwd(), '..', 'auto-publisher', 'output');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://notizihub.it';

function generateSitemap(articoli) {
  const staticPages = ['', '/nicchia/finanza', '/nicchia/crypto', '/nicchia/tech',
    '/nicchia/salute', '/nicchia/viaggi', '/nicchia/motori',
    '/nicchia/gaming', '/nicchia/casa', '/nicchia/lavoro', '/nicchia/sport'];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <changefreq>daily</changefreq>
    <priority>${p === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
${articoli.map(a => `  <url>
    <loc>${SITE_URL}/${a.nicchia}/${a.slug}</loc>
    <lastmod>${a.data}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;
}

function Sitemap() { return null; }

export async function getServerSideProps({ res }) {
  const articoli = [];

  if (fs.existsSync(OUTPUT_DIR)) {
    const nicchie = fs.readdirSync(OUTPUT_DIR).filter(f =>
      fs.statSync(path.join(OUTPUT_DIR, f)).isDirectory() && !f.startsWith('.')
    );
    for (const nicchia of nicchie) {
      const dir = path.join(OUTPUT_DIR, nicchia);
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf-8'));
        if (data.slug) articoli.push({ nicchia, slug: data.slug, data: data.date || '' });
      }
    }
  }

  res.setHeader('Content-Type', 'text/xml');
  res.write(generateSitemap(articoli));
  res.end();
  return { props: {} };
}

export default Sitemap;
