/**
 * Data layer — Bunny CDN JSON only.
 *
 * Read:  https://glucose-managed.b-cdn.net/articles-index.json  (lightweight, cached 5 min)
 *        https://glucose-managed.b-cdn.net/articles/{slug}.json  (full article with body)
 *
 * Write: Bunny Storage API (promote, refresh)
 */

const CDN_BASE          = 'https://glucose-managed.b-cdn.net';
const CDN_INDEX         = `${CDN_BASE}/articles-index.json`;
const BUNNY_STORAGE_HOST = 'ny.storage.bunnycdn.com';
const BUNNY_ZONE        = 'glucose-managed';
const BUNNY_API_KEY     = process.env.BUNNY_API_KEY || '98fa03b8-e96f-475e-a02df024fe4f-c640-47b9';

// ─── In-memory index cache (TTL: 5 min) ──────────────────────────────────────
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
  const res = await fetch(`${CDN_BASE}/articles/${slug}.json`);
  if (!res.ok) return null;
  return res.json();
}

async function bunnyPut(path, body) {
  const url = `https://${BUNNY_STORAGE_HOST}/${BUNNY_ZONE}/${path}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.ok;
}

// ─── Query router (mirrors SQL semantics against CDN JSON) ───────────────────

export async function query(sql, params = []) {
  const s = sql.trim().toUpperCase();
  const { articles } = await fetchIndex();

  // Single article by slug — WHERE slug = $1 (no LIMIT means it's not a list query)
  if (s.includes('WHERE') && s.includes('SLUG = $1') && params[0] && !s.includes('LIMIT')) {
    const article = await fetchArticle(params[0]);
    if (!article) return { rows: [] };
    if (s.includes("STATUS = 'PUBLISHED'") && article.status !== 'published') return { rows: [] };
    return { rows: [article] };
  }

  // COUNT of published articles
  if (s.includes('COUNT') && s.includes("STATUS = 'PUBLISHED'")) {
    const count = articles.filter(a => a.status === 'published').length;
    return { rows: [{ count }] };
  }

  // Articles by category — WHERE ... category = $1
  if (s.includes('CATEGORY = $1') && params[0] && typeof params[0] === 'string') {
    const rows = articles
      .filter(a => a.category === params[0] && a.status === 'published')
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    return { rows };
  }

  // Published article list (with optional limit/offset — last two params)
  if (s.includes("STATUS = 'PUBLISHED'")) {
    let rows = articles
      .filter(a => a.status === 'published')
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    if (params.length >= 2) {
      const limit  = parseInt(params[params.length - 2]) || 20;
      const offset = parseInt(params[params.length - 1]) || 0;
      rows = rows.slice(offset, offset + limit);
    }
    return { rows };
  }

  // Gated articles (for drip cron)
  if (s.includes("STATUS = 'GATED'")) {
    const rows = articles
      .filter(a => a.status === 'gated')
      .sort((a, b) => new Date(a.publish_date) - new Date(b.publish_date));
    return { rows };
  }

  // All articles (no filter)
  if (s.includes('SELECT') && s.includes('FROM ARTICLES') && !s.includes('WHERE')) {
    return { rows: articles };
  }

  return { rows: [] };
}

// ─── Init (no-op for CDN-only) ────────────────────────────────────────────────

export async function initDb() {
  console.log('[db] CDN-only mode — Bunny CDN glucose-managed storage zone');
}

// ─── Drip: promote gated articles whose publish_date <= today ────────────────

export async function promoteGatedArticles() {
  const today = new Date().toISOString().slice(0, 10);
  const { articles } = await fetchIndex();
  const toPromote = articles.filter(
    a => a.status === 'gated' && a.publish_date && a.publish_date <= today
  );

  if (toPromote.length === 0) return [];

  const now = new Date().toISOString();
  for (const a of toPromote) {
    a.status = 'published';
    a.published_at = now;
    const full = await fetchArticle(a.slug);
    if (full) {
      full.status = 'published';
      full.published_at = now;
      await bunnyPut(`articles/${a.slug}.json`, full);
    }
  }

  await bunnyPut('articles-index.json', { articles });
  _indexCache = null; // bust in-memory cache

  console.log(`[drip] Promoted ${toPromote.length}: ${toPromote.map(a => a.slug).join(', ')}`);
  return toPromote;
}
