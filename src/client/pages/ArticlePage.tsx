import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ReadingProgress } from '../components/ReadingProgress';
import { AutoAffiliates } from '../components/AutoAffiliates';
import { productCatalog } from '../../data/product-catalog';

const SITE_URL = 'https://glucosemanaged.com';

interface FAQ {
  question: string;
  answer: string;
}
interface Article {
  id: number;
  slug: string;
  title: string;
  meta_description?: string;
  og_title?: string;
  og_description?: string;
  category: string;
  tags?: string[] | string;
  body: string;
  reading_time?: number;
  published_at?: string;
  updated_at?: string;
  hero_url?: string;
  author?: string;
  faq?: FAQ[] | string;
  tl_dr?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  'diagnosis': 'Diagnosis & Testing',
  'diet': 'Diet & Nutrition',
  'exercise': 'Exercise & Movement',
  'supplements': 'Supplements',
  'monitoring': 'Monitoring',
  'lifestyle': 'Lifestyle',
  'mindset': 'Mindset',
  'medication': 'Medication',
  'reversal': 'Reversal Protocols',
};

const CATEGORY_COLORS: Record<string, string> = {
  'diagnosis': '#6A8C3A',
  'diet': '#E07B39',
  'exercise': '#3A7CB8',
  'supplements': '#9B59B6',
  'monitoring': '#27AE60',
  'lifestyle': '#E74C3C',
  'mindset': '#F39C12',
  'medication': '#16A085',
  'reversal': '#8E44AD',
};

const CATEGORY_IMAGES: Record<string, string> = {
  'diagnosis': 'https://glucose-managed.b-cdn.net/images/hero-diagnosis.webp',
  'diet': 'https://glucose-managed.b-cdn.net/images/hero-diet.webp',
  'exercise': 'https://glucose-managed.b-cdn.net/images/hero-exercise.webp',
  'supplements': 'https://glucose-managed.b-cdn.net/images/hero-supplements.webp',
  'monitoring': 'https://glucose-managed.b-cdn.net/images/hero-monitoring.webp',
  'lifestyle': 'https://glucose-managed.b-cdn.net/images/hero-lifestyle.webp',
  'mindset': 'https://glucose-managed.b-cdn.net/images/hero-mindset.webp',
  'medication': 'https://glucose-managed.b-cdn.net/images/hero-monitoring.webp',
  'reversal': 'https://glucose-managed.b-cdn.net/images/hero-reversal.webp',
};

function parseTags(tags: string[] | string | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try { return JSON.parse(tags); } catch { return []; }
}

function parseFaqs(faq: FAQ[] | string | undefined): FAQ[] {
  if (!faq) return [];
  if (Array.isArray(faq)) return faq;
  try { return JSON.parse(faq); } catch { return []; }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  } catch { return ''; }
}

function isoDate(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString();
  try { return new Date(dateStr).toISOString(); } catch { return new Date().toISOString(); }
}

interface ArticlePageProps {
  ssrData?: { article?: Article };
}

