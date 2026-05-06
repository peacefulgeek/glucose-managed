import express from 'express';
import { query } from '../../src/lib/db.mjs';

export const sitemapRouter = express.Router();

sitemapRouter.get('/', async (req, res) => {
  try {
    const base = 'https://glucosemanaged.com';

    const { rows: articles } = await query(
      `SELECT slug, title, updated_at, published_at, hero_url FROM articles WHERE status = 'published' ORDER BY published_at DESC`
    );

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/articles', priority: '0.9', changefreq: 'daily' },
      { url: '/assessment', priority: '0.9', changefreq: 'weekly' },
      { url: '/supplements', priority: '0.8', changefreq: 'weekly' },
      { url: '/tools', priority: '0.8', changefreq: 'weekly' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
    ];

    const toDateStr = (val: any): string => {
      if (!val) return new Date().toISOString().split('T')[0];
      if (typeof val === 'string') return val.split('T')[0];
      if (val instanceof Date) return val.toISOString().split('T')[0];
      return new Date().toISOString().split('T')[0];
    };

    const escapeXml = (s: string) =>
      (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const articleEntries = (articles as any[]).map((a: any) => {
      const lastmod = toDateStr(a.updated_at || a.published_at);
      const imageTag = a.hero_url ? `
    <image:image>
      <image:loc>${escapeXml(a.hero_url)}</image:loc>
      <image:title>${escapeXml(a.title || '')}</image:title>
    </image:image>` : '';
      return `  <url>
    <loc>${base}/articles/${a.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>${imageTag}
  </url>`;
    }).join('\n');

    const staticEntries = staticPages.map(p => `  <url>
    <loc>${base}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticEntries}
${articleEntries}
</urlset>`;

    res.type('application/xml').send(xml);
  } catch (err) {
    console.error('[sitemap]', err);
    res.status(500).send('Sitemap generation failed');
  }
});
