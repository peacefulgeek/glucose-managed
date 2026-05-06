/**
 * Fast parallel seeder — generates all remaining articles with concurrency
 * Uses gpt-4.1-mini for speed, 10 concurrent requests
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const DB_PATH = join(ROOT, 'src/data/articles-db.json');
const CONCURRENCY = 8;
const ARTICLES_PER_DAY = 5;
const BASE_DATE = new Date('2025-01-01');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1',
});

const CATEGORY_IMAGES = {
  diagnosis: 'https://glucose-managed.b-cdn.net/images/hero-diagnosis.webp',
  diet: 'https://glucose-managed.b-cdn.net/images/hero-diet.webp',
  exercise: 'https://glucose-managed.b-cdn.net/images/hero-exercise.webp',
  supplements: 'https://glucose-managed.b-cdn.net/images/hero-supplements.webp',
  monitoring: 'https://glucose-managed.b-cdn.net/images/hero-monitoring.webp',
  lifestyle: 'https://glucose-managed.b-cdn.net/images/hero-lifestyle.webp',
  mindset: 'https://glucose-managed.b-cdn.net/images/hero-mindset.webp',
  reversal: 'https://glucose-managed.b-cdn.net/images/hero-reversal.webp',
  medication: 'https://glucose-managed.b-cdn.net/images/hero-diagnosis.webp',
};

const CATEGORY_LABELS = {
  diagnosis: 'Diagnosis & Testing',
  diet: 'Diet & Nutrition',
  exercise: 'Exercise & Movement',
  supplements: 'Supplements',
  monitoring: 'Monitoring & Tracking',
  lifestyle: 'Lifestyle Factors',
  mindset: 'Mindset & Psychology',
  reversal: 'Reversal Protocols',
  medication: 'Medication & Treatment',
};

function getPublishDate(index) {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() + Math.floor(index / ARTICLES_PER_DAY));
  return d.toISOString();
}

function readDb() {
  try { return JSON.parse(readFileSync(DB_PATH, 'utf8')); }
  catch { return { articles: [] }; }
}

function writeDb(db) {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// Thread-safe write: read fresh, append, write
const writeLock = { locked: false, queue: [] };
async function safeAppend(article) {
  return new Promise((resolve) => {
    const doWrite = () => {
      writeLock.locked = true;
      const db = readDb();
      // Dedup check
      if (!db.articles.find(a => a.slug === article.slug)) {
        db.articles.push(article);
        writeDb(db);
      }
      writeLock.locked = false;
      if (writeLock.queue.length > 0) {
        const next = writeLock.queue.shift();
        next();
      }
      resolve();
    };
    if (writeLock.locked) {
      writeLock.queue.push(doWrite);
    } else {
      doWrite();
    }
  });
}

async function generateArticle(topic) {
  const prompt = `You are The Oracle Lover — metabolic health writer, science-backed, zero food guilt, direct and empowering. Write for intelligent adults who want real information.

Write a comprehensive article: "${topic.title}"
Category: ${CATEGORY_LABELS[topic.category]}

REQUIREMENTS (non-negotiable):
- 1800-2200 words minimum
- Start with ## TL;DR section (3-4 bullet points)
- At least 4 H2 headings (##)
- At least 3 research citations formatted as [Author et al., Year] or [Study Name, Year]
- At least 1 external link to PubMed, NIH, or ADA
- End with ## Bottom Line section
- Include 5 FAQs at the end in EXACT format:
FAQ: [Question]?
ANSWER: [2-3 sentence answer].

VOICE: Direct, warm, science-forward. "Prediabetes doesn't have to become diabetes." No hedging every paragraph.

Write the full article now, starting with ## TL;DR`;

  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3500,
    temperature: 0.72,
  });
  return response.choices[0].message.content;
}

function extractFaqs(body) {
  const faqs = [];
  const re = /FAQ:\s*(.+?)\?\s*\nANSWER:\s*(.+?)(?=\nFAQ:|\n##|$)/gs;
  let m;
  while ((m = re.exec(body)) !== null) {
    faqs.push({ q: m[1].trim() + '?', a: m[2].trim() });
  }
  return faqs;
}

function qualityGate(body) {
  const wc = body.split(/\s+/).length;
  if (wc < 1600) return { pass: false, reason: `${wc} words` };
  if (!body.includes('##')) return { pass: false, reason: 'no headings' };
  return { pass: true, wc };
}

async function processOne(topic, globalIndex, label) {
  let body = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const raw = await generateArticle(topic);
      const qg = qualityGate(raw);
      if (qg.pass) { body = raw; break; }
      console.log(`  [${label}] QG fail (${qg.reason}), retry ${attempt + 1}`);
    } catch (e) {
      console.log(`  [${label}] Error: ${e.message}, retry ${attempt + 1}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (!body) {
    console.log(`  [${label}] FAILED after 3 attempts — skipping`);
    return false;
  }

  const wc = body.split(/\s+/).length;
  const faqs = extractFaqs(body);
  const clean = body.replace(/<[^>]+>/g, '').replace(/[#*\[\]]/g, '').replace(/\s+/g, ' ').trim();

  const article = {
    id: Date.now() + Math.random(),
    slug: topic.slug,
    title: topic.title,
    category: topic.category,
    body,
    excerpt: clean.substring(0, 280) + '...',
    hero_url: CATEGORY_IMAGES[topic.category] || CATEGORY_IMAGES.diagnosis,
    reading_time: Math.max(5, Math.round(wc / 200)),
    word_count: wc,
    faqs: JSON.stringify(faqs),
    status: 'published',
    published_at: getPublishDate(globalIndex),
    updated_at: getPublishDate(globalIndex),
    meta_title: topic.title,
    meta_description: clean.substring(0, 155),
  };

  await safeAppend(article);
  console.log(`  ✓ [${label}] ${wc}w, ${faqs.length} FAQs → ${article.published_at.split('T')[0]}`);
  return true;
}

async function runBatch(batch, startLabel) {
  return Promise.all(batch.map((item, i) =>
    processOne(item.topic, item.globalIndex, `${startLabel + i + 1}/${200}`)
  ));
}

async function main() {
  const { TOPICS } = await import('./seed-500-topics.mjs');
  const db = readDb();
  const existingSlugs = new Set(db.articles.map(a => a.slug));
  const remaining = TOPICS
    .map((t, i) => ({ topic: t, globalIndex: i }))
    .filter(({ topic }) => !existingSlugs.has(topic.slug));

  console.log(`Total topics: ${TOPICS.length}`);
  console.log(`Already seeded: ${existingSlugs.size}`);
  console.log(`Remaining: ${remaining.length}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Estimated time: ~${Math.ceil(remaining.length / CONCURRENCY * 8 / 60)} minutes\n`);

  if (remaining.length === 0) {
    console.log('All done!');
    return;
  }

  let done = 0;
  let failed = 0;

  for (let i = 0; i < remaining.length; i += CONCURRENCY) {
    const batch = remaining.slice(i, i + CONCURRENCY);
    console.log(`\n[Batch ${Math.floor(i / CONCURRENCY) + 1}] Processing ${batch.length} articles...`);
    const results = await runBatch(batch, i);
    done += results.filter(Boolean).length;
    failed += results.filter(r => !r).length;

    const current = readDb().articles.length;
    console.log(`  → DB now has ${current} articles total`);
  }

  const final = readDb();
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`DONE. Generated: ${done}, Failed: ${failed}`);
  console.log(`Total articles in DB: ${final.articles.length}`);
}

main().catch(console.error);
