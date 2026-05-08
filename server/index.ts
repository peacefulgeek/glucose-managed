import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);
// In production, __dirname is dist/server, so ROOT must go up 2 levels
// In development, __dirname is server/, so ROOT goes up 1 level
const ROOT = isProd
  ? path.resolve(__dirname, '../..')
  : path.resolve(__dirname, '..');

async function createServer() {
  const app = express();

  // ─── WWW → apex redirect ──────────────────────────────────────────────────
  app.use((req, res, next) => {
    const host = req.headers.host || '';
    if (host.startsWith('www.')) {
      const apex = host.slice(4);
      const proto = req.headers['x-forwarded-proto'] || 'https';
      return res.redirect(301, `${proto}://${apex}${req.url}`);
    }
    next();
  });

  app.use(compression());
  app.use(express.json({ limit: '1mb' }));

  // ─── Health check (Render / any platform) ─────────────────────────────────
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', ts: new Date().toISOString() });
  });

  // ─── API routes ───────────────────────────────────────────────────────────
  const { articlesRouter } = await import('./routes/articles.js');
  const { sitemapRouter } = await import('./routes/sitemap.js');
  const { robotsRouter } = await import('./routes/robots.js');
  const { llmsRouter } = await import('./routes/llms.js');

  app.use('/api/articles', articlesRouter);
  app.use('/sitemap.xml', sitemapRouter);
  app.use('/robots.txt', robotsRouter);
  app.use('/', llmsRouter);

  if (isProd) {
    // ─── Production: serve built assets ──────────────────────────────────────
    const distClient = path.join(ROOT, 'dist/client');
    app.use(express.static(distClient, { maxAge: '1y', etag: false }));

    // Also serve public folder (images)
    app.use(express.static(path.join(ROOT, 'public')));

    // SSR handler — load from same dist/server directory
    const ssrPath = path.join(__dirname, 'ssr.js');
    const { render } = await import(ssrPath);

    app.get('*', async (req: any, res: any) => {
      try {
        const url = req.originalUrl;
        const { html, status } = await render(url, req);
        res.status(status || 200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e: any) {
        console.error('[SSR Error]', e);
        res.status(500).send('Internal Server Error');
      }
    });
  } else {
    // ─── Development: Vite middleware ─────────────────────────────────────────
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    // Serve public folder in dev too
    app.use(express.static(path.join(ROOT, 'public')));

    app.get('*', async (req: any, res: any) => {
      try {
        const url = req.originalUrl;
        const { render } = await vite.ssrLoadModule('/server/ssr.ts');
        const { html, status } = await render(url, req);
        res.status(status || 200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        console.error('[SSR Error]', e);
        res.status(500).send(e.message);
      }
    });
  }

  app.listen(PORT, () => {
    console.log(`[server] Glucose Managed running on port ${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

createServer().catch(err => {
  console.error('[server] Fatal startup error:', err);
  process.exit(1);
});
