/**
 * Article Quality Gate — Glucose Managed (Site 109)
 * Every article must pass ALL checks before being stored.
 * Failed gate = regenerate, not skip.
 */

const BANNED_WORDS = [
  'profound', 'transformative', 'holistic', 'nuanced', 'multifaceted',
  'delve', 'tapestry', 'paradigm', 'synergy', 'leverage', 'unlock',
  'empower', 'utilize', 'pivotal', 'embark', 'underscore', 'paramount',
  'seamlessly', 'robust', 'beacon', 'foster', 'elevate', 'curate',
  'curated', 'bespoke', 'resonate', 'harness', 'intricate', 'plethora',
  'myriad', 'groundbreaking', 'innovative', 'cutting-edge', 'state-of-the-art',
  'game-changer', 'game-changing', 'ever-evolving', 'rapidly-evolving',
  'stakeholders', 'comprehensive'
];

const BANNED_PHRASES = [
  "it's important to note that",
  "it's worth noting that",
  "it's crucial to",
  "in conclusion,",
  "in summary,",
  "in the realm of",
  "a holistic approach",
  "unlock your potential",
  "dive deep into",
  "at the end of the day",
  "move the needle",
  "it goes without saying",
  "in today's fast-paced world",
  "in today's digital age",
  "journey (metaphorical)",
  "navigate (metaphorical)"
];

const MIN_WORDS = 1200;
const MAX_WORDS = 2500;

/**
 * Count words in text (strips HTML tags first)
 */
function countWords(text) {
  const stripped = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return stripped.split(' ').filter(w => w.length > 0).length;
}

/**
 * Run all quality checks on article body text.
 * Returns { passed: boolean, failures: string[] }
 */
export function runQualityGate(body) {
  const failures = [];
  const lower = body.toLowerCase();

  // 1. Word count
  const wordCount = countWords(body);
  if (wordCount < MIN_WORDS) {
    failures.push(`word_count_too_low: ${wordCount} (min ${MIN_WORDS})`);
  }
  if (wordCount > MAX_WORDS) {
    failures.push(`word_count_too_high: ${wordCount} (max ${MAX_WORDS})`);
  }

  // 2. Em-dash check (Google AI signal — zero tolerance)
  const emDashCount = (body.match(/—/g) || []).length;
  if (emDashCount > 0) {
    failures.push(`em_dash_found: ${emDashCount} occurrences`);
  }

  // 3. Banned words
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(`\\b${word.replace(/-/g, '[- ]')}\\b`, 'i');
    if (regex.test(lower)) {
      failures.push(`banned_word: "${word}"`);
    }
  }

  // 4. Banned phrases
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) {
      failures.push(`banned_phrase: "${phrase}"`);
    }
  }

  // 5. Amazon links check (min 3, max 4)
  const amazonLinks = (body.match(/amazon\.com\/dp\//g) || []).length;
  if (amazonLinks < 3) {
    failures.push(`amazon_links_too_few: ${amazonLinks} (min 3)`);
  }
  if (amazonLinks > 4) {
    failures.push(`amazon_links_too_many: ${amazonLinks} (max 4)`);
  }

  return {
    passed: failures.length === 0,
    failures,
    wordCount,
    emDashCount,
    amazonLinks
  };
}

/**
 * Quick check — just word count and em-dashes (for refresh crons)
 */
export function runQuickGate(body) {
  const wordCount = countWords(body);
  const emDashCount = (body.match(/—/g) || []).length;
  const failures = [];
  if (wordCount < MIN_WORDS) failures.push(`word_count_too_low: ${wordCount}`);
  if (wordCount > MAX_WORDS) failures.push(`word_count_too_high: ${wordCount}`);
  if (emDashCount > 0) failures.push(`em_dash_found: ${emDashCount}`);
  return { passed: failures.length === 0, failures, wordCount };
}

export { MIN_WORDS, MAX_WORDS, BANNED_WORDS, BANNED_PHRASES };
