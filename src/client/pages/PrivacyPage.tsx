import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Blood Sugar Blueprint</title>
      </Helmet>
      <div className="page-container" style={{ maxWidth: '800px' }}>
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />
        <h1>Privacy Policy</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <div className="article-body">
          <h2>Information We Collect</h2>
          <p>Blood Sugar Blueprint does not collect personal information unless you voluntarily provide it. We use standard server logs that may include IP addresses and browser information for security and analytics purposes.</p>
          <h2>Cookies</h2>
          <p>We use minimal cookies for site functionality. We do not use tracking cookies or sell your data to third parties.</p>
          <h2>Affiliate Links</h2>
          <p>This site contains affiliate links to Amazon. When you click these links, Amazon may set cookies to track your purchase. Amazon's privacy policy governs their data practices. As an Amazon Associate, we earn from qualifying purchases.</p>
          <h2>Third-Party Services</h2>
          <p>We may use analytics services to understand how visitors use the site. These services may collect anonymized usage data.</p>
          <h2>Contact</h2>
          <p>For privacy questions, contact us through <a href="https://theoraclelover.com" target="_blank" rel="noopener noreferrer">theoraclelover.com</a>.</p>
        </div>
      </div>
    </>
  );
}
