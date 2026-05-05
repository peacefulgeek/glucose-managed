import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Article {
  slug: string;
  title: string;
  category: string;
  published_at: string;
  reading_time: number;
}

interface CategoryCount {
  category: string;
  count: number;
  label: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  'diagnosis': 'Diagnosis & Testing',
  'diet': 'Diet & Nutrition',
  'exercise': 'Exercise & Movement',
  'supplements': 'Supplements',
  'monitoring': 'Monitoring & Tracking',
  'lifestyle': 'Lifestyle Factors',
  'mindset': 'Mindset & Mental Health',
  'medication': 'Medication & Treatment',
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);

  useEffect(() => {
    fetch('/api/articles?limit=100')
      .then(r => r.json())
      .then(data => {
        const arts = data.articles || [];
        setArticles(arts);

        // Count by category
        const counts: Record<string, number> = {};
        arts.forEach((a: Article) => {
          counts[a.category] = (counts[a.category] || 0) + 1;
        });
        const cats = Object.entries(counts).map(([cat, count]) => ({
          category: cat,
          count,
          label: CATEGORY_LABELS[cat] || cat,
        })).sort((a, b) => b.count - a.count);
        setCategories(cats);
      })
      .catch(() => {});
  }, []);

  const recentArticles = articles.slice(0, 5);
  const popularArticles = [...articles]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* ─── Logo ─────────────────────────────────────────────── */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid var(--color-sidebar-border)',
      }}>
        <Link to="/" style={{ textDecoration: 'none' }} onClick={onClose}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #6A8C3A, #4E6B28)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '15px',
                color: 'var(--color-text)',
                lineHeight: 1.2,
              }}>Blood Sugar</div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '12px',
                color: 'var(--color-accent)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>Blueprint</div>
            </div>
          </div>
        </Link>
      </div>

      {/* ─── Author Bio ───────────────────────────────────────── */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--color-sidebar-border)',
        background: 'rgba(106,140,58,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6A8C3A, #8AB54E)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '2px solid var(--color-accent)',
            fontSize: '22px',
          }}>
            🔮
          </div>
          <div>
            <div style={{
              fontWeight: 700,
              fontSize: '14px',
              color: 'var(--color-text)',
              marginBottom: '2px',
            }}>The Oracle Lover</div>
            <div style={{
              fontSize: '11px',
              color: 'var(--color-accent)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>Intuitive Educator</div>
          </div>
        </div>
        <p style={{
          fontSize: '12.5px',
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
          margin: '0 0 10px',
        }}>
          No-BS metabolic health writer. Science degree, oracle deck, zero tolerance for food guilt.
          Prediabetes doesn't have to become diabetes.
        </p>
        <a
          href="https://theoraclelover.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '12px',
            color: 'var(--color-accent)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          theoraclelover.com
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        </a>
      </div>

      {/* ─── Navigation ───────────────────────────────────────── */}
      <nav style={{ padding: '16px 0' }}>
        <div style={{
          padding: '0 20px 8px',
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--color-text-light)',
        }}>Navigation</div>

        {[
          { path: '/', label: 'Home', icon: '🏠' },
          { path: '/articles', label: 'All Articles', icon: '📚' },
          { path: '/assessment', label: 'Risk Assessment', icon: '📊' },
          { path: '/tools', label: 'Recommended Tools', icon: '🛠️' },
          { path: '/about', label: 'About', icon: '👤' },
        ].map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 20px',
              fontSize: '13.5px',
              fontWeight: isActive(item.path) ? 600 : 400,
              color: isActive(item.path) ? 'var(--color-accent-dark)' : 'var(--color-text)',
              background: isActive(item.path) ? 'rgba(106,140,58,0.1)' : 'transparent',
              borderLeft: isActive(item.path) ? '3px solid var(--color-accent)' : '3px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '14px' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* ─── Categories ───────────────────────────────────────── */}
      {categories.length > 0 && (
        <div style={{
          padding: '16px 0',
          borderTop: '1px solid var(--color-sidebar-border)',
        }}>
          <div style={{
            padding: '0 20px 8px',
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-light)',
          }}>Categories</div>

          {categories.map(cat => (
            <Link
              key={cat.category}
              to={`/articles?category=${cat.category}`}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 20px',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: CATEGORY_COLORS[cat.category] || 'var(--color-accent)',
                  flexShrink: 0,
                }} />
                {cat.label}
              </span>
              <span style={{
                fontSize: '11px',
                background: 'var(--color-border)',
                color: 'var(--color-text-muted)',
                padding: '1px 7px',
                borderRadius: '99px',
                fontWeight: 600,
              }}>{cat.count}</span>
            </Link>
          ))}
        </div>
      )}

      {/* ─── Recent Articles ──────────────────────────────────── */}
      {recentArticles.length > 0 && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--color-sidebar-border)',
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-light)',
            marginBottom: '10px',
          }}>Recent</div>
          {recentArticles.map(a => (
            <Link
              key={a.slug}
              to={`/articles/${a.slug}`}
              onClick={onClose}
              style={{
                display: 'block',
                fontSize: '12.5px',
                color: 'var(--color-text)',
                textDecoration: 'none',
                marginBottom: '10px',
                lineHeight: 1.4,
                fontWeight: 500,
              }}
            >
              {a.title}
            </Link>
          ))}
        </div>
      )}

      {/* ─── Assessment CTA ───────────────────────────────────── */}
      <div style={{
        margin: '16px',
        padding: '16px',
        background: 'linear-gradient(135deg, #6A8C3A, #4E6B28)',
        borderRadius: '10px',
        color: 'white',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '20px', marginBottom: '8px' }}>📊</div>
        <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
          Know Your Risk
        </div>
        <div style={{ fontSize: '11.5px', opacity: 0.9, marginBottom: '12px', lineHeight: 1.4 }}>
          Take the 5-minute prediabetes risk assessment
        </div>
        <Link
          to="/assessment"
          onClick={onClose}
          style={{
            display: 'block',
            background: 'white',
            color: '#4E6B28',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Start Assessment
        </Link>
      </div>
    </aside>
  );
}
