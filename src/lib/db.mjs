/**
 * Database abstraction layer.
 * Uses PostgreSQL when DATABASE_URL is set, otherwise falls back to JSON file storage.
 * This allows the site to run locally and in development without a database.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../src/data');
const DB_FILE = path.join(DATA_DIR, 'articles-db.json');

let pgPool = null;

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

// ─── JSON file fallback ───────────────────────────────────────────────────────

async function readDb() {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { articles: [] };
  }
}

async function writeDb(data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function query(sql, params = []) {
  const pool = await getPgPool();
  if (pool) {
    return pool.query(sql, params);
  }
  // JSON fallback — only supports the queries this app actually makes
  return jsonQuery(sql, params);
}

async function jsonQuery(sql, params) {
  const db = await readDb();
  const s = sql.trim().toUpperCase();

  // SELECT all published articles
  if (s.includes('SELECT') && s.includes('FROM ARTICLES') && s.includes("STATUS = 'PUBLISHED'")) {
    const rows = db.articles
      .filter(a => a.status === 'published')
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    return { rows };
  }

  // SELECT count of published
  if (s.includes('COUNT') && s.includes('FROM ARTICLES') && s.includes("STATUS = 'PUBLISHED'")) {
    const count = db.articles.filter(a => a.status === 'published').length;
    return { rows: [{ count }] };
  }

  // SELECT single article by slug
  if (s.includes('SELECT') && s.includes('FROM ARTICLES') && s.includes('SLUG')) {
    const slug = params[0];
    const rows = db.articles.filter(a => a.slug === slug);
    return { rows };
  }

  // SELECT queued articles
  if (s.includes('SELECT') && s.includes("STATUS = 'QUEUED'")) {
    const rows = db.articles
      .filter(a => a.status === 'queued')
      .sort((a, b) => new Date(a.queued_at) - new Date(b.queued_at));
    return { rows };
  }

  // INSERT article
  if (s.startsWith('INSERT INTO ARTICLES')) {
    const now = new Date().toISOString();
    const article = {
      id: Date.now(),
      slug: params[0],
      title: params[1],
      meta_description: params[2],
      og_title: params[3],
      og_description: params[4],
      category: params[5],
      tags: params[6],
      body: params[7],
      reading_time: params[8],
      status: params[9] || 'published',
      hero_url: params[10] || null,
      published_at: params[9] === 'queued' ? null : now,
      queued_at: params[9] === 'queued' ? now : null,
      created_at: now,
      updated_at: now,
      asins_used: params[11] || [],
      faq: params[12] || [],
      author: 'The Oracle Lover',
      backlink_to_oracle: params[13] || false
    };
    db.articles.push(article);
    await writeDb(db);
    return { rows: [article] };
  }

  // UPDATE article status
  if (s.startsWith('UPDATE ARTICLES SET STATUS')) {
    const id = params[0];
    const status = params[1] || 'published';
    const heroUrl = params[2] || null;
    const now = new Date().toISOString();
    db.articles = db.articles.map(a => {
      if (a.id === id || a.slug === id) {
        return { ...a, status, hero_url: heroUrl || a.hero_url, published_at: now, updated_at: now };
      }
      return a;
    });
    await writeDb(db);
    return { rows: [] };
  }

  // SELECT articles by category
  if (s.includes('SELECT') && s.includes('FROM ARTICLES') && s.includes('CATEGORY')) {
    const category = params[0];
    const rows = db.articles.filter(a => a.category === category && a.status === 'published');
    return { rows };
  }

  // SELECT all articles (no filter)
  if (s.includes('SELECT') && s.includes('FROM ARTICLES') && !s.includes('WHERE')) {
    return { rows: db.articles };
  }

  return { rows: [] };
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
        author VARCHAR(100) DEFAULT 'The Oracle Lover',
        backlink_to_oracle BOOLEAN DEFAULT false,
        last_refreshed_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
      CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
      CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
    `);
    console.log('[db] PostgreSQL schema initialized');
  } else {
    await readDb(); // ensure file exists
    console.log('[db] Using JSON file storage (no DATABASE_URL set)');
  }
}
