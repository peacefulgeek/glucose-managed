/**
 * Bunny CDN integration for Glucose Managed (Site 109).
 * Credentials are hardcoded per spec — safe to commit.
 * Update BUNNY_* values when the actual Bunny zone is provisioned.
 */

// HARDCODE per site. DO NOT move these to env vars.
const BUNNY_STORAGE_ZONE = 'glucose-managed';
const BUNNY_API_KEY      = 'REPLACE_WITH_BUNNY_API_KEY';
const BUNNY_PULL_ZONE    = 'https://glucose-managed.b-cdn.net';
const BUNNY_HOSTNAME     = 'ny.storage.bunnycdn.com';

// Fallback placeholder images from Unsplash (used until Bunny is provisioned)
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&q=80', // blood glucose meter
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80', // healthy food
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80', // exercise
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80', // medical
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80', // vegetables
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80', // meditation
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200&q=80', // food prep
  'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1200&q=80', // doctor
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80', // running
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80', // salad
];

/**
 * Pick a random library image, copy it to /images/{slug}.webp, return the public URL.
 * Falls back to Unsplash placeholder if Bunny is not yet provisioned.
 */
export async function assignHeroImage(slug) {
  // If Bunny is not yet configured, use placeholder
  if (BUNNY_API_KEY === 'REPLACE_WITH_BUNNY_API_KEY') {
    const idx = Math.abs(hashCode(slug)) % PLACEHOLDER_IMAGES.length;
    return PLACEHOLDER_IMAGES[idx];
  }

  const libIdx = String(Math.floor(Math.random() * 40) + 1).padStart(2, '0');
  const sourceFile = `lib-${libIdx}.webp`;
  const destFile   = `${slug}.webp`;

  try {
    const sourceUrl = `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
    const downloadRes = await fetch(sourceUrl);
    if (!downloadRes.ok) throw new Error(`download ${downloadRes.status}`);
    const imageBuffer = await downloadRes.arrayBuffer();

    const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/images/${destFile}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'image/webp' },
      body: imageBuffer,
    });
    if (!uploadRes.ok) throw new Error(`upload ${uploadRes.status}`);
    return `${BUNNY_PULL_ZONE}/images/${destFile}`;
  } catch (err) {
    console.warn(`[bunny.assignHeroImage] copy failed (${err.message}), using placeholder`);
    const idx = Math.abs(hashCode(slug)) % PLACEHOLDER_IMAGES.length;
    return PLACEHOLDER_IMAGES[idx];
  }
}

/**
 * Upload an arbitrary WebP buffer to a target path under the storage zone.
 */
export async function uploadWebP(targetPath, buffer) {
  if (BUNNY_API_KEY === 'REPLACE_WITH_BUNNY_API_KEY') {
    throw new Error('Bunny CDN not yet configured — update BUNNY_API_KEY in src/lib/bunny.mjs');
  }
  const url = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${targetPath.replace(/^\//, '')}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'image/webp' },
    body: buffer,
  });
  if (!res.ok) throw new Error(`bunny upload ${res.status} for ${targetPath}`);
  return `${BUNNY_PULL_ZONE}/${targetPath.replace(/^\//, '')}`;
}

export function getBunnyPullZone() {
  return BUNNY_PULL_ZONE;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// Per-article image assignments (deterministic based on slug)
export function getArticleImageUrl(slug, heroUrl) {
  if (heroUrl && !heroUrl.includes('REPLACE')) return heroUrl;
  const idx = Math.abs(hashCode(slug)) % PLACEHOLDER_IMAGES.length;
  return PLACEHOLDER_IMAGES[idx];
}
