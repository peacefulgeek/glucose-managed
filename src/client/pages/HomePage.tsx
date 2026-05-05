import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArticleCard } from '../components/ArticleCard';

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

interface HomePageProps {
  ssrData?: { articles?: Article[] };
}

const STATS = [
  { value: '37M+', label: 'Americans with prediabetes', icon: '🇺🇸' },
  { value: '80%', label: 'Don\'t know they have it', icon: '❓' },
  { value: '70%', label: 'Will develop type 2 diabetes', icon: '📈' },
  { value: '58%', label: 'Reduction with lifestyle changes', icon: '✅' },
];

const CATEGORIES = [
  { id: 'diagnosis', label: 'Diagnosis & Testing', icon: '🔬', color: '#6A8C3A', desc: 'A1c, HOMA-IR, fasting insulin' },
  { id: 'diet', label: 'Diet & Nutrition', icon: '🥗', color: '#E07B39', desc: 'Low-carb, food order, glucose curves' },
  { id: 'exercise', label: 'Exercise & Movement', icon: '🏃', color: '#3A7CB8', desc: 'Strength training, post-meal walks' },
  { id: 'supplements', label: 'Supplements', icon: '💊', color: '#9B59B6', desc: 'Berberine, magnesium, chromium' },
  { id: 'monitoring', label: 'Monitoring', icon: '📊', color: '#27AE60', desc: 'CGM, home testing, tracking' },
  { id: 'reversal', label: 'Reversal Protocols', icon: '🔄', color: '#8E44AD', desc: 'Newcastle Protocol, fasting' },
];

export function HomePage({ ssrData = {} }: HomePageProps) {
  const [articles, setArticles] = useState<Article[]>(ssrData.articles || []);

  useEffect(() => {
    if (articles.length === 0) {
      fetch('/api/articles?limit=12')
        .then(r => r.json())
        .then(data => setArticles(data.articles || []))
        .catch(() => {});
    }
  }, []);

  const featuredArticle = articles[0];
  const recentArticles = articles.slice(1, 7);

  return (
    <>
      <Helmet>
        <title>Blood Sugar Blueprint — Prediabetes & Glucose Management</title>
        <meta name="description" content="The prediabetes resource that treats you like an intelligent adult. Glucose science, protocols, and a realistic roadmap to reversing the trend before it becomes a diagnosis." />
      </Helmet>

      {/* ─── Hero Section ─────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-eyebrow">Blood Sugar Blueprint</div>
          <h1 className="hero-title">
            Prediabetes is not a life sentence.<br />
            <span style={{ color: '#8AB54E' }}>It's a warning. Act on it.</span>
          </h1>
          <p className="hero-subtitle">
            The glucose science, the protocol, and the realistic roadmap to reversing the trend
            before it becomes a diagnosis. No guilt. No fluff. Just what actually works.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/assessment" className="btn btn-primary" style={{
              background: '#8AB54E',
              color: '#1E2D0E',
              fontWeight: 700,
              padding: '14px 24px',
              fontSize: '15px',
            }}>
              📊 Take the Risk Assessment
            </Link>
            <Link to="/articles" className="btn" style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '14px 24px',
              fontSize: '15px',
            }}>
              Browse All Articles →
            </Link>
          </div>

          {/* Stats bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            marginTop: '48px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.15)',
          }}>
            {STATS.map(stat => (
              <div key={stat.value} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{stat.icon}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#8AB54E', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', lineHeight: 1.4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Article ─────────────────────────────────── */}
      {featuredArticle && (
        <section style={{ padding: '48px 32px', background: 'var(--color-bg)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                background: 'var(--color-accent)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '99px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>Featured</div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)' }}>
                Latest from The Oracle Lover
              </h2>
            </div>
            <ArticleCard article={featuredArticle} variant="featured" />
          </div>
        </section>
      )}

      {/* ─── Category Grid ────────────────────────────────────── */}
      <section style={{
        padding: '48px 32px',
        background: 'var(--color-sidebar-bg)',
        borderTop: '1px solid var(--color-sidebar-border)',
        borderBottom: '1px solid var(--color-sidebar-border)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 className="section-title">Browse by Topic</h2>
            <p className="section-subtitle">
              Everything you need to understand and reverse prediabetes, organized by what matters most.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
          }}>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                to={`/articles?category=${cat.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: 'white',
                  borderRadius: '10px',
                  padding: '20px 16px',
                  border: '1px solid var(--color-border)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  height: '100%',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(106,140,58,0.16)';
                  (e.currentTarget as HTMLElement).style.borderColor = cat.color;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                }}
                >
                  <div style={{
                    fontSize: '28px',
                    marginBottom: '10px',
                    width: '48px',
                    height: '48px',
                    background: `${cat.color}18`,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>{cat.icon}</div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '14px',
                    color: 'var(--color-text)',
                    marginBottom: '6px',
                    lineHeight: 1.3,
                  }}>{cat.label}</div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.4,
                  }}>{cat.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Recent Articles Grid ─────────────────────────────── */}
      {recentArticles.length > 0 && (
        <section style={{ padding: '48px 32px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '32px',
            }}>
              <div>
                <h2 className="section-title">Recent Articles</h2>
                <p className="section-subtitle" style={{ marginBottom: 0 }}>
                  The latest research, protocols, and practical guidance.
                </p>
              </div>
              <Link to="/articles" className="btn btn-outline" style={{ flexShrink: 0 }}>
                View All →
              </Link>
            </div>
            <div className="grid-3">
              {recentArticles.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Assessment CTA ───────────────────────────────────── */}
      <section style={{
        padding: '64px 32px',
        background: 'linear-gradient(135deg, #1E2D0E 0%, #2D4A1A 100%)',
        color: 'white',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            Know Your Prediabetes Risk
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: '32px' }}>
            Take the 5-minute assessment. Get your risk score. Know exactly what to do next.
            Your A1c is not your character. It's a lab value. And lab values can change.
          </p>
          <Link to="/assessment" className="btn" style={{
            background: '#8AB54E',
            color: '#1E2D0E',
            fontWeight: 700,
            padding: '16px 32px',
            fontSize: '16px',
            borderRadius: '10px',
          }}>
            Start the Free Assessment →
          </Link>
        </div>
      </section>

      {/* ─── Oracle Lover Quote ───────────────────────────────── */}
      <section style={{
        padding: '48px 32px',
        background: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <blockquote style={{
            fontSize: '22px',
            fontStyle: 'italic',
            color: 'var(--color-text)',
            lineHeight: 1.6,
            borderLeft: 'none',
            background: 'none',
            padding: 0,
            marginBottom: '20px',
          }}>
            "Your A1c is not your character. It's a lab value. And lab values can change.
            Here's what the research says actually reverses it."
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6A8C3A, #8AB54E)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}>🔮</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>The Oracle Lover</div>
              <a href="https://theoraclelover.com" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '12px', color: 'var(--color-accent)' }}>
                theoraclelover.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
