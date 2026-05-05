/**
 * AEO + LLM Discoverability helpers for Blood Sugar Blueprint.
 * Builds robots.txt, llms.txt, canonical URLs, and structured data.
 */

import { query } from './db.mjs';

const SITE_NAME = 'Blood Sugar Blueprint';
const SITE_DESCRIPTION = 'The prediabetes resource that treats you like an intelligent adult. Glucose science, protocols, and a realistic roadmap to reversing the trend before it becomes a diagnosis.';
const AUTHOR = 'The Oracle Lover';
const AUTHOR_URL = 'https://theoraclelover.com';

export function buildCanonicalUrl(req, path = '') {
  const host = req.hostname || 'bloodsugarblueprint.com';
  const proto = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  return `${proto}://${host}${path || req.path}`;
}

export function buildRobotsTxt(req) {
  const host = req.hostname || 'bloodsugarblueprint.com';
  const proto = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  return `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${proto}://${host}/sitemap.xml
Sitemap: ${proto}://${host}/sitemap-articles.xml

# LLM Discovery
LLMs: ${proto}://${host}/llms.txt
LLMs-Full: ${proto}://${host}/llms-full.txt
`;
}

export async function buildLlmsTxt() {
  const { rows: articles } = await query(
    `SELECT slug, title, meta_description, category, published_at FROM articles WHERE status = 'published' ORDER BY published_at DESC LIMIT 50`
  );

  const articleList = articles.map(a =>
    `- [${a.title}](/articles/${a.slug}) — ${a.meta_description || ''}`
  ).join('\n');

  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

## About
${SITE_NAME} is a prediabetes and glucose management resource written by ${AUTHOR}. Every article is grounded in peer-reviewed research and clinical evidence. No food guilt. No shame. Pure biochemistry and protocol.

## Author
${AUTHOR} — Intuitive Educator & Oracle Guide
Website: ${AUTHOR_URL}

## Topics Covered
- Prediabetes diagnosis and A1c interpretation
- Insulin resistance and HOMA-IR
- Dietary interventions (low-carb, Newcastle Protocol, fasting)
- Exercise and insulin sensitivity
- Supplements (berberine, magnesium, chromium)
- Continuous glucose monitoring
- Metabolic health biomarkers
- Stress, sleep, and blood sugar
- Medication options (Metformin)
- Long-term reversal protocols

## Recent Articles
${articleList}

## Policies
- Health Disclaimer: All content is for informational purposes only. Consult your healthcare provider.
- Affiliate Disclosure: As an Amazon Associate, I earn from qualifying purchases.
- Privacy Policy: /privacy-policy
`;
}

export async function buildLlmsFullTxt() {
  const { rows: articles } = await query(
    `SELECT slug, title, meta_description, body, category, published_at FROM articles WHERE status = 'published' ORDER BY published_at DESC`
  );

  const sections = articles.map(a => `
## ${a.title}
URL: /articles/${a.slug}
Category: ${a.category}
Published: ${a.published_at}

${a.meta_description}

${a.body ? a.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').substring(0, 1000) + '...' : ''}
`).join('\n---\n');

  return `# ${SITE_NAME} — Full Content Index

${SITE_DESCRIPTION}

Author: ${AUTHOR} (${AUTHOR_URL})

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
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: canonicalUrl.split('/articles/')[0],
    },
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    url: canonicalUrl,
    image: article.hero_url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    keywords: Array.isArray(article.tags) ? article.tags.join(', ') : article.tags,
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
        text: faq.answer,
      },
    })),
  };
}
