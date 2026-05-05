import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ArticlePage } from './pages/ArticlePage';
import { AboutPage } from './pages/AboutPage';
import { ToolsPage } from './pages/ToolsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { NotFoundPage } from './pages/NotFoundPage';
import './styles/tokens.css';

interface AppProps {
  ssrData?: any;
}

export function App({ ssrData = {} }: AppProps) {
  return (
    <>
      <Helmet defaultTitle="Blood Sugar Blueprint" titleTemplate="%s | Blood Sugar Blueprint">
        <meta name="description" content="The prediabetes resource that treats you like an intelligent adult. Glucose science, protocols, and a realistic roadmap to reversing the trend before it becomes a diagnosis." />
        <meta name="author" content="The Oracle Lover" />
        <meta property="og:site_name" content="Blood Sugar Blueprint" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://bloodsugarblueprint.com" />
      </Helmet>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage ssrData={ssrData} />} />
          <Route path="/articles" element={<ArticlesPage ssrData={ssrData} />} />
          <Route path="/articles/:slug" element={<ArticlePage ssrData={ssrData} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </>
  );
}
