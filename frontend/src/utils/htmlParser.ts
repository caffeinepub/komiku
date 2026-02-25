/**
 * Utility for extracting manga/comic page image URLs from HTML strings.
 */

// Common manga CDN domains and patterns
const MANGA_CDN_PATTERNS = [
  /cdn\./i,
  /img\./i,
  /image\./i,
  /static\./i,
  /media\./i,
  /storage\./i,
  /upload/i,
  /chapter/i,
  /manga/i,
  /comic/i,
  /webtoon/i,
  /manhwa/i,
  /manhua/i,
];

// Image file extensions
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i;

// Numbered filename pattern (common in manga pages: 001.jpg, page_01.png, etc.)
const NUMBERED_FILENAME = /[/_-]?\d{1,4}\.(jpg|jpeg|png|webp|gif|avif)/i;

function scoreImageUrl(url: string): number {
  let score = 0;

  // Must have image extension
  if (!IMAGE_EXTENSIONS.test(url)) return -1;

  // Skip data URIs and tiny icons
  if (url.startsWith('data:')) return -1;
  if (url.includes('favicon')) return -1;
  if (url.includes('logo') && !url.includes('chapter') && !url.includes('manga')) return -1;
  if (url.includes('avatar')) return -1;
  if (url.includes('thumbnail') && !url.includes('chapter')) return 0;

  // Boost for numbered filenames (manga pages are usually numbered)
  if (NUMBERED_FILENAME.test(url)) score += 3;

  // Boost for manga CDN patterns
  for (const pattern of MANGA_CDN_PATTERNS) {
    if (pattern.test(url)) {
      score += 1;
      break;
    }
  }

  // Boost for absolute URLs
  if (url.startsWith('http')) score += 1;

  return score;
}

/**
 * Extracts image URLs from an HTML string, filtering and scoring for manga page patterns.
 * Uses DOMParser when available, falls back to regex.
 * Returns deduplicated array of image URLs ordered by appearance.
 */
export function extractImageUrls(html: string): string[] {
  const seen = new Set<string>();
  const results: Array<{ url: string; score: number }> = [];

  // Method 1: DOMParser (preferred)
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Query all img tags
    const imgs = doc.querySelectorAll('img');
    imgs.forEach((img) => {
      const candidates = [
        img.getAttribute('src'),
        img.getAttribute('data-src'),
        img.getAttribute('data-lazy-src'),
        img.getAttribute('data-original'),
        img.getAttribute('data-url'),
        img.getAttribute('data-image'),
        img.getAttribute('data-full'),
        img.getAttribute('data-hi-res-src'),
      ].filter(Boolean) as string[];

      for (const url of candidates) {
        const trimmed = url.trim();
        if (!trimmed || seen.has(trimmed)) continue;
        const score = scoreImageUrl(trimmed);
        if (score >= 0) {
          seen.add(trimmed);
          results.push({ url: trimmed, score });
        }
      }
    });

    // Also check source tags inside picture elements
    const sources = doc.querySelectorAll('source');
    sources.forEach((source) => {
      const srcset = source.getAttribute('srcset') || source.getAttribute('data-srcset');
      if (srcset) {
        // Parse srcset: "url1 1x, url2 2x" or "url1 100w, url2 200w"
        const parts = srcset.split(',').map((s) => s.trim().split(/\s+/)[0]);
        for (const url of parts) {
          if (!url || seen.has(url)) continue;
          const score = scoreImageUrl(url);
          if (score >= 0) {
            seen.add(url);
            results.push({ url, score });
          }
        }
      }
    });
  } catch {
    // DOMParser failed, fall through to regex
  }

  // Method 2: Regex fallback / supplement for JSON-embedded URLs
  // Find URLs in JSON-like structures (e.g., {"src":"https://..."})
  const jsonImgRegex = /"(https?:\/\/[^"]+\.(jpg|jpeg|png|webp|gif|avif)[^"]*)"/gi;
  let match;
  while ((match = jsonImgRegex.exec(html)) !== null) {
    const url = match[1];
    if (!url || seen.has(url)) continue;
    const score = scoreImageUrl(url);
    if (score >= 0) {
      seen.add(url);
      results.push({ url, score });
    }
  }

  // If DOMParser found nothing, also try raw img src regex
  if (results.length === 0) {
    const imgRegex = /<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi;
    while ((match = imgRegex.exec(html)) !== null) {
      const url = match[1];
      if (!url || seen.has(url)) continue;
      const score = scoreImageUrl(url);
      if (score >= 0) {
        seen.add(url);
        results.push({ url, score });
      }
    }
  }

  // Sort: keep original order but filter out very low scores if we have good results
  const highScoreResults = results.filter((r) => r.score >= 2);
  const finalResults = highScoreResults.length >= 3 ? highScoreResults : results.filter((r) => r.score >= 0);

  return finalResults.map((r) => r.url);
}