export function ArticlePage({ ssrData = {} }: ArticlePageProps) {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(ssrData.article || null);
  const [loading, setLoading] = useState(!ssrData.article);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!ssrData.article && slug) {
      setLoading(true);
      fetch(`/api/articles/${slug}`)
        .then(r => r.json())
        .then(data => {
          setArticle(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div style={{ padding: '64px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
        <p>Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ padding: '64px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>Article Not Found</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
          This article doesn't exist or hasn't been published yet.
        </p>
        <Link to="/articles" className="btn btn-primary">Browse All Articles</Link>
      </div>
    );
  }

  const tags = parseTags(article.tags);
  const faqs = parseFaqs(article.faq);
  const heroUrl = article.hero_url || CATEGORY_IMAGES[article.category] || CATEGORY_IMAGES['diet'];
  const categoryLabel = CATEGORY_LABELS[article.category] || article.category;
  const categoryColor = CATEGORY_COLORS[article.category] || '#6A8C3A';
  const canonicalUrl = `${SITE_URL}/articles/${article.slug}`;
  const publishedIso = isoDate(article.published_at);
  const modifiedIso = isoDate(article.updated_at || article.published_at);

  // ─── Article JSON-LD ────────────────────────────────────────────────────────
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.meta_description,
    author: {
      '@type': 'Person',
      name: 'The Oracle Lover',
      url: 'https://theoraclelover.com',
      sameAs: ['https://theoraclelover.com'],
    },
    publisher: {
      '@type': 'Organization',
      name: 'Glucose Managed',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
    },
    datePublished: publishedIso,
    dateModified: modifiedIso,
    image: { '@type': 'ImageObject', url: heroUrl, width: 1200, height: 675 },
    keywords: tags.join(', '),
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    url: canonicalUrl,
    articleSection: categoryLabel,
    inLanguage: 'en-US',
  };

  // ─── BreadcrumbList JSON-LD ─────────────────────────────────────────────────
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: `${SITE_URL}/articles` },
      { '@type': 'ListItem', position: 3, name: categoryLabel, item: `${SITE_URL}/articles?category=${article.category}` },
      { '@type': 'ListItem', position: 4, name: article.title, item: canonicalUrl },
    ],
  };

  // ─── FAQPage JSON-LD ────────────────────────────────────────────────────────
  const faqJsonLd = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer.replace(/<[^>]+>/g, '') },
    })),
  } : null;

  return (
    <>
      <Helmet>
        <title>{article.og_title || article.title} | Glucose Managed</title>
        <meta name="description" content={article.meta_description || ''} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.og_title || article.title} />
        <meta property="og:description" content={article.og_description || article.meta_description || ''} />
        <meta property="og:image" content={heroUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="675" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Glucose Managed" />
        <meta property="article:published_time" content={publishedIso} />
        <meta property="article:modified_time" content={modifiedIso} />
        <meta property="article:author" content="https://theoraclelover.com" />
        <meta property="article:section" content={categoryLabel} />
        {tags.map(tag => <meta key={tag} property="article:tag" content={tag} />)}

        {/* Twitter / X Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.og_title || article.title} />
        <meta name="twitter:description" content={article.meta_description || ''} />
        <meta name="twitter:image" content={heroUrl} />
        <meta name="twitter:site" content="@glucosemanaged" />

        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        {faqJsonLd && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}
      </Helmet>

      <ReadingProgress />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 32px 64px' }}>

        {/* ─── Breadcrumbs ──────────────────────────────────── */}
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Articles', href: '/articles' },
          { label: categoryLabel, href: `/articles?category=${article.category}` },
          { label: article.title.length > 50 ? article.title.substring(0, 50) + '...' : article.title },
        ]} />

        {/* ─── Category Badge ───────────────────────────────── */}
        <div style={{ marginBottom: '16px' }}>
          <Link
            to={`/articles?category=${article.category}`}
            style={{
              display: 'inline-block',
              background: categoryColor,
              color: 'white',
              padding: '4px 12px',
              borderRadius: '99px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              textDecoration: 'none',
            }}
          >
            {categoryLabel}
          </Link>
        </div>

        {/* ─── Title ────────────────────────────────────────── */}
        <h1 style={{
          fontSize: 'clamp(24px, 3vw, 38px)',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '20px',
          color: 'var(--color-text)',
        }}>
          {article.title}
        </h1>

        {/* ─── Author Meta ──────────────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px',
          flexWrap: 'wrap',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6A8C3A, #8AB54E)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}>🔮</div>
            <div>
              <a
                href="https://theoraclelover.com"
                target="_blank"
                rel="noopener noreferrer author"
                style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text)', textDecoration: 'none' }}
              >
                The Oracle Lover
              </a>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Intuitive Educator · Metabolic Health Writer
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '13px', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
            {article.published_at && (
              <span>
                <time dateTime={publishedIso}>📅 {formatDate(article.published_at)}</time>
              </span>
            )}
            {article.updated_at && article.updated_at !== article.published_at && (
              <span>
                <time dateTime={modifiedIso}>✏️ Updated {formatDate(article.updated_at)}</time>
              </span>
            )}
            <span>⏱️ {article.reading_time || 8} min read</span>
          </div>
        </div>

        {/* ─── Hero Image ───────────────────────────────────── */}
        <div style={{
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(30,24,16,0.12)',
        }}>
          <img
            src={heroUrl}
            alt={article.title}
            style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
            loading="eager"
          />
        </div>

        {/* ─── TL;DR Box ────────────────────────────────────── */}
        {article.tl_dr && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(106,140,58,0.08), rgba(138,181,78,0.06))',
            border: '2px solid var(--color-accent)',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '32px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '18px' }}>⚡</span>
              <strong style={{ color: 'var(--color-accent)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                TL;DR — Key Takeaway
              </strong>
            </div>
            <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--color-text)', fontWeight: 500 }}>
              {article.tl_dr}
            </p>
          </div>
        )}

        {/* ─── Health Disclaimer ────────────────────────────── */}
        <div className="health-disclaimer">
          <strong>Medical Disclaimer:</strong> This article is for informational purposes only and does not constitute medical advice.
          Blood sugar management requires individual assessment by a qualified healthcare provider.
          Consult your doctor before making changes to your diet, supplements, or treatment plan.
        </div>

        {/* ─── Article Body ─────────────────────────────────── */}
        <div
          className="article-body"
          style={{ maxWidth: '740px' }}
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {/* ─── Self-referencing line ────────────────────────── */}
        <div style={{
          margin: '32px 0',
          padding: '16px 20px',
          background: 'var(--color-sidebar-bg)',
          borderRadius: '8px',
          fontSize: '14px',
          color: 'var(--color-text-muted)',
          borderLeft: '3px solid var(--color-accent)',
          lineHeight: 1.6,
        }}>
          This article is part of the <strong>Glucose Managed</strong> metabolic health library at{' '}
          <a href={SITE_URL} style={{ color: 'var(--color-accent)' }}>glucosemanaged.com</a> —
          the no-BS prediabetes resource written by{' '}
          <a href="https://theoraclelover.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>
            The Oracle Lover
          </a>.{' '}
          Explore more in{' '}
          <Link to={`/articles?category=${article.category}`} style={{ color: 'var(--color-accent)' }}>
            {categoryLabel}
          </Link>{' '}
          or take the{' '}
          <Link to="/assessment" style={{ color: 'var(--color-accent)' }}>
            free prediabetes risk assessment
          </Link>{' '}
          to understand your personal risk level.
        </div>

        {/* ─── Tags ─────────────────────────────────────────── */}
        {tags.length > 0 && (
          <div style={{ marginTop: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tags.map(tag => (
              <span key={tag} className="badge">{tag}</span>
            ))}
          </div>
        )}

        {/* ─── FAQ Section ──────────────────────────────────── */}
        {faqs.length > 0 && (
          <div className="faq-section">
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
              Frequently Asked Questions
            </h2>
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <div
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span>{faq.question}</span>
                  <span style={{ fontSize: '18px', color: 'var(--color-accent)' }}>
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </div>
                {openFaq === idx && (
                  <div
                    className="faq-answer"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ─── Affiliate Section ────────────────────────────── */}
        <AutoAffiliates
          articleTitle={article.title}
          articleTags={tags}
          articleCategory={article.category}
          catalog={productCatalog as any}
          bottomSectionName="Metabolic Health Library"
        />

        {/* ─── Author Bio Card ──────────────────────────────── */}
        <div className="author-byline" style={{ marginTop: '48px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6A8C3A, #8AB54E)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            flexShrink: 0,
            border: '3px solid var(--color-accent)',
          }}>🔮</div>
          <div>
            <h4 style={{ marginBottom: '6px', fontSize: '18px' }}>
              <a
                href="https://theoraclelover.com"
                target="_blank"
                rel="noopener noreferrer author"
                style={{ color: 'var(--color-text)', textDecoration: 'none' }}
              >
                The Oracle Lover
              </a>
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '4px', lineHeight: 1.7 }}>
              Intuitive Educator, Oracle Guide, and no-BS metabolic health writer with a science degree and zero tolerance for food guilt.
              She writes about prediabetes, glucose management, and the biochemistry of blood sugar in plain language that respects your intelligence.
              Her work is grounded in peer-reviewed research and her own journey navigating metabolic health without shame or restriction.
              Prediabetes doesn't have to become diabetes — and she's here to show you exactly why, with the science to back it up.
            </p>
            <a
              href="https://theoraclelover.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '13px', color: 'var(--color-accent)', fontWeight: 600 }}
            >
              Visit theoraclelover.com →
            </a>
          </div>
        </div>

        {/* ─── Navigation ───────────────────────────────────── */}
        <div style={{
          marginTop: '48px',
          paddingTop: '32px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <Link to="/articles" className="btn btn-outline">
            ← All Articles
          </Link>
          <Link to="/assessment" className="btn btn-primary">
            Take Risk Assessment →
          </Link>
        </div>

      </div>
    </>
  );
}
