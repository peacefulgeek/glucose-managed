import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import { HelmetProvider } from 'react-helmet-async';
import { App } from '../src/client/App';
import { query } from '../src/lib/db.mjs';
import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_NAME = 'Glucose Managed';
const SITE_DESCRIPTION = 'The prediabetes resource that treats you like an intelligent adult. Glucose science, protocols, and a realistic roadmap to reversing the trend.';

// Cache CSS filename
let _cssFile: string | null = null;
async function getCssFile(): Promise<string> {
  if (_cssFile) return _cssFile;
  try {
    const assetsDir = path.join(__dirname, '../client/assets');
    const files = await readdir(assetsDir);
    const css = files.find(f => f.endsWith('.css'));
    _cssFile = css ? `/assets/${css}` : '/assets/main.css';
  } catch {
    _cssFile = '/assets/main.css';
  }
  return _cssFile;
}

export async function render(url: string, req: any) {
  const helmetContext: any = {};

  // Pre-fetch data for SSR
  let ssrData: any = {};
  try {
    const cleanUrl = url.split('?')[0];
    if (cleanUrl === '/' || cleanUrl === '') {
      const { rows: articles } = await query(
        `SELECT id, slug, title, meta_description, category, tags, hero_url, reading_time, published_at FROM articles WHERE status = 'published' ORDER BY published_at DESC LIMIT 12`
      );
      ssrData = { articles };
    } else if (cleanUrl.startsWith('/articles/') && cleanUrl.split('/').length === 3) {
      const slug = cleanUrl.split('/')[2];
      const { rows } = await query(
        `SELECT * FROM articles WHERE slug = $1 AND status = 'published'`,
        [slug]
      );
      ssrData = { article: rows[0] || null };
    } else if (cleanUrl === '/articles') {
      const { rows: articles } = await query(
        `SELECT id, slug, title, meta_description, category, tags, hero_url, reading_time, published_at FROM articles WHERE status = 'published' ORDER BY published_at DESC`
      );
      ssrData = { articles };
    }
  } catch (err) {
    console.error('[SSR] Data fetch error:', err);
  }

  const appHtml = renderToString(
    React.createElement(
      HelmetProvider,
      { context: helmetContext },
      React.createElement(
        StaticRouter,
        { location: url },
        React.createElement(App, { ssrData })
      )
    )
  );

  const { helmet } = helmetContext;
  const cssFile = await getCssFile();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${helmet?.title?.toString() || `<title>${SITE_NAME}</title>`}
  ${helmet?.meta?.toString() || `<meta name="description" content="${SITE_DESCRIPTION}" />`}
  ${helmet?.link?.toString() || ''}
  ${helmet?.script?.toString() || ''}
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${cssFile}" />
  <script>window.__SSR_DATA__ = ${JSON.stringify(ssrData).replace(/</g, '\\u003c')};</script>
</head>
<body>
  <div id="root">${appHtml}</div>
  <script type="module" src="/assets/index.js"></script>
</body>
</html>`;

  return { html, status: 200 };
}
