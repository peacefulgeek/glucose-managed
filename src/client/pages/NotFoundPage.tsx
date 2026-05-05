import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | Blood Sugar Blueprint</title>
      </Helmet>
      <div style={{ padding: '80px 32px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔍</div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>Page Not Found</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '17px', lineHeight: 1.7, marginBottom: '32px' }}>
          This page doesn't exist. But your glucose management journey does — and it starts here.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">Go Home</Link>
          <Link to="/articles" className="btn btn-outline">Browse Articles</Link>
        </div>
      </div>
    </>
  );
}
