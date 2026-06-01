#!/usr/bin/env node
/**
 * GlucoseManaged Article Date-Gating (4/week)
 *
 * Rules:
 *   - Published articles (status: "published") are NEVER touched
 *   - Gated articles get future dates at 4/week (Mon, Tue, Wed, Thu)
 *   → status: "gated", publish_date: <future date>
 *
 * Usage:
 *   node scripts/apply-gating.mjs [--dry-run]
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const FILE = resolve('src/data/articles-db.json');

const GATED_START   = '2026-06-08'; // next Monday
const PER_WEEK      = 4;            // Mon–Thu, 1/day

// ── Helpers ──────────────────────────────────────────────────────────────────
function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Generate dates at 4/week (Mon, Tue, Wed, Thu only)
 */
function fourPerWeekDates(startDate, count) {
  const dates = [];
  let current = new Date(startDate + 'T12:00:00Z');
  // Ensure we start on a Monday
  while (current.getUTCDay() !== 1) {
    current.setUTCDate(current.getUTCDate() + 1);
  }
  while (dates.length < count) {
    const dow = current.getUTCDay(); // 0=Sun, 1=Mon, ..., 4=Thu
    if (dow >= 1 && dow <= 4) { // Mon–Thu
      dates.push(current.toISOString().slice(0, 10));
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

// ── Load ─────────────────────────────────────────────────────────────────────
const db = JSON.parse(readFileSync(FILE, 'utf-8'));
const arts = db.articles;
const total = arts.length;

// Separate published (NEVER touched) from gated
const published = arts.filter(a => a.status === 'published');
const gatedPool = arts.filter(a => a.status !== 'published');

// Shuffle gated for category distribution
const shuffled = [...gatedPool].sort(() => Math.random() - 0.5);

// ── Assign gated (future Mon–Thu dates, 4/week) ─────────────────────────────
const gatedDates = fourPerWeekDates(GATED_START, shuffled.length);
for (let i = 0; i < shuffled.length; i++) {
  shuffled[i].publish_date = gatedDates[i];
  shuffled[i].published_at = gatedDates[i] + 'T00:00:00.000Z';
  shuffled[i].status = 'gated';
}

// ── Summary ───────────────────────────────────────────────────────────────────
const lastGated = gatedDates[gatedDates.length - 1];

console.log('═══════════════════════════════════════════════════════════');
console.log('  GlucoseManaged Article Date-Gating (4/week)');
console.log('═══════════════════════════════════════════════════════════');
console.log(`  Total articles:    ${total}`);
console.log(`  Published (live):  ${published.length} (UNTOUCHED)`);
console.log(`  Gated (drip):      ${shuffled.length} at ${PER_WEEK}/week starting ${GATED_START}`);
console.log(`  Drip ends:         ${lastGated}`);
console.log(`  Dry run:           ${DRY_RUN}`);
console.log('═══════════════════════════════════════════════════════════');

// Show first 8 and last 4 gated dates
console.log('\nFirst 8 gated dates:', gatedDates.slice(0, 8).join(', '));
console.log('Last 4 gated dates: ', gatedDates.slice(-4).join(', '));

if (!DRY_RUN) {
  db.articles = [...published, ...shuffled];
  writeFileSync(FILE, JSON.stringify(db, null, 2));
  console.log(`\n✅ Written to ${FILE}`);
  console.log(`   Published: ${published.length}, Gated: ${shuffled.length}`);
} else {
  console.log('\n⚠️  Dry run — no changes written.');
}
