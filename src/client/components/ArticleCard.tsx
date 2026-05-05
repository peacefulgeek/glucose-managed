import React from 'react';
import { Link } from 'react-router-dom';

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
  'reversal': 'Reversal',
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

// Curated image pool for categories
const CATEGORY_IMAGES: Record<string, string[]> = {
  'diagnosis': [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80',
  ],
  'diet': [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80',
  ],
  'exercise': [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  ],
  'supplements': [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80',
  ],
  'monitoring': [
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
  ],
  'lifestyle': [
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  ],
  'mindset': [
    'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  ],
  'medication': [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
  ],
  'reversal': [
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  ],
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getImageForArticle(article: Article): string {
  if (article.hero_url && !article.hero_url.includes('REPLACE')) {
    return article.hero_url;
  }
  const pool = CATEGORY_IMAGES[article.category] || CATEGORY_IMAGES['diet'];
  const idx = hashCode(article.slug) % pool.length;
  return pool[idx];
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact';
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const imageUrl = getImageForArticle(article);
  const categoryColor = CATEGORY_COLORS[article.category] || '#6A8C3A';
  const categoryLabel = CATEGORY_LABELS[article.category] || article.category;

  if (variant === 'compact') {
    return (
      <Link to={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '12px',
          borderRadius: '8px',
          transition: 'background 0.15s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-sidebar-bg)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <img
            src={imageUrl}
            alt={article.title}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '6px',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: categoryColor,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '4px',
            }}>{categoryLabel}</div>
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text)',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>{article.title}</div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link to={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
        <div className="card" style={{ height: '100%' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={imageUrl}
              alt={article.title}
              className="card-image"
              style={{ aspectRatio: '16/9' }}
            />
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: categoryColor,
              color: 'white',
              padding: '4px 10px',
              borderRadius: '99px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>{categoryLabel}</div>
          </div>
          <div className="card-body">
            <h3 className="card-title" style={{ fontSize: '20px' }}>{article.title}</h3>
            {article.meta_description && (
              <p className="card-excerpt">{article.meta_description}</p>
            )}
            <div className="card-meta">
              <span>By The Oracle Lover</span>
              <span>·</span>
              <span>{article.reading_time || 7} min read</span>
              {article.published_at && (
                <>
                  <span>·</span>
                  <span>{formatDate(article.published_at)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ height: '100%' }}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src={imageUrl}
            alt={article.title}
            className="card-image"
            style={{
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: categoryColor,
            color: 'white',
            padding: '3px 8px',
            borderRadius: '99px',
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>{categoryLabel}</div>
        </div>
        <div className="card-body">
          <h3 className="card-title">{article.title}</h3>
          {article.meta_description && (
            <p className="card-excerpt">{article.meta_description}</p>
          )}
          <div className="card-meta">
            <span>{article.reading_time || 7} min read</span>
            {article.published_at && (
              <>
                <span>·</span>
                <span>{formatDate(article.published_at)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
