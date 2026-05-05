/**
 * Production startup script
 * Starts the server and initializes cron jobs
 */
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

async function start() {
  console.log('[start] Blood Sugar Blueprint starting in production mode...');

  // Initialize DB
  const { initDb } = await import('../src/lib/db.mjs');
  await initDb();

  // Start cron jobs
  const cron = await import('node-cron');

  // Daily article generation at 3 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('[cron] Running daily article check...');
    try {
      const { query } = await import('../src/lib/db.mjs');
      const { rows } = await query(`SELECT COUNT(*) as count FROM articles WHERE status = 'published'`);
      const count = parseInt(rows[0]?.count || '0');
      console.log(`[cron] Current article count: ${count}`);

      if (count < 30) {
        console.log('[cron] Article count below target, triggering seed...');
        // Import and run seeder for missing articles
        const { execSync } = await import('child_process');
        execSync('node scripts/bulk-seed.mjs', {
          cwd: ROOT,
          stdio: 'inherit',
          timeout: 300000, // 5 min timeout
        });
      }
    } catch (err) {
      console.error('[cron] Daily article check failed:', err.message);
    }
  });

  // Weekly content refresh at 4 AM Sunday
  cron.schedule('0 4 * * 0', async () => {
    console.log('[cron] Weekly content refresh...');
    try {
      const { query } = await import('../src/lib/db.mjs');
      // Update a random article's updated_at to keep content fresh
      await query(
        `UPDATE articles SET updated_at = NOW() WHERE id = (SELECT id FROM articles ORDER BY RANDOM() LIMIT 1)`
      );
      console.log('[cron] Content refresh complete');
    } catch (err) {
      console.error('[cron] Weekly refresh failed:', err.message);
    }
  });

  console.log('[start] Cron jobs initialized');

  // Start the main server
  await import('../dist/server/index.js');
}

start().catch(err => {
  console.error('[start] Fatal error:', err);
  process.exit(1);
});
