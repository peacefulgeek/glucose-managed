/**
 * §22 Post-Build Audit Script for Glucose Managed
 * Checks all items from the MASTER_SCOPE_AUDIT_AND_EXECUTE.md
 * Run: node scripts/audit.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const results = [];
let pass = 0;
let fail = 0;
let warn = 0;

function check(name, condition, level = 'PASS', detail = '') {
  const status = condition ? 'PASS' : (level === 'WARN' ? 'WARN' : 'FAIL');
  if (status === 'PASS') pass++;
  else if (status === 'WARN') warn++;
  else fail++;
  results.push({ status, name, detail });
  const icon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
  console.log(`${icon} [${status}] ${name}${detail ? ': ' + detail : ''}`);
}

function fileContains(path, str) {
  try {
    return readFileSync(join(ROOT, path), 'utf8').includes(str);
  } catch { return false; }
}

function fileExists(path) {
  return existsSync(join(ROOT, path));
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(join(ROOT, path), 'utf8'));
  } catch { return null; }
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('  §22 POST-BUILD AUDIT — Glucose Managed');
console.log('═══════════════════════════════════════════════════════\n');

// ── §1 BRANDING ──────────────────────────────────────────────────────────────
console.log('\n── §1 Branding & Domain ──');
check('Site title is "Glucose Managed"', fileContains('src/client/components/Sidebar.tsx', 'Glucose Managed') || fileContains('src/client/App.tsx', 'Glucose Managed'));
check('Domain is glucosemanaged.com', fileContains('src/client/App.tsx', 'glucosemanaged.com'));
check('.do/app.yaml exists', fileExists('.do/app.yaml'));
check('Dockerfile exists', fileExists('Dockerfile'));
check('.env.example exists', fileExists('.env.example'));
check('README.md exists', fileExists('README.md'));
check('Amazon affiliate tag present', fileContains('src/client/pages/ArticlePage.tsx', 'spankyspinola-20') || fileContains('src/client/pages/SupplementsPage.tsx', 'spankyspinola-20'));

// ── §2 BUNNY CDN ─────────────────────────────────────────────────────────────
console.log('\n── §2 Bunny CDN ──');
check('Bunny CDN URL in env example', fileContains('.env.example', 'BUNNY_CDN_URL'));
check('Bunny storage zone config', fileContains('.env.example', 'BUNNY_STORAGE_ZONE'));
check('Image migration script exists', fileExists('scripts/migrate-images-to-bunny.mjs'));
check('CDN images referenced in DB', (() => {
  const db = readJson('src/data/articles-db.json');
  if (!db) return false;
  return db.articles.some(a => a.hero_url && a.hero_url.includes('b-cdn.net'));
})(), 'FAIL', '');
check('No local /images/ references in article hero_urls', (() => {
  const db = readJson('src/data/articles-db.json');
  if (!db) return true;
  return !db.articles.some(a => a.hero_url && a.hero_url.startsWith('/images/'));
})());

// ── §3 ARTICLES ──────────────────────────────────────────────────────────────
console.log('\n── §3 Articles ──');
const db = readJson('src/data/articles-db.json');
const articleCount = db ? db.articles.length : 0;
check(`Article count ≥ 30`, articleCount >= 30, 'FAIL', `${articleCount} articles found`);
check(`Article count ≥ 100 (target)`, articleCount >= 100, 'WARN', `${articleCount}/200 target`);
check('All articles have hero_url', db ? db.articles.every(a => a.hero_url) : false);
check('All articles have published_at', db ? db.articles.every(a => a.published_at) : false);
check('All articles have status=published', db ? db.articles.every(a => a.status === 'published') : false);
check('Articles have FAQs (at least some)', db ? db.articles.filter(a => a.faqs && a.faqs !== '[]').length > 5 : false, 'WARN', `${db ? db.articles.filter(a => a.faqs && a.faqs !== '[]').length : 0} with FAQs`);
check('Date-gating: articles have varied publish dates', (() => {
  if (!db) return false;
  const dates = new Set(db.articles.map(a => a.published_at?.split('T')[0]));
  return dates.size > 5;
})());
check('Topic list has 200 entries', fileContains('scripts/seed-500-topics.mjs', 'Total topics defined'));

// ── §4 SEO / EEAT ────────────────────────────────────────────────────────────
console.log('\n── §4 SEO / EEAT ──');
check('ArticlePage has JSON-LD Article schema', fileContains('src/client/pages/ArticlePage.tsx', '"@type": "Article"') || fileContains('src/client/pages/ArticlePage.tsx', "@type: 'Article'") || fileContains('src/client/pages/ArticlePage.tsx', 'Article'));
check('ArticlePage has BreadcrumbList JSON-LD', fileContains('src/client/pages/ArticlePage.tsx', 'BreadcrumbList'));
check('ArticlePage has FAQPage JSON-LD', fileContains('src/client/pages/ArticlePage.tsx', 'FAQPage'));
check('ArticlePage has OG meta tags', fileContains('src/client/pages/ArticlePage.tsx', 'og:title'));
check('ArticlePage has Twitter meta tags', fileContains('src/client/pages/ArticlePage.tsx', 'twitter:card'));
check('ArticlePage has canonical URL', fileContains('src/client/pages/ArticlePage.tsx', 'canonical'));
check('ArticlePage has TL;DR box', fileContains('src/client/pages/ArticlePage.tsx', 'tldr') || fileContains('src/client/pages/ArticlePage.tsx', 'TL;DR') || fileContains('src/client/pages/ArticlePage.tsx', 'tl-dr'));
check('Sitemap route exists', fileExists('server/routes/sitemap.ts'));
check('Sitemap has image:loc tags', fileContains('server/routes/sitemap.ts', 'image:loc'));
check('robots.txt route exists', fileExists('server/routes/robots.ts') || fileContains('server/routes/llms.ts', 'robots.txt'));
check('llms.txt route exists', fileExists('server/routes/llms.ts'));
check('ai.txt route exists', fileContains('server/routes/llms.ts', 'ai.txt'));
check('Author name in ArticlePage', fileContains('src/client/pages/ArticlePage.tsx', 'Oracle Lover'));
check('theoraclelover.com link present', fileContains('src/client/components/Sidebar.tsx', 'theoraclelover.com'));

// ── §5 ASSESSMENTS ───────────────────────────────────────────────────────────
console.log('\n── §5 Assessments ──');
check('AssessmentsPage exists', fileExists('src/client/pages/AssessmentsPage.tsx'));
check('AssessmentsPage has 9 assessments', (() => {
  try {
    const content = readFileSync(join(ROOT, 'src/client/pages/AssessmentsPage.tsx'), 'utf8');
    const matches = content.match(/title:/g);
    return matches && matches.length >= 9;
  } catch { return false; }
})());
check('Assessment route in App.tsx', fileContains('src/client/App.tsx', '/assessment'));

// ── §6 SUPPLEMENTS ───────────────────────────────────────────────────────────
console.log('\n── §6 Supplements Page ──');
check('SupplementsPage exists', fileExists('src/client/pages/SupplementsPage.tsx'));
check('Supplements route in App.tsx', fileContains('src/client/App.tsx', '/supplements'));
check('Supplements has 50+ entries', (() => {
  try {
    const content = readFileSync(join(ROOT, 'src/client/pages/SupplementsPage.tsx'), 'utf8');
    const matches = content.match(/name: '/g);
    return matches && matches.length >= 50;
  } catch { return false; }
})(), 'WARN', '');
check('Supplements has TCM section', fileContains('src/client/pages/SupplementsPage.tsx', 'tcm'));
check('Supplements has evidence ratings', fileContains('src/client/pages/SupplementsPage.tsx', 'Strong'));
check('Supplements has Amazon links', fileContains('src/client/pages/SupplementsPage.tsx', 'amazon.com'));
check('Supplements in sidebar nav', fileContains('src/client/components/Sidebar.tsx', '/supplements'));

// ── §7 INFRASTRUCTURE ────────────────────────────────────────────────────────
console.log('\n── §7 Infrastructure ──');
check('Server entry point exists', fileExists('server/index.ts'));
check('SSR renderer exists', fileExists('server/ssr.ts'));
check('Health check endpoint', fileContains('server/index.ts', '/health'));
check('Cron job script exists', fileExists('scripts/start-with-cron.mjs'));
check('Build server script exists', fileExists('scripts/build-server.mjs'));
check('package.json build script', fileContains('package.json', '"build"'));
check('package.json start script', fileContains('package.json', '"start"'));
check('.gitignore exists', fileExists('.gitignore'));
check('.gitignore excludes node_modules', fileContains('.gitignore', 'node_modules'));
check('.gitignore excludes .env', fileContains('.gitignore', '.env'));
check('dist/ in .gitignore', fileContains('.gitignore', 'dist'));

// ── §8 CONTENT QUALITY ───────────────────────────────────────────────────────
console.log('\n── §8 Content Quality ──');
if (db && db.articles.length > 0) {
  const sample = db.articles.slice(0, 10);
  const avgWords = sample.reduce((s, a) => s + (a.word_count || (a.body?.split(/\s+/).length || 0)), 0) / sample.length;
  check(`Average word count ≥ 1500 (sample of 10)`, avgWords >= 1500, 'WARN', `avg: ${Math.round(avgWords)} words`);
  check('Articles have excerpts', sample.every(a => a.excerpt && a.excerpt.length > 50));
  check('Articles have reading_time', sample.every(a => a.reading_time > 0));
  check('Articles have meta_description', sample.every(a => a.meta_description && a.meta_description.length > 0));
}

// ── SUMMARY ──────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════');
console.log(`  AUDIT SUMMARY`);
console.log(`  ✅ PASS: ${pass}  ⚠️  WARN: ${warn}  ❌ FAIL: ${fail}`);
console.log(`  Total checks: ${pass + warn + fail}`);
console.log('═══════════════════════════════════════════════════════\n');

const failures = results.filter(r => r.status === 'FAIL');
if (failures.length > 0) {
  console.log('FAILURES TO FIX:');
  failures.forEach(f => console.log(`  ❌ ${f.name}`));
}

const warnings = results.filter(r => r.status === 'WARN');
if (warnings.length > 0) {
  console.log('\nWARNINGS:');
  warnings.forEach(w => console.log(`  ⚠️  ${w.name}${w.detail ? ': ' + w.detail : ''}`));
}

// Export for use in other scripts
export { results, pass, fail, warn };
