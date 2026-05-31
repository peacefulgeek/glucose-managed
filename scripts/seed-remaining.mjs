/**
 * Seed remaining articles (20-30)
 */

const REMAINING_ARTICLES = [
  {
    slug: 'home-blood-glucose-testing-guide',
    title: 'Home Blood Glucose Testing for Prediabetes: What to Measure and When',
    category: 'monitoring',
    tags: ['blood glucose testing', 'glucometer', 'home testing', 'prediabetes', 'monitoring'],
    focus: 'Guide to home glucose monitoring for prediabetes. Fasting glucose targets, 1h and 2h postprandial targets, best times to test. Equipment recommendations. What patterns to track.',
  },
  {
    slug: 'time-in-range-cgm-metric-explained',
    title: 'Time in Range: The CGM Metric That Matters More Than Your A1c',
    category: 'monitoring',
    tags: ['time in range', 'CGM', 'glucose variability', 'A1c', 'monitoring'],
    focus: 'Explain TIR (70-180 mg/dL), why it captures what A1c misses (glucose variability), the Battelino et al. consensus targets, and how to use TIR data to make dietary decisions.',
  },
  {
    slug: 'glucose-variability-why-spikes-matter',
    title: 'Glucose Variability: Why Spikes Matter Even When Your A1c Looks Fine',
    category: 'monitoring',
    tags: ['glucose variability', 'glucose spikes', 'postprandial glucose', 'oxidative stress', 'monitoring'],
    focus: 'Explain glucose variability and why postprandial spikes cause oxidative stress and endothelial damage even with normal A1c. Cover the Monnier et al. research. Practical implications.',
  },
  {
    slug: 'sleep-and-blood-sugar-bidirectional-relationship',
    title: 'Sleep and Blood Sugar: The Bidirectional Relationship That Most People Miss',
    category: 'lifestyle',
    tags: ['sleep', 'blood sugar', 'cortisol', 'insulin resistance', 'lifestyle'],
    focus: 'Cover the Spiegel et al. research on sleep restriction and insulin resistance. Mechanisms: cortisol, growth hormone, ghrelin/leptin. Practical sleep hygiene for glucose management.',
  },
  {
    slug: 'stress-cortisol-blood-sugar-mechanism',
    title: 'How Chronic Stress Raises Your Blood Sugar (Even When You\'re Eating Perfectly)',
    category: 'lifestyle',
    tags: ['stress', 'cortisol', 'blood sugar', 'HPA axis', 'lifestyle'],
    focus: 'Explain the cortisol-glucose mechanism: gluconeogenesis, glycogenolysis, insulin resistance. Chronic vs acute stress. HPA axis dysregulation. Practical stress management for metabolic health.',
  },
  {
    slug: 'alcohol-blood-sugar-prediabetes',
    title: 'Alcohol and Blood Sugar: The Complicated Truth for People with Prediabetes',
    category: 'lifestyle',
    tags: ['alcohol', 'blood sugar', 'prediabetes', 'liver', 'lifestyle'],
    focus: 'Cover the biphasic effect of alcohol on glucose (initial spike from mixers, then hypoglycemia risk). Liver glycogen depletion. Wine vs beer vs spirits. Practical guidance for prediabetics.',
  },
  {
    slug: 'prediabetes-diagnosis-emotional-response',
    title: 'The Emotional Reality of a Prediabetes Diagnosis (And Why Shame Is the Worst Response)',
    category: 'mindset',
    tags: ['prediabetes', 'diagnosis', 'shame', 'mental health', 'mindset'],
    focus: 'Address the emotional impact of prediabetes diagnosis. Why shame is counterproductive (cortisol, avoidance). Evidence for self-compassion in behavior change. The Oracle Lover\'s no-guilt philosophy.',
  },
  {
    slug: 'behavior-change-prediabetes-habit-science',
    title: 'Why Willpower Fails and Habit Science Succeeds: A Prediabetes Behavior Change Guide',
    category: 'mindset',
    tags: ['behavior change', 'habits', 'willpower', 'prediabetes', 'mindset'],
    focus: 'Apply habit science (Clear, Duhigg) to prediabetes management. Implementation intentions, environment design, habit stacking. Why motivation is unreliable and systems work. Practical examples.',
  },
  {
    slug: 'newcastle-protocol-reverse-prediabetes',
    title: 'The Newcastle Protocol: Can You Actually Reverse Prediabetes with 8 Weeks of Caloric Restriction?',
    category: 'reversal',
    tags: ['Newcastle Protocol', 'caloric restriction', 'reversal', 'prediabetes', 'Roy Taylor'],
    focus: 'Cover Roy Taylor\'s Newcastle Protocol research. The 800 kcal/day VLCD approach. DiRECT trial results. Mechanism: ectopic fat removal from liver and pancreas. Who it works for. Practical implementation.',
  },
  {
    slug: 'insulin-resistance-root-cause',
    title: 'Insulin Resistance: The Root Cause of Prediabetes (And How to Actually Address It)',
    category: 'reversal',
    tags: ['insulin resistance', 'prediabetes', 'reversal', 'mechanism', 'metabolic health'],
    focus: 'Deep dive into insulin resistance mechanisms: ectopic fat, ceramides, diacylglycerol, mitochondrial dysfunction. Why treating symptoms (glucose) without addressing IR is insufficient. The reversal framework.',
  },
  {
    slug: 'metformin-for-prediabetes-options',
    title: 'Metformin for Prediabetes: What the DPP Trial Shows and When to Consider It',
    category: 'reversal',
    tags: ['metformin', 'prediabetes', 'DPP trial', 'medication', 'reversal'],
    focus: 'Cover the Diabetes Prevention Program trial data on metformin (31% reduction vs 58% lifestyle). Mechanism: AMPK, hepatic glucose production. Who benefits most. Side effects. The lifestyle-first argument.',
  },
];

