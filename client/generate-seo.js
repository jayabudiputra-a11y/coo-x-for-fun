import { createClient } from '@supabase/supabase-js';
import RSS from 'rss';
import fs from 'fs';

const supabaseUrl = 'https://uezvvetwyknejcodnzus.supabase.co';
const supabaseKey = 'sb_publishable_N6LVkUKC2vYzTGRv1XPTyg_OAAxwagn';
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://coo-x-for.fun';
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
    feed_url: `${BASE_URL}/rss/recipes.xml`,
    site_url: BASE_URL,
    language: 'id',
  });

  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/add-recipe', priority: '0.6', changefreq: 'monthly' },
    { url: '/blog', priority: '0.7', changefreq: 'weekly' },
  ];

  staticPages.forEach(page => {
    sitemapXml += `  <url>\n    <loc>${BASE_URL}${page.url}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
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

  sitemapXml += `</urlset>`;

  try {
    const rssDir = './dist/rss';
    const distDir = './dist';
    
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
    if (!fs.existsSync(rssDir)) fs.mkdirSync(rssDir, { recursive: true });
    
    fs.writeFileSync(`${rssDir}/recipes.xml`, feed.xml({ indent: true }));
    fs.writeFileSync('./dist/sitemap.xml', sitemapXml);
    
    const publicRssDir = './public/rss';
    if (!fs.existsSync(publicRssDir)) fs.mkdirSync(publicRssDir, { recursive: true });
    fs.writeFileSync(`${publicRssDir}/recipes.xml`, feed.xml({ indent: true }));
    fs.writeFileSync('./public/sitemap.xml', sitemapXml);
  } catch (err) {
    process.exit(1);
  }
}

generateSEO();