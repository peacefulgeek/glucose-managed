import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const DB_PATH = join(ROOT, 'src/data/articles-db.json');

const db = JSON.parse(readFileSync(DB_PATH, 'utf8'));
let fixed = 0;

db.articles = db.articles.map(a => {
  let changed = false;

  // Fix status
  if (a.status !== 'published') {
    a.status = 'published';
    changed = true;
  }

  // Fix excerpt - extract from body if missing or too short
  if (!a.excerpt || a.excerpt.length < 50) {
    if (a.body) {
      const clean = a.body
        .replace(/^#+\s+.+\n/gm, '')
        .replace(/\*\*/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/\n+/g, ' ')
        .trim();
      a.excerpt = clean.substring(0, 280) + '...';
      changed = true;
    }
  }

  // Fix word_count if missing
  if (!a.word_count && a.body) {
    a.word_count = a.body.split(/\s+/).length;
    changed = true;
  }

  // Fix reading_time if missing
  if (!a.reading_time && a.word_count) {
    a.reading_time = Math.max(5, Math.round(a.word_count / 200));
    changed = true;
  }

  if (changed) fixed++;
  return a;
});

writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
console.log(`Fixed ${fixed} articles. Total: ${db.articles.length}`);

// Verify
const sample = db.articles.slice(0, 5);
console.log('Sample statuses:', sample.map(a => a.status));
console.log('Sample excerpts:', sample.map(a => (a.excerpt || '').substring(0, 60)));
console.log('Articles with FAQs:', db.articles.filter(a => a.faqs && a.faqs !== '[]').length);
console.log('Articles with excerpts:', db.articles.filter(a => a.excerpt && a.excerpt.length > 50).length);
