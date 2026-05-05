import express from 'express';
import { query } from '../../src/lib/db.mjs';

export const articlesRouter = express.Router();

// GET /api/articles — list published articles
articlesRouter.get('/', async (req, res) => {
  try {
    const { category, limit = '20', offset = '0' } = req.query as Record<string, string>;
    let sql = `SELECT id, slug, title, meta_description, category, tags, hero_url, reading_time, published_at, author FROM articles WHERE status = 'published'`;
    const params: any[] = [];

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    sql += ` ORDER BY published_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const { rows } = await query(sql, params);
    res.json({ articles: rows, total: rows.length });
  } catch (err) {
    console.error('[articles route]', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/articles/:slug — single article
articlesRouter.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { rows } = await query(
      `SELECT * FROM articles WHERE slug = $1 AND status = 'published'`,
      [slug]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('[article route]', err);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// GET /api/articles/category/:category — articles by category
articlesRouter.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { rows } = await query(
      `SELECT id, slug, title, meta_description, category, tags, hero_url, reading_time, published_at FROM articles WHERE status = 'published' AND category = $1 ORDER BY published_at DESC`,
      [category]
    );
    res.json({ articles: rows });
  } catch (err) {
    console.error('[category route]', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});
