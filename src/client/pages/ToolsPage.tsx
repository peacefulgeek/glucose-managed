import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Breadcrumbs } from '../components/Breadcrumbs';

const AMAZON_TAG = 'spankyspinola-20';

const TOOLS = [
  {
    category: 'Continuous Glucose Monitors',
    icon: '📡',
    items: [
      {
        asin: 'B0BQNZ6LZH',
        name: 'Dexcom G7 Continuous Glucose Monitor',
        description: 'The gold standard for real-time glucose monitoring. 10-day wear, no fingersticks required. Integrates with most smartphones.',
        badge: 'Editor\'s Pick',
        badgeColor: '#6A8C3A',
      },
      {
        asin: 'B0BQNZ6LZH',
        name: 'Libre 3 CGM System',
        description: 'The world\'s smallest CGM sensor. 14-day wear, real-time glucose readings every minute. Excellent for prediabetes monitoring.',
        badge: 'Best Value',
        badgeColor: '#E07B39',
      },
    ],
  },
  {
    category: 'Blood Glucose Meters',
    icon: '🩸',
    items: [
      {
        asin: 'B07GXQZLVB',
        name: 'Contour Next One Blood Glucose Meter',
        description: 'Clinically proven accuracy. Bluetooth connectivity. One of the most accurate meters available without a prescription.',
        badge: 'Most Accurate',
        badgeColor: '#3A7CB8',
      },
      {
        asin: 'B07GXQZLVB',
        name: 'Keto-Mojo GK+ Glucose & Ketone Meter',
        description: 'Measures both blood glucose and ketones. Essential for anyone following a low-carb or ketogenic protocol.',
        badge: 'Dual Monitor',
        badgeColor: '#9B59B6',
      },
    ],
  },
  {
    category: 'Supplements',
    icon: '💊',
    items: [
      {
        asin: 'B07GXQZLVB',
        name: 'Berberine HCl 1200mg',
        description: 'The most researched natural compound for glucose management. Multiple RCTs show A1c reduction comparable to metformin in some studies.',
        badge: 'Research-Backed',
        badgeColor: '#27AE60',
      },
      {
        asin: 'B07GXQZLVB',
        name: 'Magnesium Glycinate 400mg',
        description: 'Magnesium deficiency is common in prediabetes. Glycinate form is best absorbed and gentlest on the stomach.',
        badge: 'Essential',
        badgeColor: '#6A8C3A',
      },
      {
        asin: 'B07GXQZLVB',
        name: 'Chromium Picolinate 400mcg',
        description: 'Chromium plays a role in insulin signaling. Research supports modest improvements in fasting glucose and insulin sensitivity.',
        badge: 'Supportive',
        badgeColor: '#E07B39',
      },
    ],
  },
  {
    category: 'Books',
    icon: '📚',
    items: [
      {
        asin: 'B07GXQZLVB',
        name: 'Glucose Revolution by Jessie Inchauspé',
        description: 'The most accessible explanation of glucose spikes and how to flatten them. Practical, science-backed, and actually readable.',
        badge: 'Best Starter',
        badgeColor: '#6A8C3A',
      },
      {
        asin: 'B07GXQZLVB',
        name: 'The Diabetes Code by Dr. Jason Fung',
        description: 'A deep dive into insulin resistance and the case for dietary intervention. Challenging but important reading.',
        badge: 'Deep Dive',
        badgeColor: '#3A7CB8',
      },
    ],
  },
];

export function ToolsPage() {
  return (
    <>
      <Helmet>
        <title>Recommended Tools | Glucose Managed</title>
        <meta name="description" content="Glucose monitors, supplements, and books that support prediabetes management. Curated by The Oracle Lover." />
      </Helmet>

      <div className="page-container" style={{ maxWidth: '900px' }}>
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Recommended Tools' }]} />

        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>
          Recommended Tools
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '16px', marginBottom: '8px' }}>
          Curated by The Oracle Lover. Only things I'd actually recommend.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-light)', fontStyle: 'italic', marginBottom: '40px' }}>
          As an Amazon Associate I earn from qualifying purchases. Affiliate links are marked with (paid link).
        </p>

        {TOOLS.map(section => (
          <div key={section.category} style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '24px' }}>{section.icon}</span>
              <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{section.category}</h2>
            </div>

            <div className="grid-2">
              {section.items.map(item => (
                <div key={item.asin} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-card)',
                  position: 'relative',
                }}>
                  {item.badge && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: item.badgeColor,
                      color: 'white',
                      padding: '3px 10px',
                      borderRadius: '99px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}>{item.badge}</div>
                  )}
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', paddingRight: '80px' }}>
                    {item.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                    {item.description}
                  </p>
                  <a
                    href={`https://www.amazon.com/dp/${item.asin}?tag=${AMAZON_TAG}`}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    className="btn btn-primary"
                    style={{ fontSize: '13px', padding: '8px 16px' }}
                  >
                    View on Amazon (paid link)
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="health-disclaimer">
          <strong>Disclaimer:</strong> These recommendations are for informational purposes only.
          Always consult your healthcare provider before starting any supplement or monitoring protocol.
          Individual results vary.
        </div>
      </div>
    </>
  );
}
