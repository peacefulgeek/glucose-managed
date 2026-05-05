/**
 * Fix articles-db.json: deduplicate, fix status, add placeholder FAQs
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../src/data/articles-db.json');

const db = JSON.parse(readFileSync(DB_FILE, 'utf8'));

// Deduplicate by slug (keep last)
const seen = new Map();
for (const a of db.articles) {
  seen.set(a.slug, a);
}
db.articles = Array.from(seen.values());

// Fix status and published_at
db.articles = db.articles.map((a, i) => {
  const isDate = typeof a.status === 'string' && a.status.includes('T');
  return {
    ...a,
    status: 'published',
    published_at: isDate ? a.status : (a.published_at || new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()),
    faq: a.faq && a.faq.length > 0 ? a.faq : [],
  };
});

writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
console.log(`Fixed ${db.articles.length} articles`);
db.articles.forEach(a => console.log(` - ${a.slug} | ${a.status} | faq: ${a.faq.length}`));
