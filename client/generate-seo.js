import { createClient } from '@supabase/supabase-js';
import RSS from 'rss';
import fs from 'fs';

const supabaseUrl = 'https://uezvvetwyknejcodnzus.supabase.co';
const supabaseKey = 'sb_publishable_N6LVkUKC2vYzTGRv1XPTyg_OAAxwagn';
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://www.coo-x-for.fun';
const TODAY = new Date().toISOString().split('T')[0];

async function generateSEO() {
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('title, slug, author_name')
    .order('id', { ascending: false });

  if (error) {
    process.exit(1);
  }

  const feed = new RSS({
    title: 'Coo-X For Fun - Resep Masakan',
    description: 'Kumpulan resep masakan lezat dan mudah.',
    feed_url: `${BASE_URL}/rss.xml`,
    site_url: BASE_URL,
    language: 'id',
  });

  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/#/add-recipe', priority: '0.6', changefreq: 'monthly' },
    { url: '/#/blog', priority: '0.7', changefreq: 'weekly' },
  ];

  staticPages.forEach(page => {
    const fullUrl = page.url === '/' ? BASE_URL : `${BASE_URL}${page.url}`;
    sitemapXml += `  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
  });

  if (recipes) {
    recipes.forEach((recipe) => {
      const recipeUrl = `${BASE_URL}/#/resep/${recipe.slug}`;
      feed.item({
        title: recipe.title,
        description: `Resep masakan lezat oleh ${recipe.author_name}`,
        url: recipeUrl,
        date: TODAY,
      });
      sitemapXml += `  <url>\n    <loc>${recipeUrl}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });
  }

  sitemapXml += `</urlset>`;

  try {
    const dirs = ['./dist/rss', './public/rss', './dist', './public'];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
    
    fs.writeFileSync('./dist/rss/index.xml', feed.xml({ indent: true }));
    fs.writeFileSync('./dist/sitemap.xml', sitemapXml);
    fs.writeFileSync('./public/rss/index.xml', feed.xml({ indent: true }));
    fs.writeFileSync('./public/sitemap.xml', sitemapXml);
  } catch (err) {
    process.exit(1);
  }
}

generateSEO();