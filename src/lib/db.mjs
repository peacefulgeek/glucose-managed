/**
 * Database abstraction layer.
 * Uses PostgreSQL when DATABASE_URL is set.
 * Falls back to Bunny CDN JSON (globally cached, fast).
 * 
 * CDN URLs:
 *   Index:   https://glucose-managed.b-cdn.net/articles-index.json
 *   Article: https://glucose-managed.b-cdn.net/articles/{slug}.json
 */

const CDN_BASE = 'https://glucose-managed.b-cdn.net';
const CDN_INDEX = `${CDN_BASE}/articles-index.json`;

let pgPool = null;

// ─── In-memory CDN cache (TTL: 5 minutes) ────────────────────────────────────
let _indexCache = null;
let _indexCacheAt = 0;
const INDEX_TTL_MS = 5 * 60 * 1000;

async function fetchIndex() {
  const now = Date.now();
  if (_indexCache && now - _indexCacheAt < INDEX_TTL_MS) return _indexCache;
  const res = await fetch(CDN_INDEX);
  if (!res.ok) throw new Error(`CDN index fetch failed: ${res.status}`);
  _indexCache = await res.json();
  _indexCacheAt = now;
  return _indexCache;
}

async function fetchArticle(slug) {
  const url = `${CDN_BASE}/articles/${slug}.json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function getPgPool() {
  if (pgPool) return pgPool;
  if (!process.env.DATABASE_URL) return null;
  try {
    const { default: pg } = await import('pg');
    const { Pool } = pg;
    pgPool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    return pgPool;
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function query(sql, params = []) {
  const pool = await getPgPool();
  if (pool) {
    return pool.query(sql, params);
  }
  // CDN fallback
  return cdnQuery(sql, params);
}

async function cdnQuery(sql, params) {
  const s = sql.trim().toUpperCase();

  // All other SELECT queries use the index
  const { articles } = await fetchIndex();

  // SELECT single article by slug — only when WHERE slug = $1 (not just SLUG in column list)
  if (s.includes('WHERE') && s.includes('SLUG = $1') && params[0] && !s.includes('LIMIT')) {
    const slug = params[0];
    // Try full article from CDN first (has body)
    const article = await fetchArticle(slug);
    if (!article) return { rows: [] };
    // Only return if status matches query
    if (s.includes("STATUS = 'PUBLISHED'") && article.status !== 'published') return { rows: [] };
    return { rows: [article] };
  }

  // SELECT count of published
  if (s.includes('COUNT') && s.includes("STATUS = 'PUBLISHED'")) {
    const count = articles.filter(a => a.status === 'published').length;
    return { rows: [{ count }] };
  }

  // SELECT articles by category — only when WHERE ... category = $1
  if (s.includes('CATEGORY = $1') && params[0] && typeof params[0] === 'string') {
    const category = params[0];
    const rows = articles
      .filter(a => a.category === category && a.status === 'published')
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    return { rows };
  }

  // SELECT all published articles (with optional limit/offset)
  if (s.includes("STATUS = 'PUBLISHED'")) {
    let rows = articles
      .filter(a => a.status === 'published')
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    // Apply limit/offset from params (last two params)
    if (params.length >= 2) {
      const limit  = parseInt(params[params.length - 2]) || 20;
      const offset = parseInt(params[params.length - 1]) || 0;
      rows = rows.slice(offset, offset + limit);
    }
    return { rows };
  }

  // SELECT queued articles
  if (s.includes("STATUS = 'QUEUED'")) {
    const rows = articles
      .filter(a => a.status === 'queued')
      .sort((a, b) => new Date(a.queued_at) - new Date(b.queued_at));
    return { rows };
  }

  // SELECT all articles (no filter)
  if (s.includes('SELECT') && s.includes('FROM ARTICLES') && !s.includes('WHERE')) {
    return { rows: articles };
  }

  return { rows: [] };
}

// ─── Write operations (CDN is read-only; writes go to Bunny via API) ──────────

const BUNNY_API_KEY = process.env.BUNNY_API_KEY || '98fa03b8-e96f-475e-a02df024fe4f-c640-47b9';
const BUNNY_STORAGE_HOST = 'ny.storage.bunnycdn.com';
const BUNNY_ZONE = 'glucose-managed';

async function bunnyPut(path, body) {
  const url = `https://${BUNNY_STORAGE_HOST}/${BUNNY_ZONE}/${path}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.ok;
}

export async function initDb() {
  const pool = await getPgPool();
  if (pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title TEXT NOT NULL,
        meta_description TEXT,
        og_title TEXT,
        og_description TEXT,
        category VARCHAR(100),
        tags JSONB DEFAULT '[]',
        body TEXT NOT NULL,
        reading_time INT DEFAULT 7,
        status VARCHAR(20) DEFAULT 'published',
        hero_url TEXT,
        published_at TIMESTAMPTZ,
        queued_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        asins_used JSONB DEFAULT '[]',
        faq JSONB DEFAULT '[]',
        author VARCHAR(100) DEFAULT 'GlucoseManaged',
        backlink_to_oracle BOOLEAN DEFAULT false,
        last_refreshed_at TIMESTAMPTZ,
        publish_date DATE
      );
      CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
      CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
      CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
    `);
    console.log('[db] PostgreSQL schema initialized');
  } else {
    console.log('[db] Using Bunny CDN storage (no DATABASE_URL set)');
  }
}

/**
 * Promote gated articles whose publish_date <= today.
 * Updates both the CDN index and individual article JSON files.
 * Called by the daily drip cron.
 */
export async function promoteGatedArticles() {
  const today = new Date().toISOString().slice(0, 10);
  const pool = await getPgPool();

  if (pool) {
    const { rows } = await pool.query(
      `UPDATE articles SET status = 'published', published_at = NOW(), updated_at = NOW()
       WHERE status = 'gated' AND publish_date <= $1
       RETURNING slug, title`,
      [today]
    );
    return rows;
  }

  // CDN path: fetch index, promote matching articles, re-upload index + individual files
  const { articles } = await fetchIndex();
  const toPromote = articles.filter(a => a.status === 'gated' && a.publish_date && a.publish_date <= today);

  if (toPromote.length === 0) return [];

  const now = new Date().toISOString();
  for (const a of toPromote) {
    a.status = 'published';
    a.published_at = now;
    // Update individual article JSON on CDN
    const full = await fetchArticle(a.slug);
    if (full) {
      full.status = 'published';
      full.published_at = now;
      await bunnyPut(`articles/${a.slug}.json`, full);
    }
  }

  // Re-upload the index
  await bunnyPut('articles-index.json', { articles });
  _indexCache = null; // bust cache

  console.log(`[drip] Promoted ${toPromote.length} articles: ${toPromote.map(a => a.slug).join(', ')}`);
  return toPromote;
}
