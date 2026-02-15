import { createClient } from '@supabase/supabase-js';
import RSS from 'rss';
import fs from 'fs';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

async function generateSEO() {
  console.log('🚀 Memulai proses SEO...');
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Env Supabase tidak lengkap. Melewati SEO.');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const BASE_URL = 'https://www.coo-x-for.fun';
    const TODAY = new Date().toISOString().split('T')[0];

    const { data: recipes } = await supabase.from('recipes').select('title, slug, author_name');
    const { data: blogs } = await supabase.from('blog_posts').select('title, slug');

    const feed = new RSS({
      title: 'Coo-X For Fun',
      description: 'Resep & Blog Kuliner',
      feed_url: `${BASE_URL}/rss`,
      site_url: BASE_URL,
      language: 'id',
    });

    let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    const addUrl = (url, prio) => {
      sitemapXml += `  <url><loc>${BASE_URL}${url}</loc><lastmod>${TODAY}</lastmod><priority>${prio}</priority></url>\n`;
    };

    addUrl('', '1.0');
    if (recipes) recipes.forEach(r => addUrl(`/resep/${r.slug}`, '0.8'));

    sitemapXml += `</urlset>`;

    const paths = ['./dist', './dist/rss', './public', './public/rss'];
    paths.forEach(p => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); });

    fs.writeFileSync('./dist/sitemap.xml', sitemapXml);
    fs.writeFileSync('./dist/rss/index.xml', feed.xml());
    console.log('✅ SEO Berhasil dibuat.');
  } catch (err) {
    console.error('❌ SEO Gagal (tapi build tetap lanjut):', err.message);
  }
}

generateSEO();