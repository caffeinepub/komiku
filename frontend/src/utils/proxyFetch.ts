/**
 * Utility for fetching HTML content through CORS proxies.
 * Primary: allorigins.win
 * Fallback: corsproxy.io
 */

const TIMEOUT_MS = 15000;

export type ProxyName = 'allorigins' | 'corsproxy' | 'direct';

export interface ProxyFetchResult {
  html: string;
  usedProxy: ProxyName;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function fetchViaAllOrigins(url: string): Promise<string> {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const response = await withTimeout(fetch(proxyUrl), TIMEOUT_MS);
  if (!response.ok) {
    throw new Error(`allorigins.win responded with status ${response.status}`);
  }
  const data = await response.json();
  if (!data.contents) {
    throw new Error('allorigins.win returned empty contents');
  }
  return data.contents as string;
}

async function fetchViaCorsProxy(url: string): Promise<string> {
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  const response = await withTimeout(fetch(proxyUrl), TIMEOUT_MS);
  if (!response.ok) {
    throw new Error(`corsproxy.io responded with status ${response.status}`);
  }
  return response.text();
}

/**
 * Fetches HTML content from a URL using CORS proxies.
 * Tries allorigins.win first, then falls back to corsproxy.io.
 * Throws an error if both proxies fail.
 */
export async function fetchViaProxy(
  url: string,
  onProxyAttempt?: (proxy: ProxyName) => void
): Promise<ProxyFetchResult> {
  // Try primary proxy: allorigins.win
  try {
    onProxyAttempt?.('allorigins');
    const html = await fetchViaAllOrigins(url);
    return { html, usedProxy: 'allorigins' };
  } catch (primaryError) {
    console.warn('allorigins.win failed, trying fallback:', primaryError);
  }

  // Try fallback proxy: corsproxy.io
  try {
    onProxyAttempt?.('corsproxy');
    const html = await fetchViaCorsProxy(url);
    return { html, usedProxy: 'corsproxy' };
  } catch (fallbackError) {
    console.warn('corsproxy.io also failed:', fallbackError);
  }

  throw new Error(
    'Gagal mengambil halaman. Kedua proxy (allorigins.win dan corsproxy.io) tidak dapat mengakses URL tersebut. ' +
    'Pastikan URL valid dan situs tidak memblokir akses publik.'
  );
}
