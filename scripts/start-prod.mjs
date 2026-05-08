/**
 * Production startup script for Render.com
 * - No database required (JSON file storage)
 * - No Manus dependencies
 * - Quarterly article revision cron
 * - Daily sitemap refresh
 */
import { fileURLToPath } from 'url';
import path from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

async function start() {
  console.log('[Glucose Managed] Starting production server...');
  console.log('[Glucose Managed] Node:', process.version);
  console.log('[Glucose Managed] ENV:', process.env.NODE_ENV);
  console.log('[Glucose Managed] Site:', process.env.SITE_URL || 'https://glucosemanaged.com');

  // ── Cron jobs (node-cron) ────────────────────────────────────────────────
  let cron;
  try {
    cron = (await import('node-cron')).default;
  } catch {
    console.warn('[cron] node-cron not available, skipping cron jobs');
    cron = null;
  }

  if (cron) {
    // ── Date-gate drip publisher: promote gated → published daily at 3 AM ──
    cron.schedule('0 3 * * *', async () => {
      try {
        const fs = await import('fs/promises');
        const dbPath = path.join(ROOT, 'src/data/articles-db.json');
        const db = JSON.parse(await fs.readFile(dbPath, 'utf8'));
        const today = new Date().toISOString().split('T')[0];
        let promoted = 0;
        db.articles.forEach((a, i) => {
          if (a.status === 'gated' && a.publish_date && a.publish_date <= today) {
            db.articles[i].status = 'published';
            promoted++;
          }
        });
        if (promoted > 0) {
          await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
          console.log(`[cron:drip] Promoted ${promoted} articles to published`);
        }
      } catch (err) {
        console.error('[cron:drip] Error:', err.message);
      }
    });

    // ── Quarterly article revision: refresh 10 articles every 90 days ──────
    // Runs at 2:00 AM on the 1st of Jan, Apr, Jul, Oct
    cron.schedule('0 2 1 1,4,7,10 *', async () => {
      console.log('[cron] Quarterly revision pass starting...');
      try {
        const fs = await import('fs/promises');
        const dbPath = path.join(ROOT, 'src/data/articles-db.json');
        const db = JSON.parse(await fs.readFile(dbPath, 'utf8'));

        // Pick 10 oldest-updated published articles
        const candidates = [...db.articles]
          .filter(a => a.status === 'published')
          .sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at))
          .slice(0, 10);

        const now = new Date().toISOString();
        for (const article of candidates) {
          const idx = db.articles.findIndex(a => a.slug === article.slug);
          if (idx >= 0) {
            db.articles[idx].updated_at = now;
            // Append a revision note to body
            if (!db.articles[idx].body.includes('<!-- revised -->')) {
              db.articles[idx].body += `\n\n<!-- revised ${now.slice(0, 10)} -->`;
            }
          }
        }

        await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
        console.log(`[cron] Quarterly revision: updated ${candidates.length} articles`);
      } catch (err) {
        console.error('[cron] Quarterly revision failed:', err.message);
      }
    });

    // ── Daily sitemap ping to Google/Bing at 6 AM ──────────────────────────
    cron.schedule('0 6 * * *', async () => {
      const siteUrl = process.env.SITE_URL || 'https://glucosemanaged.com';
      const sitemapUrl = encodeURIComponent(`${siteUrl}/sitemap.xml`);
      try {
        const https = await import('https');
        const pingUrls = [
          `https://www.google.com/ping?sitemap=${sitemapUrl}`,
          `https://www.bing.com/ping?sitemap=${sitemapUrl}`,
        ];
        for (const url of pingUrls) {
          https.get(url, (res) => {
            console.log(`[cron] Sitemap ping ${url.includes('google') ? 'Google' : 'Bing'}: ${res.statusCode}`);
          }).on('error', () => {});
        }
      } catch (err) {
        console.error('[cron] Sitemap ping failed:', err.message);
      }
    });

    console.log('[cron] Jobs registered: quarterly revision (1 Jan/Apr/Jul/Oct 02:00), daily sitemap ping (06:00)');
  }

  // ── Start the main Express/SSR server ────────────────────────────────────
  await import('../dist/server/index.js');
}

start().catch(err => {
  console.error('[Glucose Managed] Fatal startup error:', err);
  process.exit(1);
});
