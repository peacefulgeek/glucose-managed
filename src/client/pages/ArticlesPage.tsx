import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArticleCard } from '../components/ArticleCard';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface Article {
  slug: string;
  title: string;
  meta_description?: string;
  category: string;
  tags?: string[];
  hero_url?: string;
  reading_time?: number;
  published_at?: string;
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

interface ArticlesPageProps {
  ssrData?: { articles?: Article[] };
}

export function ArticlesPage({ ssrData = {} }: ArticlesPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>(ssrData.articles || []);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const activeCategory = searchParams.get('category') || '';

  useEffect(() => {
    fetch('/api/articles?limit=100')
      .then(r => r.json())
      .then(data => setArticles(data.articles || []))
      .catch(() => {});
  }, []);

  const filtered = articles.filter(a => {
    if (activeCategory && a.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        (a.meta_description || '').toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = Array.from(new Set(articles.map(a => a.category)));

  const pageTitle = activeCategory
    ? `${CATEGORY_LABELS[activeCategory] || activeCategory} Articles`
    : 'All Articles';

  return (
    <>
      <Helmet>
        <title>{pageTitle} | Blood Sugar Blueprint</title>
        <meta name="description" content="Browse all prediabetes and glucose management articles from Blood Sugar Blueprint. Evidence-based guidance from The Oracle Lover." />
      </Helmet>

      <div className="page-container">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          activeCategory
            ? { label: 'Articles', href: '/articles' }
            : { label: 'Articles' },
          ...(activeCategory ? [{ label: CATEGORY_LABELS[activeCategory] || activeCategory }] : []),
        ]} />

        {/* ─── Page Header ──────────────────────────────────── */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
            {pageTitle}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>
            {filtered.length} article{filtered.length !== 1 ? 's' : ''} on prediabetes, glucose management, and metabolic health.
          </p>
        </div>

        {/* ─── Filters & Controls ───────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <input
              type="search"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 40px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                fontSize: '14px',
                background: 'white',
                outline: 'none',
              }}
            />
            <svg
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>

          {/* View toggle */}
          <div style={{
            display: 'flex',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            {(['grid', 'list'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '8px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === mode ? 'var(--color-accent)' : 'white',
                  color: viewMode === mode ? 'white' : 'var(--color-text-muted)',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.15s',
                }}
              >
                {mode === 'grid' ? '⊞ Grid' : '☰ List'}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Category Tabs ────────────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => setSearchParams({})}
            style={{
              padding: '6px 14px',
              borderRadius: '99px',
              border: '1px solid',
              borderColor: !activeCategory ? 'var(--color-accent)' : 'var(--color-border)',
              background: !activeCategory ? 'var(--color-accent)' : 'white',
              color: !activeCategory ? 'white' : 'var(--color-text-muted)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSearchParams({ category: cat })}
              style={{
                padding: '6px 14px',
                borderRadius: '99px',
                border: '1px solid',
                borderColor: activeCategory === cat ? 'var(--color-accent)' : 'var(--color-border)',
                background: activeCategory === cat ? 'var(--color-accent)' : 'white',
                color: activeCategory === cat ? 'white' : 'var(--color-text-muted)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        {/* ─── Articles ─────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <p style={{ fontSize: '18px', fontWeight: 600 }}>No articles found</p>
            <p>Try a different search or category.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid-3">
            {filtered.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {filtered.map((article, idx) => (
              <div key={article.slug} style={{
                borderBottom: idx < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
                <ArticleCard article={article} variant="compact" />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
