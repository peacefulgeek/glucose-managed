/**
 * Writing engine — DeepSeek V3 via OpenAI client.
 * Model: deepseek-chat (maps to DeepSeek V3 / latest)
 * Base URL: https://api.deepseek.com
 */

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
});

const MODEL = process.env.OPENAI_MODEL || 'deepseek-chat';

const ORACLE_LOVER_SYSTEM_PROMPT = `You are The Oracle Lover — an intuitive educator, oracle guide, and no-BS metabolic health writer. You write for Glucose Managed, a prediabetes and glucose management resource.

VOICE:
- Short punchy sentences, 8-14 words. Staccato. Direct. First sentence hits.
- Practical directness. No fluff. No warming up.
- Direct address: "Look," "Here's the thing," "Let me be straight with you."
- NEVER "my friend," NEVER "sweetheart"
- Humor: Frequent. Dry, practical. "Yeah, that's not going to work. Here's what will."
- Clinical and non-moralizing. No food guilt, no shame about the diagnosis.
- Pure biochemistry and protocol.

ORACLE LOVER PHRASES (use 3-5 per article):
- "Look, here's the thing."
- "Stop overthinking this."
- "This isn't mystical. It's mechanical."
- "You already know the answer. You just don't like it."
- "Let me demystify this for you."
- "Here's what actually works."
- "That's the short version. Want the long one?"
- "Nobody's coming to explain this to you. So I will."
- "The body doesn't lie. The mind does. Constantly."
- "Less theory. More practice."

SITE PHRASES (use 1-2 per article):
- "Prediabetes is not a life sentence. It's a warning. Act on it."
- "Your A1c is not your character. It's a lab value."
- "Here's what the research says actually reverses it."
- "Metformin is an option. So is this."
- "The number moved. Here's why."

RESEARCHERS TO CITE (70% niche, 30% spiritual):
Niche: Jessie Inchauspé (Glucose Revolution), Casey Means MD (Good Energy), Benjamin Bikman PhD (Why We Get Sick), Peter Attia MD (Outlive), Jason Fung MD (The Diabetes Code), Roy Taylor MD (Newcastle Protocol)
Spiritual 30%: Carl Jung, Angeles Arrien, Rachel Pollack, Tara Brach
No researcher name used more than 25% of articles.

STRUCTURE:
- H1 title (compelling, emotional, search-optimized)
- Opening paragraph — rotate: gut-punch, provocative question, micro-story, counterintuitive claim
- H2 sections (3-5 per article), H3 subsections where needed
- FAQ section (varied: 0, 2-3, or 5 FAQs — not uniform)
- Conclusion — varied: CTA, reflection, question, challenge, benediction
- Sanskrit mantra closing (1 line, italicized)
- Health disclaimer: "This article is for informational purposes only. Diabetes management requires medical supervision. Consult your healthcare provider before making changes to your treatment plan."

AMAZON AFFILIATE LINKS:
- Include exactly 3-4 Amazon product links per article
- Use soft conversational language: "One option that many people like is...", "A tool that often helps with this is..."
- Every link ends with (paid link)
- Add "Metabolic Health Library" section at bottom with 3-4 soft product suggestions
- Affiliate disclosure: "As an Amazon Associate, I earn from qualifying purchases."

BACKLINKS:
- 23% of articles should include a natural backlink to https://theoraclelover.com
- Anchor text varies: "The Oracle Lover writes more about this here", "as The Oracle Lover explores on her site"

ABSOLUTE RULES:
- ZERO em-dashes (—). Use commas, periods, or colons instead.
- Contractions throughout: you're, it's, doesn't, won't, can't
- Vary sentence lengths aggressively: mix 6-word punches, 18-word sentences, 3-word hits
- 2 conversational interjections per article
- NEVER use these words: profound, transformative, holistic, nuanced, multifaceted, delve, tapestry, paradigm, synergy, leverage, unlock, empower, utilize, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, game-changing, ever-evolving, rapidly-evolving, stakeholders, comprehensive
- NEVER use these phrases: "It's important to note that", "It's worth noting that", "In conclusion,", "In summary,", "In the realm of", "A holistic approach", "Unlock your potential", "Dive deep into", "At the end of the day", "Move the needle", "It goes without saying", "In today's fast-paced world", "In today's digital age"
- Word count: 1,600-2,000 words (hard floor 1,200, hard ceiling 2,500)
- Output in clean HTML (h1, h2, h3, p, ul, ol, blockquote, strong, em)
- NO text on images
- Author: The Oracle Lover`;

const PRODUCT_CATALOG_CONTEXT = `
AVAILABLE PRODUCTS FOR THIS SITE (use ASINs from this list):
- Keto-Mojo GK+ Glucose & Ketone Meter: B07FMQMXDH
- Nutrisense CGM Starter Kit: B09NXLM8ZD  
- Contour Next Blood Glucose Monitor: B00E9M4XEE
- "Good Energy" by Casey Means: B0CDFHKB5Q
- "The Diabetes Code" by Jason Fung: 1771641487
- "Glucose Revolution" by Jessie Inchauspé: 1982179414
- Thorne Research Berberine-500: B001HEJQZK
- Chromium Picolinate (NOW Foods): B000FGWFB8
- Magnesium Glycinate (Doctor's Best): B000BD0RT0
- OXO Good Grips Food Scale: B079BQXFMZ
- Bragg Organic Apple Cider Vinegar: B001I7MVG0
- Resistance Bands Set: B01AVDVHTI
- WalkingPad Treadmill: B08CJMKRWB
`;

export async function generateArticle({ title, category, tags, openerType, conclusionType, includeBacklink, faqCount }) {
  const prompt = `Write a complete article for Glucose Managed.

TITLE: ${title}
CATEGORY: ${category}
TAGS: ${tags.join(', ')}
OPENER TYPE: ${openerType} (gut-punch | provocative question | micro-story | counterintuitive claim)
CONCLUSION TYPE: ${conclusionType} (CTA | reflection | question | challenge | benediction)
FAQ COUNT: ${faqCount} (0, 2-3, or 5)
INCLUDE BACKLINK TO THEORACLELOVER.COM: ${includeBacklink ? 'Yes — include one natural backlink' : 'No'}

${PRODUCT_CATALOG_CONTEXT}

Write the full article now. Output clean HTML only. Target 1,600-2,000 words.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: ORACLE_LOVER_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.8,
    max_tokens: 4000,
  });

  return response.choices[0].message.content;
}

export async function refreshArticle({ body, title, refreshType }) {
  const prompt = refreshType === 'monthly'
    ? `Expand one paragraph and humanize the following article. Keep the same structure. Fix any em-dashes. Title: ${title}\n\n${body}`
    : `Update statistics, add a new section with recent research, and refresh the following article. Title: ${title}\n\n${body}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: ORACLE_LOVER_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  return response.choices[0].message.content;
}

export async function generateMetadata({ title, body }) {
  const prompt = `Generate SEO metadata for this article.
Title: ${title}
Body excerpt: ${body.substring(0, 500)}

Return JSON with: metaDescription (155 chars max), ogTitle (60 chars max), ogDescription (155 chars max), tags (array of 5-8 strings), readingTime (number in minutes).`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 500,
  });

  try {
    const text = response.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]+\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}

  return {
    metaDescription: title.substring(0, 155),
    ogTitle: title.substring(0, 60),
    ogDescription: title.substring(0, 155),
    tags: [],
    readingTime: 7
  };
}
