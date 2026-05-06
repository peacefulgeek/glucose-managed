/**
 * Seed 200 articles from the topic list with date-gating
 * Articles are published at 5/day starting from a base date
 * Run: node scripts/seed-200-articles.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

const DB_PATH = join(ROOT, 'src/data/articles-db.json');
const ARTICLES_PER_DAY = 5;
const BASE_DATE = new Date('2025-01-01'); // Start date for date-gating

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
  const dayOffset = Math.floor(index / ARTICLES_PER_DAY);
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString();
}

function readDb() {
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf8'));
  } catch {
    return { articles: [] };
  }
}

function writeDb(db) {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function estimateReadingTime(text) {
  const words = text.split(/\s+/).length;
  return Math.max(5, Math.round(words / 200));
}

async function generateArticle(topic) {
  const prompt = `You are The Oracle Lover — a metabolic health writer with a science degree, zero food guilt, and a direct, empowering voice. You write for intelligent adults who want real information, not watered-down health advice.

Write a comprehensive, evidence-based article on: "${topic.title}"

REQUIREMENTS:
- Minimum 1800 words (aim for 2000-2200)
- Voice: Direct, warm, science-backed, no fluff, no guilt-tripping
- Include at least 3 specific research citations (format: [Author et al., Year])
- Include a TL;DR section at the very beginning (3-4 bullet points)
- Include at least 2 internal link suggestions formatted as: [[INTERNAL: slug-here | Link text here]]
- Include at least 1 external authoritative link (PubMed, NIH, ADA, etc.)
- Structure with clear H2 and H3 headings
- End with a "Bottom Line" section
- Include 5 FAQ questions and answers at the end in this exact format:
  FAQ: Question here?
  ANSWER: Answer here (2-3 sentences).

TONE GUIDELINES:
- "Prediabetes doesn't have to become diabetes. Full stop."
- Treat the reader like an intelligent adult
- No hedging with "consult your doctor before..." every paragraph
- Acknowledge complexity without being overwhelming
- Science-forward but accessible

Category: ${CATEGORY_LABELS[topic.category]}
Slug: ${topic.slug}

Write the full article now. Start with the TL;DR section.`;

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3000,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

function extractFaqs(body) {
  const faqs = [];
  const faqRegex = /FAQ:\s*(.+?)\?\s*\nANSWER:\s*(.+?)(?=\nFAQ:|\n\n|$)/gs;
  let match;
  while ((match = faqRegex.exec(body)) !== null) {
    faqs.push({ q: match[1].trim() + '?', a: match[2].trim() });
  }
  return faqs;
}

function extractTldr(body) {
  const tldrMatch = body.match(/TL;DR[:\s]*\n([\s\S]*?)(?=\n##|\n#)/i);
  if (tldrMatch) return tldrMatch[1].trim();
  return null;
}

function qualityGate(body, title) {
  const wordCount = body.split(/\s+/).length;
  if (wordCount < 1500) return { pass: false, reason: `Too short: ${wordCount} words` };
  if (!body.includes('##')) return { pass: false, reason: 'No H2 headings found' };
  if (!body.match(/\[\w[\w\s]+et al\.,?\s*\d{4}\]|\[\d{4}\]/)) return { pass: false, reason: 'No citations found' };
  return { pass: true };
}

async function main() {
  const { TOPICS } = await import('./seed-500-topics.mjs');
  const db = readDb();
  const existingSlugs = new Set(db.articles.map(a => a.slug));

  const remaining = TOPICS.filter(t => !existingSlugs.has(t.slug));
  console.log(`Total topics: ${TOPICS.length}`);
  console.log(`Already seeded: ${existingSlugs.size}`);
  console.log(`Remaining to generate: ${remaining.length}`);

  if (remaining.length === 0) {
    console.log('All articles already seeded!');
    return;
  }

  let generated = 0;
  let failed = 0;

  for (let i = 0; i < remaining.length; i++) {
    const topic = remaining[i];
    const globalIndex = TOPICS.findIndex(t => t.slug === topic.slug);
    const publishDate = getPublishDate(globalIndex);

    console.log(`\n[${i + 1}/${remaining.length}] Generating: ${topic.title.substring(0, 60)}...`);

    let body = null;
    let attempts = 0;

    while (attempts < 3 && !body) {
      try {
        const raw = await generateArticle(topic);
        const qg = qualityGate(raw, topic.title);
        if (qg.pass) {
          body = raw;
        } else {
          console.log(`  Quality gate failed: ${qg.reason}. Retrying...`);
          attempts++;
        }
      } catch (err) {
        console.log(`  Error: ${err.message}. Retrying...`);
        attempts++;
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (!body) {
      console.log(`  FAILED after 3 attempts. Skipping.`);
      failed++;
      continue;
    }

    const faqs = extractFaqs(body);
    const wordCount = body.split(/\s+/).length;

    const article = {
      id: Date.now() + i,
      slug: topic.slug,
      title: topic.title,
      category: topic.category,
      body,
      excerpt: body.substring(0, 300).replace(/[#*\[\]]/g, '').trim() + '...',
      hero_url: CATEGORY_IMAGES[topic.category] || CATEGORY_IMAGES.diagnosis,
      reading_time: estimateReadingTime(body),
      word_count: wordCount,
      faqs: JSON.stringify(faqs),
      status: 'published',
      published_at: publishDate,
      updated_at: publishDate,
      meta_title: topic.title,
      meta_description: body.substring(0, 155).replace(/[#*\[\]]/g, '').trim(),
    };

    // Re-read DB before writing to avoid race conditions
    const freshDb = readDb();
    freshDb.articles.push(article);
    writeDb(freshDb);

    generated++;
    console.log(`  ✓ ${wordCount} words, ${faqs.length} FAQs, published: ${publishDate.split('T')[0]}`);

    // Rate limiting
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n═══════════════════════════════════`);
  console.log(`Generated: ${generated}`);
  console.log(`Failed: ${failed}`);
  const finalDb = readDb();
  console.log(`Total in DB: ${finalDb.articles.length}`);
}

main().catch(console.error);