function buildPrompt(article) {
  return `You are The Oracle Lover — a no-BS metabolic health writer with a science degree and zero tolerance for food guilt. You write for glucosemanaged.com.

Your voice: direct, intelligent, warm but not coddling. You cite research but explain it clearly. You never shame people about food or weight. You treat readers as intelligent adults who can handle the actual biochemistry.

Write a comprehensive, SEO-optimized article for the following:

TITLE: ${article.title}
SLUG: ${article.slug}
CATEGORY: ${article.category}
TAGS: ${article.tags.join(', ')}
FOCUS: ${article.focus}

REQUIREMENTS:
1. Length: 1,200–1,800 words
2. Structure: Introduction (hook + thesis), 4-6 H2 sections, Conclusion with clear action step
3. Include specific research citations (author, year, finding) — use real studies where possible
4. Include at least one practical protocol or actionable takeaway per section
5. Use H3 subheadings within longer sections
6. Write a 2-sentence meta description (155 chars max) that includes the primary keyword
7. Write 5 FAQ questions and answers (schema-ready)
8. Include a "Key Takeaway" box summary at the end

VOICE RULES:
- Never say "it's important to note" or "it's worth mentioning"
- Never use passive voice when active works
- No food guilt, no shame, no "you should"
- Cite studies with specifics: "A 2023 RCT published in Diabetes Care found..."
- Use "you" and "your" freely
- Short paragraphs (3-4 sentences max)

OUTPUT FORMAT (JSON):
{
  "title": "exact title",
  "meta_description": "155 char max meta description",
  "og_title": "slightly different OG title for social",
  "og_description": "OG description",
  "body": "full HTML article body (use <h2>, <h3>, <p>, <ul>, <li>, <strong>, <blockquote> tags)",
  "faq": [
    {"question": "...", "answer": "..."},
    ...5 items
  ],
  "reading_time": 8
}

Write the complete article now. Return ONLY valid JSON, no markdown fences.`;
}

function qualityGate(article, content) {
  const errors = [];
  const body = content.body || '';
  const wordCount = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 800) errors.push(`Word count too low: ${wordCount}`);
  if (!body.includes('<h2>')) errors.push('Missing H2 headings');
  if (!content.meta_description) errors.push('Missing meta_description');
  if (!content.faq || content.faq.length < 3) errors.push('Insufficient FAQs');
  return { pass: errors.length === 0, errors };
}

async function main() {
  console.log('[seed-remaining] Starting...');

  const { default: OpenAI } = await import('openai');
  const { query, initDb } = await import('../src/lib/db.mjs');

  const openai = new OpenAI({
    apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });

  await initDb();

  const { rows: existing } = await query(`SELECT slug FROM articles WHERE status = 'published'`);
  const existingSlugs = new Set(existing.map(r => r.slug));
  console.log(`[seed-remaining] Found ${existingSlugs.size} existing articles`);

  const toGenerate = REMAINING_ARTICLES.filter(a => !existingSlugs.has(a.slug));
  console.log(`[seed-remaining] Generating ${toGenerate.length} articles...`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < toGenerate.length; i++) {
    const article = toGenerate[i];
    console.log(`\n[${i + 1}/${toGenerate.length}] ${article.title}`);

    let attempts = 0;
    let generated = null;

    while (attempts < 3 && !generated) {
      attempts++;
      try {
        const response = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
          messages: [{ role: 'user', content: buildPrompt(article) }],
          temperature: 0.7,
          max_tokens: 4000,
        });

        const raw = response.content[0].text.trim();
        const jsonStr = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(jsonStr);

        const { pass, errors } = qualityGate(article, parsed);
        if (!pass) {
          console.log(`  [QA] FAIL (attempt ${attempts}): ${errors.join(', ')}`);
          if (attempts < 3) continue;
        } else {
          console.log(`  [QA] PASS`);
        }
        generated = parsed;
      } catch (err) {
        console.error(`  Error attempt ${attempts}:`, err.message);
        if (attempts < 3) await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (!generated) { failed++; continue; }

    try {
      const publishedAt = new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString();
      await query(
        `INSERT INTO articles (slug, title, meta_description, og_title, og_description, category, tags, body, reading_time, status, published_at, author, faq)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'published', $10, 'The Oracle Lover', $11)
         ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, body = EXCLUDED.body, updated_at = NOW()`,
        [
          article.slug,
          generated.title || article.title,
          generated.meta_description || '',
          generated.og_title || generated.title || article.title,
          generated.og_description || generated.meta_description || '',
          article.category,
          JSON.stringify(article.tags),
          generated.body,
          generated.reading_time || 8,
          publishedAt,
          JSON.stringify(generated.faq || []),
        ]
      );
      console.log(`  ✓ Saved: ${article.slug}`);
      success++;
    } catch (dbErr) {
      console.error(`  DB error:`, dbErr.message);
      failed++;
    }

    if (i < toGenerate.length - 1) await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n[seed-remaining] Done! Success: ${success}, Failed: ${failed}`);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
