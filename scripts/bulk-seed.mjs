/**
 * Glucose Managed — Bulk Article Seeder
 * Generates 30 articles using OpenAI GPT-4.1-mini with quality gate
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ─── Article Manifest ─────────────────────────────────────────────────────────
const ARTICLES = [
  // DIAGNOSIS & TESTING (5)
  {
    slug: 'what-prediabetes-actually-is-a1c-meaning',
    title: 'What Prediabetes Actually Is: Decoding Your A1c Before It Becomes a Diagnosis',
    category: 'diagnosis',
    tags: ['prediabetes', 'A1c', 'diagnosis', 'blood sugar', 'HbA1c'],
    focus: 'Explain what prediabetes is biochemically, what A1c measures, the ranges (normal/prediabetes/diabetes), and why the diagnosis is actually good news. Cover glycation, red blood cell lifespan, and why A1c is imperfect. Voice: reassuring but precise.',
  },
  {
    slug: 'fasting-glucose-vs-a1c-which-test-matters',
    title: 'Fasting Glucose vs. A1c: Which Test Actually Tells You More?',
    category: 'diagnosis',
    tags: ['fasting glucose', 'A1c', 'blood test', 'diagnosis', 'prediabetes'],
    focus: 'Compare fasting plasma glucose, A1c, and OGTT. When each is most useful, their limitations, and why you might want all three. Cover the "A1c gap" in certain populations.',
  },
  {
    slug: 'homa-ir-more-useful-than-fasting-glucose',
    title: 'HOMA-IR: The Insulin Resistance Score Your Doctor Probably Never Ordered',
    category: 'diagnosis',
    tags: ['HOMA-IR', 'insulin resistance', 'fasting insulin', 'diagnosis', 'metabolic health'],
    focus: 'Explain HOMA-IR formula, what it measures, optimal ranges, how to get it tested, and why fasting insulin is more predictive than fasting glucose alone. Include the calculation.',
  },
  {
    slug: 'continuous-glucose-monitor-prediabetes-guide',
    title: 'Using a CGM Without a Prescription: What Prediabetics Learn in 2 Weeks',
    category: 'diagnosis',
    tags: ['CGM', 'continuous glucose monitor', 'Libre', 'Dexcom', 'glucose monitoring'],
    focus: 'Guide to using a CGM for prediabetes self-monitoring. What you\'ll discover, what patterns to look for, how to interpret spikes, and what "time in range" means. Cover Libre 3 and Dexcom G7.',
  },
  {
    slug: 'oral-glucose-tolerance-test-what-to-expect',
    title: 'The Oral Glucose Tolerance Test: What Happens, What It Reveals, and How to Prepare',
    category: 'diagnosis',
    tags: ['OGTT', 'glucose tolerance test', 'diagnosis', 'prediabetes', 'testing'],
    focus: 'Walk through the OGTT procedure, what the numbers mean at 1h and 2h, why it catches what A1c misses, and how to prepare. Cover reactive hypoglycemia as a finding.',
  },

  // DIET & NUTRITION (6)
  {
    slug: 'low-carb-for-prediabetes-research',
    title: 'Low-Carb for Prediabetes: What the Research Actually Shows (Not What Influencers Say)',
    category: 'diet',
    tags: ['low-carb', 'diet', 'prediabetes', 'carbohydrates', 'insulin resistance'],
    focus: 'Review the RCT evidence for low-carb diets in prediabetes and T2D reversal. Cover Virta Health study, Westman, Volek/Phinney. Address common objections. What "low-carb" actually means in grams.',
  },
  {
    slug: 'food-order-glucose-spike-reduction',
    title: 'The Food Order Trick That Reduces Glucose Spikes by Up to 73%',
    category: 'diet',
    tags: ['food order', 'glucose spike', 'vegetables first', 'glycemic response', 'diet'],
    focus: 'Cover the Imai et al. research on eating order (vegetables → protein → carbs). Explain the mechanism (viscous fiber, gastric emptying). Practical implementation. Jessie Inchauspé\'s work.',
  },
  {
    slug: 'glycemic-index-vs-glycemic-load-practical',
    title: 'Glycemic Index vs. Glycemic Load: The Difference That Actually Matters for Your Plate',
    category: 'diet',
    tags: ['glycemic index', 'glycemic load', 'carbohydrates', 'blood sugar', 'diet'],
    focus: 'Explain GI vs GL with real examples. Why watermelon\'s high GI doesn\'t matter. Why white rice portion size matters more than the GI. Practical table of common foods.',
  },
  {
    slug: 'intermittent-fasting-insulin-resistance',
    title: 'Intermittent Fasting and Insulin Resistance: What the Evidence Actually Supports',
    category: 'diet',
    tags: ['intermittent fasting', 'insulin resistance', 'time-restricted eating', 'fasting', 'metabolic health'],
    focus: 'Review evidence for 16:8 TRE, 5:2, and extended fasting for insulin resistance. Cover the Sutton et al. study on early TRE. Mechanisms: autophagy, insulin suppression, AMPK. Who should be cautious.',
  },
  {
    slug: 'fiber-blood-sugar-control-mechanism',
    title: 'Why Fiber Is the Most Underrated Blood Sugar Tool (And How to Actually Eat Enough)',
    category: 'diet',
    tags: ['fiber', 'blood sugar', 'soluble fiber', 'gut microbiome', 'diet'],
    focus: 'Explain soluble vs insoluble fiber, viscous fiber mechanism (slows gastric emptying, reduces glucose absorption), short-chain fatty acids, gut microbiome connection. 30g/day target. Best sources.',
  },
  {
    slug: 'vinegar-blood-sugar-acetic-acid-research',
    title: 'Apple Cider Vinegar and Blood Sugar: Separating the Hype from the Actual Research',
    category: 'diet',
    tags: ['apple cider vinegar', 'acetic acid', 'blood sugar', 'glucose', 'research'],
    focus: 'Review the Johnston et al. studies on acetic acid and postprandial glucose. Mechanism: AMPK activation, reduced starch digestion. Practical use. What it can and cannot do. Safety considerations.',
  },

  // EXERCISE & MOVEMENT (4)
  {
    slug: 'walking-after-meals-evidence-backed-intervention',
    title: 'The 10-Minute Post-Meal Walk: The Most Evidence-Backed Glucose Intervention You\'re Not Doing',
    category: 'exercise',
    tags: ['walking', 'post-meal exercise', 'glucose spike', 'blood sugar', 'exercise'],
    focus: 'Cover the Colberg et al. and DiPietro et al. research on post-meal walking. Mechanism: GLUT4 translocation, non-insulin-mediated glucose uptake. 10-15 min timing. Compare to 45-min morning walk.',
  },
  {
    slug: 'strength-training-insulin-sensitivity',
    title: 'Why Strength Training Is the Most Powerful Long-Term Tool for Insulin Sensitivity',
    category: 'exercise',
    tags: ['strength training', 'insulin sensitivity', 'muscle mass', 'GLUT4', 'exercise'],
    focus: 'Explain why muscle mass is the primary glucose disposal organ. GLUT4 upregulation with resistance training. Cover the research on 2-3x/week resistance training. Practical beginner protocol.',
  },
  {
    slug: 'hiit-vs-steady-state-cardio-blood-sugar',
    title: 'HIIT vs. Steady-State Cardio for Blood Sugar: Which One Wins?',
    category: 'exercise',
    tags: ['HIIT', 'cardio', 'blood sugar', 'exercise', 'insulin sensitivity'],
    focus: 'Compare HIIT and steady-state cardio for glucose management. Cover the Gillen et al. and Little et al. studies. Mechanisms differ. Practical recommendation: both have a role. The "exercise snack" concept.',
  },
  {
    slug: 'sedentary-behavior-blood-sugar-breaks',
    title: 'Sitting Is Wrecking Your Blood Sugar: The Science of Movement Breaks',
    category: 'exercise',
    tags: ['sedentary behavior', 'sitting', 'movement breaks', 'blood sugar', 'office work'],
    focus: 'Cover the Dunstan et al. research on breaking sitting time. 3-min walks every 30 min vs. continuous sitting. Mechanism: postprandial glucose and insulin. Practical desk strategies.',
  },

  // SUPPLEMENTS (4)
  {
    slug: 'berberine-glucose-management-research',
    title: 'Berberine for Blood Sugar: The Research Behind the "Natural Metformin" Comparison',
    category: 'supplements',
    tags: ['berberine', 'supplements', 'blood sugar', 'insulin resistance', 'AMPK'],
    focus: 'Review the Zhang et al. meta-analysis and RCTs on berberine. AMPK mechanism. A1c reduction data. Compare to metformin head-to-head studies. Dosing (500mg 3x/day). Drug interactions. Who should avoid.',
  },
  {
    slug: 'magnesium-insulin-resistance-deficiency',
    title: 'Magnesium and Insulin Resistance: Why 50% of Prediabetics Are Deficient',
    category: 'supplements',
    tags: ['magnesium', 'insulin resistance', 'supplements', 'deficiency', 'metabolic health'],
    focus: 'Cover the epidemiological link between magnesium deficiency and insulin resistance. Mechanism: insulin receptor signaling requires Mg2+. Forms comparison (glycinate vs oxide). Dosing. Food sources.',
  },
  {
    slug: 'inositol-blood-sugar-pcos-research',
    title: 'Inositol for Blood Sugar and PCOS: The Underrated Supplement with Real Evidence',
    category: 'supplements',
    tags: ['inositol', 'myo-inositol', 'PCOS', 'insulin resistance', 'supplements'],
    focus: 'Cover myo-inositol and D-chiro-inositol research for insulin resistance and PCOS. Mechanism as insulin second messenger. RCT evidence. Dosing (2-4g/day myo). Particularly relevant for women.',
  },
  {
    slug: 'chromium-picolinate-glucose-tolerance',
    title: 'Chromium Picolinate and Glucose Tolerance: What the Research Actually Shows',
    category: 'supplements',
    tags: ['chromium', 'chromium picolinate', 'glucose tolerance', 'insulin', 'supplements'],
    focus: 'Review the Anderson et al. research on chromium and insulin sensitivity. Mechanism: chromodulin and insulin receptor. Meta-analysis findings. Modest but real effects. Dosing. Food sources.',
  },

  // MONITORING (3)
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

  // LIFESTYLE (3)
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

  // MINDSET (2)
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

  // REVERSAL PROTOCOLS (3)
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

// ─── Writing Prompt ───────────────────────────────────────────────────────────
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

// ─── Quality Gate ─────────────────────────────────────────────────────────────
function qualityGate(article, content) {
  const errors = [];
  const body = content.body || '';
  const wordCount = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;

  if (wordCount < 900) errors.push(`Word count too low: ${wordCount} (min 900)`);
  if (!body.includes('<h2>')) errors.push('Missing H2 headings');
  if (!content.meta_description) errors.push('Missing meta_description');
  if (!content.faq || content.faq.length < 3) errors.push('Insufficient FAQs (need 3+)');
  if (body.includes("it's important to note")) errors.push('Contains banned phrase: "it\'s important to note"');
  if (body.includes("it is important to note")) errors.push('Contains banned phrase');

  return { pass: errors.length === 0, errors };
}

// ─── Main Seeder ──────────────────────────────────────────────────────────────
async function main() {
  console.log('[seed] Starting Glucose Managed article seeder...');

  // Import dependencies
  const { default: OpenAI } = await import('openai');
  const { query, initDb } = await import('../src/lib/db.mjs');

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });

  await initDb();
  console.log('[seed] Database initialized');

  // Check existing articles
  const { rows: existing } = await query(
    `SELECT slug FROM articles WHERE status = 'published'`
  );
  const existingSlugs = new Set(existing.map(r => r.slug));
  console.log(`[seed] Found ${existingSlugs.size} existing articles`);

  const toGenerate = ARTICLES.filter(a => !existingSlugs.has(a.slug));
  console.log(`[seed] Generating ${toGenerate.length} new articles...`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < toGenerate.length; i++) {
    const article = toGenerate[i];
    console.log(`\n[seed] [${i + 1}/${toGenerate.length}] ${article.title}`);

    let attempts = 0;
    let generated = null;

    while (attempts < 3 && !generated) {
      attempts++;
      try {
        const prompt = buildPrompt(article);
        const response = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 4000,
        });

        const raw = response.choices[0].message.content.trim();
        // Strip markdown fences if present
        const jsonStr = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(jsonStr);

        const { pass, errors } = qualityGate(article, parsed);
        if (!pass) {
          console.log(`  [QA] FAIL (attempt ${attempts}): ${errors.join(', ')}`);
          if (attempts < 3) continue;
          console.log(`  [QA] Accepting despite failures after ${attempts} attempts`);
        } else {
          console.log(`  [QA] PASS`);
        }

        generated = parsed;
      } catch (err) {
        console.error(`  [seed] Error on attempt ${attempts}:`, err.message);
        if (attempts < 3) await sleep(2000);
      }
    }

    if (!generated) {
      console.error(`  [seed] FAILED to generate: ${article.slug}`);
      failed++;
      continue;
    }

    // Insert into DB
    try {
      const publishedAt = new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString();
      await query(
        `INSERT INTO articles (slug, title, meta_description, og_title, og_description, category, tags, body, reading_time, status, published_at, author, faq)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'published', $10, 'The Oracle Lover', $11)
         ON CONFLICT (slug) DO UPDATE SET
           title = EXCLUDED.title,
           meta_description = EXCLUDED.meta_description,
           body = EXCLUDED.body,
           faq = EXCLUDED.faq,
           updated_at = NOW()`,
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
      console.log(`  [seed] ✓ Saved: ${article.slug}`);
      success++;
    } catch (dbErr) {
      console.error(`  [seed] DB error:`, dbErr.message);
      failed++;
    }

    // Rate limiting
    if (i < toGenerate.length - 1) {
      await sleep(1500);
    }
  }

  console.log(`\n[seed] Complete! Success: ${success}, Failed: ${failed}`);
  process.exit(0);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(err => {
  console.error('[seed] Fatal error:', err);
  process.exit(1);
});
