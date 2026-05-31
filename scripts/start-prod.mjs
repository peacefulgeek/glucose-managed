/**
 * Production startup script for Render.com
 * - Articles served from Bunny CDN (no local JSON file needed)
 * - Quarterly article revision cron (1 Jan/Apr/Jul/Oct 02:00)
 * - Daily drip cron: promotes gated → published at 3 AM (5/week Mon–Fri)
 * - Daily sitemap ping at 6 AM
 */
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CDN_BASE        = 'https://glucose-managed.b-cdn.net';
const CDN_INDEX       = `${CDN_BASE}/articles-index.json`;
const BUNNY_API_KEY   = process.env.BUNNY_API_KEY || '98fa03b8-e96f-475e-a02df024fe4f-c640-47b9';
const BUNNY_HOST      = 'ny.storage.bunnycdn.com';
const BUNNY_ZONE      = 'glucose-managed';

// ── Bunny helpers ─────────────────────────────────────────────────────────────
async function cdnGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CDN fetch failed: ${res.status} ${url}`);
  return res.json();
}

async function bunnyPut(filePath, body) {
  const url = `https://${BUNNY_HOST}/${BUNNY_ZONE}/${filePath}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Bunny PUT failed: ${res.status} ${filePath}`);
  return true;
}

// ── Drip: promote gated articles whose publish_date <= today ─────────────────
async function runDrip() {
  const today = new Date().toISOString().slice(0, 10);
  // Only run Mon–Fri (5/week)
  const dow = new Date().getUTCDay(); // 0=Sun, 6=Sat
  if (dow === 0 || dow === 6) {
    console.log('[cron:drip] Weekend — skipping');
    return;
  }

  const { articles } = await cdnGet(CDN_INDEX);
  const toPromote = articles.filter(
    a => a.status === 'gated' && a.publish_date && a.publish_date <= today
  );

  if (toPromote.length === 0) {
    console.log('[cron:drip] No articles to promote today');
    return;
  }

  const now = new Date().toISOString();
  for (const a of toPromote) {
    a.status = 'published';
    a.published_at = now;

    // Update individual article JSON on CDN
    try {
      const full = await cdnGet(`${CDN_BASE}/articles/${a.slug}.json`);
      full.status = 'published';
      full.published_at = now;
      await bunnyPut(`articles/${a.slug}.json`, full);
    } catch (err) {
      console.error(`[cron:drip] Failed to update ${a.slug}:`, err.message);
    }
  }

  // Re-upload index
  await bunnyPut('articles-index.json', { articles });
  console.log(`[cron:drip] Promoted ${toPromote.length} articles: ${toPromote.map(a => a.slug).slice(0, 3).join(', ')}${toPromote.length > 3 ? '...' : ''}`);
}

// ── Quarterly revision: touch 10 oldest published articles ───────────────────
async function runQuarterlyRevision() {
  console.log('[cron:revision] Quarterly revision starting...');
  const { articles } = await cdnGet(CDN_INDEX);

  const candidates = [...articles]
    .filter(a => a.status === 'published')
    .sort((a, b) => new Date(a.published_at) - new Date(b.published_at))
    .slice(0, 10);

  const now = new Date().toISOString();
  for (const a of candidates) {
    try {
      const full = await cdnGet(`${CDN_BASE}/articles/${a.slug}.json`);
      full.last_refreshed_at = now;
      // Append revision marker to body
      if (full.body && !full.body.includes('<!-- revised -->')) {
        full.body += `\n\n<!-- revised ${now.slice(0, 10)} -->`;
      }
      await bunnyPut(`articles/${a.slug}.json`, full);
      // Update index entry
      const idx = articles.findIndex(x => x.slug === a.slug);
      if (idx >= 0) articles[idx].last_refreshed_at = now;
    } catch (err) {
      console.error(`[cron:revision] Failed ${a.slug}:`, err.message);
    }
  }

  await bunnyPut('articles-index.json', { articles });
  console.log(`[cron:revision] Updated ${candidates.length} articles`);
}

async function start() {
  console.log('[Glucose Managed] Starting production server...');
  console.log('[Glucose Managed] Node:', process.version);
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
    // Daily drip: promote gated → published at 3 AM (Mon–Fri = 5/week)
    cron.schedule('0 3 * * *', async () => {
      try { await runDrip(); }
      catch (err) { console.error('[cron:drip] Error:', err.message); }
    });

    // Quarterly revision: 1 Jan/Apr/Jul/Oct at 2 AM
    cron.schedule('0 2 1 1,4,7,10 *', async () => {
      try { await runQuarterlyRevision(); }
      catch (err) { console.error('[cron:revision] Error:', err.message); }
    });

    // Daily sitemap ping to Google/Bing at 6 AM
    cron.schedule('0 6 * * *', async () => {
      const siteUrl = process.env.SITE_URL || 'https://glucosemanaged.com';
      const sitemapUrl = encodeURIComponent(`${siteUrl}/sitemap.xml`);
      try {
        const pingUrls = [
          `https://www.google.com/ping?sitemap=${sitemapUrl}`,
          `https://www.bing.com/ping?sitemap=${sitemapUrl}`,
        ];
        for (const url of pingUrls) {
          fetch(url).then(r => console.log(`[cron] Sitemap ping ${url.includes('google') ? 'Google' : 'Bing'}: ${r.status}`)).catch(() => {});
        }
      } catch (err) {
        console.error('[cron] Sitemap ping failed:', err.message);
      }
    });

    console.log('[cron] Jobs registered: drip (03:00 Mon–Fri, 5/week), quarterly revision (1 Jan/Apr/Jul/Oct 02:00), sitemap ping (06:00)');
  }

  // ── Start the main Express/SSR server ────────────────────────────────────────
  process.env.NODE_ENV = 'production';
  await import('../dist/server/index.js');
}

start().catch(err => {
  console.error('[Glucose Managed] Fatal startup error:', err);
  process.exit(1);
});
