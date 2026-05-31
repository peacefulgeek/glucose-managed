#!/usr/bin/env node
/**
 * GlucoseManaged Article Date-Gating
 *
 * - 30 articles backdated randomly between 2026-01-01 and 2026-05-08 (today)
 *   → status: "published", publish_date: <past date>
 * - Remaining 514 gated at 5/week (Mon–Fri, 1/day) starting 2026-05-11
 *   → status: "gated", publish_date: <future date>
 *
 * Usage:
 *   node scripts/apply-gating.mjs [--dry-run]
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const FILE = resolve('src/data/articles-db.json');

const VISIBLE_COUNT = 30;
const VISIBLE_START = '2026-01-01';
const VISIBLE_END   = '2026-05-08';  // today
const GATED_START   = '2026-05-11'; // next Monday
const PER_WEEK      = 5;            // Mon–Fri, 1/day

// ── Helpers ──────────────────────────────────────────────────────────────────
function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function randomDateBetween(start, end) {
  const s = new Date(start + 'T00:00:00Z').getTime();
  const e = new Date(end   + 'T00:00:00Z').getTime();
  const rand = s + Math.random() * (e - s);
  return new Date(rand).toISOString().slice(0, 10);
}

// Assign weekday dates at PER_WEEK/week (skip Sat/Sun)
function weekdayDates(startDate, count) {
  const dates = [];
  let current = new Date(startDate + 'T12:00:00Z');
  while (dates.length < count) {
    const dow = current.getUTCDay(); // 0=Sun, 6=Sat
    if (dow !== 0 && dow !== 6) {
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

// Shuffle all articles for random category distribution
const shuffled = [...arts].sort(() => Math.random() - 0.5);

// Use exact counts — slice ensures exactly VISIBLE_COUNT published
const visiblePool = shuffled.slice(0, VISIBLE_COUNT);   // exactly 30
const gatedPool   = shuffled.slice(VISIBLE_COUNT);       // exactly 514

// ── Assign visible (backdated, published) ─────────────────────────────────────
for (const a of visiblePool) {
  const date = randomDateBetween(VISIBLE_START, VISIBLE_END);
  a.publish_date = date;
  a.published_at = date + 'T00:00:00.000Z';
  a.status = 'published';
}

// ── Assign gated (future weekday dates, 1/day Mon–Fri) ───────────────────────
const gatedDates = weekdayDates(GATED_START, gatedPool.length);
for (let i = 0; i < gatedPool.length; i++) {
  gatedPool[i].publish_date = gatedDates[i];
  gatedPool[i].published_at = gatedDates[i] + 'T00:00:00.000Z';
  gatedPool[i].status = 'gated';
}

// ── Summary ───────────────────────────────────────────────────────────────────
const allAssigned = [...visiblePool, ...gatedPool];
const statusCounts = {};
for (const a of allAssigned) {
  statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
}
const lastGated = gatedDates[gatedDates.length - 1];

console.log('═══════════════════════════════════════════════════════════');
console.log('  GlucoseManaged Article Date-Gating');
console.log('═══════════════════════════════════════════════════════════');
console.log(`  Total articles:    ${total}`);
console.log(`  Published (live):  ${visiblePool.length} (${VISIBLE_START} → ${VISIBLE_END})`);
console.log(`  Gated (drip):      ${gatedPool.length} at ${PER_WEEK}/week starting ${GATED_START}`);
console.log(`  Drip ends:         ${lastGated}`);
console.log(`  Dry run:           ${DRY_RUN}`);
console.log('═══════════════════════════════════════════════════════════');

// Show first 5 and last 5 gated dates
console.log('\nFirst 5 gated dates:', gatedDates.slice(0, 5).join(', '));
console.log('Last 5 gated dates: ', gatedDates.slice(-5).join(', '));

if (!DRY_RUN) {
  // Write all articles (visible + gated) — order doesn't matter for JSON lookup
  db.articles = [...visiblePool, ...gatedPool];

  writeFileSync(FILE, JSON.stringify(db, null, 2));
  console.log(`\n✅ Written to ${FILE}`);
  console.log(`   Published: ${visiblePool.length}, Gated: ${gatedPool.length}`);
} else {
  console.log('\n⚠️  Dry run — no changes written.');
}
