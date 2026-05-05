# Blood Sugar Blueprint

> The prediabetes resource that treats you like an intelligent adult.

A full-stack metabolic health content site built with Node.js + Express + Vite + React SSR.

**Author:** The Oracle Lover — [theoraclelover.com](https://theoraclelover.com)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Server | Node.js 20 + Express |
| Frontend | React 18 + Vite (SSR) |
| Database | PostgreSQL (production) / JSON file (development) |
| Styling | Custom CSS with design tokens |
| AI | OpenAI GPT-4.1-mini (article generation) |
| CDN | Bunny CDN (images) |
| Hosting | DigitalOcean App Platform |

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Seed articles (requires OPENAI_API_KEY)
node scripts/bulk-seed.mjs

# Start development server
pnpm dev
```

The site runs at [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
blood-sugar-blueprint/
├── server/                 # Express server + API routes
│   ├── index.ts            # Main server entry point
│   ├── ssr.ts              # Server-side rendering
│   └── routes/             # API route handlers
├── src/
│   ├── client/             # React frontend
│   │   ├── App.tsx         # Root component + routing
│   │   ├── components/     # Shared components
│   │   ├── pages/          # Page components
│   │   └── styles/         # CSS design tokens
│   ├── data/               # JSON file storage (dev)
│   └── lib/                # Shared utilities
│       ├── db.mjs          # Database abstraction
│       ├── aeo.mjs         # AEO + LLM discoverability
│       └── bunny.mjs       # Bunny CDN integration
├── scripts/                # Utility scripts
│   ├── bulk-seed.mjs       # Generate 30 articles
│   ├── build-server.mjs    # Build server for production
│   └── start-with-cron.mjs # Production startup with cron
├── public/                 # Static assets
│   └── images/             # Hero images (local dev)
├── .do/                    # DigitalOcean config
│   └── app.yaml            # App Platform spec
├── Dockerfile              # Container deployment
└── vite.config.ts          # Vite configuration
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes (for seeding) | OpenAI API key |
| `OPENAI_MODEL` | No | Model name (default: `gpt-4.1-mini`) |
| `DATABASE_URL` | No | PostgreSQL connection string |
| `AMAZON_ASSOCIATE_TAG` | No | Amazon affiliate tag |
| `BUNNY_STORAGE_ZONE` | No | Bunny CDN storage zone |
| `BUNNY_API_KEY` | No | Bunny CDN API key |
| `BUNNY_CDN_URL` | No | Bunny CDN base URL |

---

## Scripts

```bash
pnpm dev              # Start development server (hot reload)
pnpm build            # Build for production
pnpm start            # Start production server with cron jobs
node scripts/bulk-seed.mjs    # Generate all 30 articles
node scripts/seed-remaining.mjs  # Generate missing articles
```

---

## Deployment

### DigitalOcean App Platform

1. Push to GitHub
2. Create a new App in DigitalOcean
3. Connect your GitHub repo
4. Use the `.do/app.yaml` spec or configure manually:
   - **Build command:** `pnpm install && pnpm build`
   - **Run command:** `node scripts/start-with-cron.mjs`
   - **HTTP port:** `3000`
   - **Health check:** `/health`
5. Add environment variables (see `.env.example`)
6. Deploy

### Database

For production, provision a **DigitalOcean Managed PostgreSQL** database and set `DATABASE_URL`. The schema is auto-created on first startup via `initDb()`.

For development, the site uses a JSON file at `src/data/articles-db.json` — no database needed.

### Bunny CDN

1. Create a Bunny CDN storage zone
2. Set `BUNNY_STORAGE_ZONE`, `BUNNY_API_KEY`, and `BUNNY_CDN_URL`
3. Images will be served from CDN instead of `/public/images/`

---

## Content

### Article Categories

| Category | Articles |
|----------|---------|
| Diagnosis | 5 |
| Diet & Nutrition | 6 |
| Exercise | 4 |
| Supplements | 4 |
| Monitoring | 3 |
| Lifestyle | 3 |
| Mindset | 2 |
| Reversal Protocols | 3 |

### Adding Articles

Articles are generated via the OpenAI writing engine and stored in PostgreSQL (or JSON file in dev). To add more:

```bash
# Edit scripts/bulk-seed.mjs to add new article specs
# Then run:
node scripts/bulk-seed.mjs
```

---

## SEO & AEO

- **Sitemap:** `/sitemap.xml`
- **Robots:** `/robots.txt`
- **LLMs.txt:** `/llms.txt`
- **LLMs Full:** `/llms-full.txt`
- **JSON-LD:** Article, FAQ, BreadcrumbList schemas on every page
- **Canonical URLs:** Auto-generated from request host
- **OG tags:** Per-article open graph metadata

---

## Affiliate Disclosure

This site participates in the Amazon Associates program. Affiliate links are marked with `(paid link)` and use `rel="nofollow sponsored noopener"`.

---

## License

Private. All rights reserved. © The Oracle Lover.
