/**
 * Amazon ASIN verification and URL builder.
 * Affiliate tag: spankyspinola-20
 */

const AMAZON_TAG = process.env.AMAZON_TAG || 'spankyspinola-20';

const PRODUCT_SIGNATURES = [
  /id="productTitle"/i,
  /id="bylineInfo"/i,
  /class="a-price"/i,
  /data-asin=/i,
  /"product":\s*\{/i,
  /addToCart/i,
];

export function buildAmazonUrl(asin) {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

export async function verifyAsin(asin) {
  const url = buildAmazonUrl(asin);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BloodSugarBlueprint/1.0)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    });

    if (!res.ok) return { asin, valid: false, reason: `http-${res.status}`, url };

    const html = await res.text();
    if (html.includes('Page Not Found') || html.includes('Dog of Amazon')) {
      return { asin, valid: false, reason: 'page-not-found', url };
    }

    const hasSignature = PRODUCT_SIGNATURES.some(p => p.test(html));
    if (!hasSignature) return { asin, valid: false, reason: 'no-product-signature', url };

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch
      ? titleMatch[1].replace(/\s*:\s*Amazon\.com.*$/i, '').replace(/\s+/g, ' ').trim()
      : null;

    if (!title || title.length < 10) {
      return { asin, valid: false, reason: 'short-or-missing-title', url };
    }

    return { asin, valid: true, title, url };
  } catch (err) {
    return { asin, valid: false, reason: `fetch-error: ${err.message}`, url };
  }
}

export async function verifyAsinBatch(asins, { delayMs = 2500, onProgress } = {}) {
  const results = [];
  for (let i = 0; i < asins.length; i++) {
    const result = await verifyAsin(asins[i]);
    results.push(result);
    if (onProgress) onProgress(i + 1, asins.length, result);
    if (i < asins.length - 1) await new Promise(r => setTimeout(r, delayMs));
  }
  return results;
}

const AMAZON_LINK_REGEX = /https:\/\/www\.amazon\.com\/dp\/([A-Z0-9]{10})(?:\/[^"\s?]*)?(?:\?[^"\s]*)?/g;

export function extractAsinsFromText(text) {
  const asins = new Set();
  let m;
  while ((m = AMAZON_LINK_REGEX.exec(text)) !== null) asins.add(m[1]);
  AMAZON_LINK_REGEX.lastIndex = 0;
  return Array.from(asins);
}

export function countAmazonLinks(text) {
  const matches = text.match(AMAZON_LINK_REGEX) || [];
  return matches.length;
}
