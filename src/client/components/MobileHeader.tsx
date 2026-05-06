import React from 'react';
import { Link } from 'react-router-dom';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header style={{
      display: 'none',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      height: '56px',
      background: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 200,
    }}
    className="mobile-header"
    >
      <button
        className="hamburger-btn"
        onClick={onMenuClick}
        aria-label="Open menu"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
        <span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--color-text)' }} />
        <span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--color-text)' }} />
        <span style={{ display: 'block', width: '16px', height: '2px', background: 'var(--color-text)' }} />
      </button>

      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          background: 'linear-gradient(135deg, #6A8C3A, #4E6B28)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '15px',
          color: 'var(--color-text)',
        }}>Glucose Managed</span>
      </Link>

      <Link
        to="/assessment"
        style={{
          background: 'var(--color-accent)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Test
      </Link>
    </header>
  );
}
