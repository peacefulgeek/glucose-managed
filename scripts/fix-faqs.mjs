/**
 * Fix FAQ data for articles that are missing it
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const DB_FILE = path.join(ROOT, 'src/data/articles-db.json');

async function main() {
  const { default: OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY });

  const db = JSON.parse(readFileSync(DB_FILE, 'utf8'));
  const missingFaq = db.articles.filter(a => !a.faq || a.faq.length === 0);
  console.log(`[fix-faqs] ${missingFaq.length} articles missing FAQs`);

  for (const article of missingFaq) {
    console.log(`[fix-faqs] Generating FAQs for: ${article.slug}`);
    try {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        messages: [{
          role: 'user',
          content: `Based on this article titled "${article.title}" about ${article.category}, generate 5 FAQ questions and answers that would appear in a FAQ schema. Return ONLY valid JSON array: [{"question":"...","answer":"..."},...]. No markdown fences.`
        }],
        temperature: 0.5,
        max_tokens: 1000,
      });

      const raw = response.content[0].text.trim()
        .replace(/^```json?\n?/, '').replace(/\n?```$/, '');
      const faqs = JSON.parse(raw);
      article.faq = faqs;
      console.log(`  ✓ Generated ${faqs.length} FAQs`);
    } catch (err) {
      console.error(`  Error:`, err.message);
      // Add placeholder FAQs
      article.faq = [
        {
          question: `What is ${article.title}?`,
          answer: article.meta_description || 'See the full article for details.'
        }
      ];
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  console.log('[fix-faqs] Done!');
}

main().catch(console.error);
