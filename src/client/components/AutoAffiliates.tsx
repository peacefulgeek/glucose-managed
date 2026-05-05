import React from 'react';

interface Product {
  asin: string;
  name: string;
  category: string;
  tags: string[];
  description?: string;
}

interface AutoAffiliatesProps {
  articleTitle: string;
  articleTags: string[];
  articleCategory: string;
  catalog: Product[];
  bottomSectionName?: string;
}

const AMAZON_TAG = 'spankyspinola-20';

function buildAmazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

function scoreProduct(product: Product, title: string, tags: string[], category: string): number {
  let score = 0;
  const productTags = Array.isArray(product.tags) ? product.tags : [];
  if (product.category === category) score += 10;
  for (const tag of tags) {
    if (productTags.includes(tag)) score += 3;
  }
  const titleWords = title.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  const name = (product.name || '').toLowerCase();
  for (const w of titleWords) {
    if (name.includes(w)) score += 2;
  }
  return score;
}

const SOFT_INTROS = [
  'One option that many people find helpful is',
  'A tool that often helps with this is',
  'Something worth considering might be',
  'For those looking for a simple solution, this works well:',
  'You could also try',
  'A popular choice for situations like this is',
];

export function AutoAffiliates({
  articleTitle,
  articleTags,
  articleCategory,
  catalog,
  bottomSectionName = 'Metabolic Health Library',
}: AutoAffiliatesProps) {
  const scored = catalog
    .map(p => ({ product: p, score: scoreProduct(p, articleTitle, articleTags, articleCategory) }))
    .sort((a, b) => b.score - a.score);

  const products = scored.slice(0, 4).map(s => s.product);
  if (products.length < 3) return null;

  return (
    <section
      className="metabolic-library"
      aria-label={bottomSectionName}
      style={{ marginTop: '40px' }}
    >
      <h3 style={{
        fontSize: '18px',
        fontWeight: 700,
        color: 'var(--color-accent-dark)',
        marginBottom: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span>📚</span> {bottomSectionName}
      </h3>
      <p style={{
        fontSize: '13px',
        color: 'var(--color-text-muted)',
        marginBottom: '16px',
        fontStyle: 'italic',
      }}>
        Tools and resources that support glucose management and metabolic health.
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {products.map((p, idx) => (
          <li key={p.asin} style={{
            padding: '14px 0',
            borderBottom: idx < products.length - 1 ? '1px solid var(--color-border)' : 'none',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #6A8C3A22, #6A8C3A44)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '14px',
            }}>
              {idx === 0 ? '🏆' : idx === 1 ? '⭐' : idx === 2 ? '✅' : '💡'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: '0 0 4px', lineHeight: 1.4 }}>
                {SOFT_INTROS[idx % SOFT_INTROS.length]}
              </p>
              <a
                href={buildAmazonUrl(p.asin)}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                }}
              >
                {p.name}
              </a>
              <span style={{
                fontSize: '11px',
                color: 'var(--color-text-light)',
                marginLeft: '6px',
              }}>(paid link)</span>
              {p.description && (
                <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', margin: '4px 0 0', lineHeight: 1.5 }}>
                  {p.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="affiliate-disclosure" style={{ marginTop: '16px' }}>
        As an Amazon Associate, I earn from qualifying purchases.
      </p>
    </section>
  );
}
