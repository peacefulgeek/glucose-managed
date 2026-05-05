import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ReadingProgress } from '../components/ReadingProgress';
import { AutoAffiliates } from '../components/AutoAffiliates';
import { productCatalog } from '../../data/product-catalog';

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

const CATEGORY_IMAGES: Record<string, string> = {
  'diagnosis': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80',
  'diet': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80',
  'exercise': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80',
  'supplements': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&q=80',
  'monitoring': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80',
  'lifestyle': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80',
  'mindset': 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80',
  'medication': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80',
  'reversal': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80',
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.meta_description,
    author: { '@type': 'Person', name: 'The Oracle Lover', url: 'https://theoraclelover.com' },
    publisher: { '@type': 'Organization', name: 'Blood Sugar Blueprint' },
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    image: heroUrl,
    keywords: tags.join(', '),
  };

  return (
    <>
      <Helmet>
        <title>{article.og_title || article.title}</title>
        <meta name="description" content={article.meta_description || ''} />
        <meta property="og:title" content={article.og_title || article.title} />
        <meta property="og:description" content={article.og_description || article.meta_description || ''} />
        <meta property="og:image" content={heroUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
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
              background: 'var(--color-accent)',
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

        {/* ─── Meta ─────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px',
          flexWrap: 'wrap',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6A8C3A, #8AB54E)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}>🔮</div>
            <div>
              <a
                href="https://theoraclelover.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)', textDecoration: 'none' }}
              >
                The Oracle Lover
              </a>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Intuitive Educator & Oracle Guide
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {article.published_at && <span>📅 {formatDate(article.published_at)}</span>}
            <span>⏱️ {article.reading_time || 7} min read</span>
          </div>
        </div>

        {/* ─── Hero Image ───────────────────────────────────── */}
        <div style={{
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '40px',
          boxShadow: '0 8px 32px rgba(30,24,16,0.12)',
        }}>
          <img
            src={heroUrl}
            alt={article.title}
            style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
          />
        </div>

        {/* ─── Health Disclaimer ────────────────────────────── */}
        <div className="health-disclaimer">
          <strong>Medical Disclaimer:</strong> This article is for informational purposes only.
          Diabetes management requires medical supervision. Consult your healthcare provider
          before making changes to your treatment plan.
        </div>

        {/* ─── Article Body ─────────────────────────────────── */}
        <div
          className="article-body"
          style={{ maxWidth: '740px' }}
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {/* ─── Tags ─────────────────────────────────────────── */}
        {tags.length > 0 && (
          <div style={{ marginTop: '32px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6A8C3A, #8AB54E)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            flexShrink: 0,
            border: '2px solid var(--color-accent)',
          }}>🔮</div>
          <div>
            <h4 style={{ marginBottom: '4px' }}>The Oracle Lover</h4>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              Intuitive Educator & Oracle Guide — no-BS metabolic health writer with a science degree
              and zero tolerance for food guilt. Prediabetes doesn't have to become diabetes.
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
