import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer style={{
      background: '#1E2D0E',
      color: 'rgba(255,255,255,0.8)',
      padding: '48px 32px 24px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          marginBottom: '40px',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #6A8C3A, #8AB54E)',
                borderRadius: '7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'white' }}>Blood Sugar Blueprint</div>
                <div style={{ fontSize: '11px', color: '#8AB54E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Metabolic Health
                </div>
              </div>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.65)', marginBottom: '12px' }}>
              The prediabetes resource that treats you like an intelligent adult.
              Pure biochemistry. No guilt. Real protocols.
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
              Niche tag: #prediabetes #glucosemanagement #metabolichealth
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
              Explore
            </h4>
            {[
              { to: '/', label: 'Home' },
              { to: '/articles', label: 'All Articles' },
              { to: '/assessment', label: 'Risk Assessment' },
              { to: '/tools', label: 'Recommended Tools' },
              { to: '/about', label: 'About' },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: 'block',
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  marginBottom: '8px',
                  transition: 'color 0.15s',
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
              Legal
            </h4>
            <Link to="/privacy-policy" style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', marginBottom: '8px' }}>
              Privacy Policy
            </Link>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginTop: '12px' }}>
              As an Amazon Associate I earn from qualifying purchases.
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginTop: '8px' }}>
              This site is for informational purposes only. Not medical advice. Consult your healthcare provider.
            </p>
          </div>

          {/* Connect */}
          <div>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
              Connect
            </h4>
            <a
              href="https://theoraclelover.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: '#8AB54E',
                textDecoration: 'none',
                fontWeight: 600,
                marginBottom: '12px',
              }}
            >
              The Oracle Lover
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
              </svg>
            </a>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
              Intuitive Educator & Oracle Guide
            </p>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            © {new Date().getFullYear()} Blood Sugar Blueprint. All rights reserved.
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
            Written by The Oracle Lover — theoraclelover.com
          </p>
        </div>
      </div>
    </footer>
  );
}
