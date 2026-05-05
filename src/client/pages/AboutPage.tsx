import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About | Blood Sugar Blueprint</title>
        <meta name="description" content="Blood Sugar Blueprint is written by The Oracle Lover — a no-BS metabolic health educator with a science background and zero tolerance for food guilt." />
      </Helmet>

      <div className="page-container" style={{ maxWidth: '800px' }}>
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #1E2D0E, #2D4A1A)',
          borderRadius: '16px',
          padding: '48px 40px',
          color: 'white',
          marginBottom: '48px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔮</div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'white', marginBottom: '12px' }}>
              The Oracle Lover
            </h1>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>
              Intuitive Educator · Metabolic Health Writer · Oracle Guide
            </p>
            <a href="https://theoraclelover.com" target="_blank" rel="noopener noreferrer"
              style={{ color: '#8AB54E', fontWeight: 600, fontSize: '14px' }}>
              theoraclelover.com ↗
            </a>
          </div>
        </div>

        {/* About content */}
        <div className="article-body">
          <h2>What is Blood Sugar Blueprint?</h2>
          <p>
            Blood Sugar Blueprint is a metabolic health resource built on one principle:
            <strong> you deserve to understand what's happening in your own body.</strong>
          </p>
          <p>
            Most prediabetes content online is either terrifying or patronizing. You either get
            a wall of doom statistics, or you get a listicle that says "eat less sugar and walk more."
            Neither actually helps you understand the biochemistry, the research, or what you can
            realistically do about it.
          </p>
          <p>
            This site exists to fill that gap. Every article is written to explain the science clearly,
            reference the actual research, and give you a realistic protocol — not a guilt trip.
          </p>

          <h2>Who Writes This?</h2>
          <p>
            I'm The Oracle Lover — a writer and educator with a science background, a deep interest
            in metabolic health, and a side life as an oracle guide and intuitive educator at
            <a href="https://theoraclelover.com" target="_blank" rel="noopener noreferrer"> theoraclelover.com</a>.
          </p>
          <p>
            I came to this topic personally. When someone close to me received a prediabetes diagnosis,
            I spent months in the research literature trying to understand what it actually meant and
            what actually worked. What I found was that the science is genuinely hopeful — but almost
            none of it was being communicated clearly to people who needed it.
          </p>
          <p>
            So I started writing it down. Blood Sugar Blueprint is the result.
          </p>

          <h2>Editorial Standards</h2>
          <p>Every article on this site:</p>
          <ul>
            <li>References peer-reviewed research where available</li>
            <li>Distinguishes between strong evidence and preliminary findings</li>
            <li>Avoids making medical claims or giving personalized medical advice</li>
            <li>Links to primary sources so you can verify everything yourself</li>
            <li>Is updated when new research changes the picture</li>
          </ul>

          <h2>Affiliate Disclosure</h2>
          <p>
            Some articles on this site contain affiliate links to products on Amazon.
            As an Amazon Associate, I earn a small commission from qualifying purchases.
            This never influences what I recommend — I only include products that are
            genuinely relevant to the topic and that I'd stand behind.
          </p>

          <h2>Medical Disclaimer</h2>
          <p>
            Nothing on this site is medical advice. Blood Sugar Blueprint is an educational
            resource. Prediabetes and diabetes management require the supervision of a qualified
            healthcare provider. Please consult your doctor before making changes to your diet,
            exercise routine, or medication.
          </p>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/articles" className="btn btn-primary">Browse Articles</Link>
          <Link to="/assessment" className="btn btn-outline">Take Risk Assessment</Link>
        </div>
      </div>
    </>
  );
}
