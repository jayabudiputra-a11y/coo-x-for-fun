import { createClient } from '@supabase/supabase-js';
import RSS from 'rss';
import fs from 'fs';
import 'dotenv/config';

// Gunakan fallback string kosong agar tidak crash saat inisialisasi
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

const BASE_URL = 'https://www.coo-x-for.fun';
const TODAY = new Date().toISOString().split('T')[0];

async function generateSEO() {
  // Cek apakah env ada, jika tidak ada jangan hentikan build, lewati saja
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ SEO Warning: Supabase Env tidak ditemukan. Melewati pembuatan sitemap.');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: recipes, error: recipeError } = await supabase
      .from('recipes')
      .select('title, slug, author_name')
      .order('id', { ascending: false });

    const { data: blogs, error: blogError } = await supabase
      .from('blog_posts')
      .select('title, slug')
      .order('created_at', { ascending: false });

    if (recipeError || blogError) {
      console.error('❌ SEO Error:', recipeError || blogError);
      return; // Jangan process.exit(1) agar build utama tetap sukses
    }

    const feed = new RSS({
      title: 'Coo-X For Fun - Resep & Blog Masakan',
      description: 'Kumpulan resep masakan lezat dan artikel kuliner terbaru.',
      feed_url: `${BASE_URL}/rss`,
      site_url: BASE_URL,
      language: 'id',
    });

    let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/add-recipe', priority: '0.6', changefreq: 'monthly' },
      { url: '/blog', priority: '0.7', changefreq: 'weekly' },
      { url: '/search', priority: '0.5', changefreq: 'monthly' },
    ];

    staticPages.forEach(page => {
      const fullUrl = `${BASE_URL}${page.url === '/' ? '' : page.url}`;
      sitemapXml += `  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
    });

    if (recipes) {
      recipes.forEach((recipe) => {
        const recipeUrl = `${BASE_URL}/resep/${recipe.slug}`;
        feed.item({
          title: recipe.title,
          description: `Resep masakan lezat oleh ${recipe.author_name}`,
          url: recipeUrl,
          date: TODAY,
        });
        sitemapXml += `  <url>\n    <loc>${recipeUrl}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      });
    }

    if (blogs) {
      blogs.forEach((post) => {
        const blogUrl = `${BASE_URL}/blog/${post.slug}`;
        feed.item({
          title: post.title,
          description: `Artikel terbaru: ${post.title}`,
          url: blogUrl,
          date: TODAY,
        });
        sitemapXml += `  <url>\n    <loc>${blogUrl}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      });
    }

    sitemapXml += `</urlset>`;

    // Buat folder dist jika belum ada (untuk keamanan build)
    const dirs = ['./dist', './dist/rss', './public', './public/rss'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
    
    const rssContent = feed.xml({ indent: true });
    fs.writeFileSync('./dist/rss/index.xml', rssContent);
    fs.writeFileSync('./dist/sitemap.xml', sitemapXml);
    fs.writeFileSync('./public/rss/index.xml', rssContent);
    fs.writeFileSync('./public/sitemap.xml', sitemapXml);

    console.log('✅ SEO: Sitemap & RSS berhasil dibuat.');
  } catch (err) {
    console.error('❌ SEO Panic:', err);
    // Tetap jangan exit 1 agar website tetap live meskipun sitemap gagal
  }
}

generateSEO();