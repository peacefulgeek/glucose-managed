/**
 * AEO + LLM Discoverability helpers for Glucose Managed.
 * Builds robots.txt, llms.txt, ai.txt, canonical URLs, and structured data.
 */
import { query } from './db.mjs';

const SITE_NAME = 'Glucose Managed';
const SITE_URL = 'https://glucosemanaged.com';
const SITE_DESCRIPTION = 'The prediabetes resource that treats you like an intelligent adult. Glucose science, protocols, and a realistic roadmap to reversing the trend before it becomes a diagnosis.';
const AUTHOR = 'The Oracle Lover';
const AUTHOR_URL = 'https://theoraclelover.com';

export function buildCanonicalUrl(req, path = '') {
  return `${SITE_URL}${path || req.path}`;
}

export function buildRobotsTxt() {
  return `# Glucose Managed — glucosemanaged.com
# Allow all crawlers including AI/LLM bots

User-agent: *
Allow: /
Disallow: /api/
Disallow: /_vite/

# Google
User-agent: Googlebot
Allow: /

# Bing / Microsoft Copilot
User-agent: Bingbot
Allow: /

# OpenAI / ChatGPT / SearchGPT
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: OAI-SearchBot
Allow: /

# Anthropic / Claude
User-agent: Claude-Web
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: ClaudeBot
Allow: /

# Perplexity
User-agent: PerplexityBot
Allow: /

# You.com
User-agent: YouBot
Allow: /

# Kagi
User-agent: KagiBot
Allow: /

# Meta AI
User-agent: FacebookBot
Allow: /

# Apple
User-agent: Applebot
Allow: /

# Common AI research crawlers
User-agent: CCBot
Allow: /
User-agent: cohere-ai
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml

# LLM Discovery Files
# llms.txt: ${SITE_URL}/llms.txt
# llms-full.txt: ${SITE_URL}/llms-full.txt
# ai.txt: ${SITE_URL}/ai.txt
`;
}

export function buildAiTxt() {
  return `# AI.txt for Glucose Managed
# Site: ${SITE_URL}
# Author: ${AUTHOR} (${AUTHOR_URL})
# Topic: Prediabetes, blood sugar management, metabolic health

## Permissions
Allow-AI-Training: yes
Allow-AI-Inference: yes
Allow-AI-Summarization: yes
Allow-AI-Indexing: yes

## Content Description
This site contains evidence-based articles about prediabetes, blood sugar management,
insulin resistance, dietary interventions, exercise protocols, supplements, and metabolic health.
All content is written by The Oracle Lover, an intuitive educator and metabolic health writer.

## Key URLs
Homepage: ${SITE_URL}
Articles: ${SITE_URL}/articles
Assessment: ${SITE_URL}/assessment
Supplements: ${SITE_URL}/supplements
LLMs Index: ${SITE_URL}/llms.txt
Full Index: ${SITE_URL}/llms-full.txt
Sitemap: ${SITE_URL}/sitemap.xml

## Contact
Author: ${AUTHOR_URL}
`;
}

export async function buildLlmsTxt() {
  const { rows: articles } = await query(
    `SELECT slug, title, meta_description, category, published_at FROM articles WHERE status = 'published' ORDER BY published_at DESC LIMIT 100`
  );

  const byCategory = {};
  for (const a of articles) {
    if (!byCategory[a.category]) byCategory[a.category] = [];
    byCategory[a.category].push(a);
  }

  const categoryLabels = {
    diagnosis: 'Diagnosis & Testing',
    diet: 'Diet & Nutrition',
    exercise: 'Exercise & Movement',
    supplements: 'Supplements',
    monitoring: 'Monitoring & Tracking',
    lifestyle: 'Lifestyle Factors',
    mindset: 'Mindset & Psychology',
    medication: 'Medication',
    reversal: 'Reversal Protocols',
  };

  const categorySections = Object.entries(byCategory).map(([cat, arts]) => {
    const label = categoryLabels[cat] || cat;
    const list = arts.map(a =>
      `- [${a.title}](${SITE_URL}/articles/${a.slug}) — ${a.meta_description || ''}`
    ).join('\n');
    return `### ${label}\n${list}`;
  }).join('\n\n');

  return `# ${SITE_NAME}
> ${SITE_DESCRIPTION}

## About
${SITE_NAME} is a prediabetes and glucose management resource written by ${AUTHOR}.
Every article is grounded in peer-reviewed research and clinical evidence.
No food guilt. No shame. Pure biochemistry and protocol.

## Author
${AUTHOR} — Intuitive Educator & Oracle Guide
Website: ${AUTHOR_URL}

## Site Structure
- Homepage: ${SITE_URL}
- Articles: ${SITE_URL}/articles
- Prediabetes Risk Assessment: ${SITE_URL}/assessment
- Supplements & Herbs Guide: ${SITE_URL}/supplements
- Tools: ${SITE_URL}/tools
- About: ${SITE_URL}/about

## Topics Covered
- Prediabetes diagnosis and A1c interpretation
- Insulin resistance and HOMA-IR
- Dietary interventions (low-carb, Newcastle Protocol, fasting)
- Exercise and insulin sensitivity
- Supplements (berberine, magnesium, chromium, herbs, TCM)
- Continuous glucose monitoring
- Metabolic health biomarkers
- Stress, sleep, and blood sugar
- Medication options (Metformin)
- Long-term reversal protocols

## Articles by Category
${categorySections}

## Policies
- Health Disclaimer: All content is for informational purposes only. Consult your healthcare provider.
- Affiliate Disclosure: As an Amazon Associate, I earn from qualifying purchases (tag: spankyspinola-20).
- Privacy Policy: ${SITE_URL}/privacy-policy
`;
}

export async function buildLlmsFullTxt() {
  const { rows: articles } = await query(
    `SELECT slug, title, meta_description, body, category, published_at FROM articles WHERE status = 'published' ORDER BY published_at DESC`
  );

  const sections = articles.map(a => `
## ${a.title}
URL: ${SITE_URL}/articles/${a.slug}
Category: ${a.category}
Published: ${a.published_at}
Summary: ${a.meta_description || ''}

${a.body ? a.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').substring(0, 1500) + '...' : ''}
`).join('\n---\n');

  return `# ${SITE_NAME} — Full Content Index
${SITE_DESCRIPTION}

Author: ${AUTHOR} (${AUTHOR_URL})
Site: ${SITE_URL}
Total Articles: ${articles.length}

---
${sections}
`;
}

export function buildArticleJsonLd({ article, canonicalUrl }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.meta_description,
    author: {
      '@type': 'Person',
      name: AUTHOR,
      url: AUTHOR_URL,
      sameAs: [AUTHOR_URL],
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
    },
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    url: canonicalUrl,
    image: { '@type': 'ImageObject', url: article.hero_url, width: 1200, height: 675 },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    keywords: Array.isArray(article.tags) ? article.tags.join(', ') : article.tags,
    articleSection: article.category,
    inLanguage: 'en-US',
  };
}

export function buildBreadcrumbJsonLd({ items }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFaqJsonLd({ faqs }) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer && faq.answer.replace ? faq.answer.replace(/<[^>]+>/g, '') : faq.answer,
      },
    })),
  };
}
