const BLOCKED_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:'];

/**
 * Builds a canonical URL for duplicate detection.
 * - trims input
 * - lowercases hostname
 * - removes default ports
 * - removes trailing slash (except root path)
 */
const buildCanonicalUrl = (parsed) => {
  const hostname = parsed.hostname.toLowerCase();
  const isDefaultPort =
    (parsed.protocol === 'https:' && parsed.port === '443') ||
    (parsed.protocol === 'http:' && parsed.port === '80') ||
    !parsed.port;

  const port = isDefaultPort ? '' : `:${parsed.port}`;

  let pathname = parsed.pathname || '/';
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  return `${parsed.protocol}//${hostname}${port}${pathname}${parsed.search}${parsed.hash}`;
};

const validateAndNormalizeUrl = (input) => {
  if (input === undefined || input === null) {
    return { valid: false, error: 'URL is required' };
  }

  if (typeof input !== 'string') {
    return { valid: false, error: 'URL must be a string' };
  }

  const trimmed = input.trim();

  if (!trimmed) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  const lower = trimmed.toLowerCase();
  if (BLOCKED_PROTOCOLS.some((protocol) => lower.startsWith(protocol))) {
    return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
  }

  let urlToParse = trimmed;
  if (!/^https?:\/\//i.test(urlToParse)) {
    urlToParse = `https://${urlToParse}`;
  }

  try {
    const parsed = new URL(urlToParse);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }

    if (!parsed.hostname) {
      return { valid: false, error: 'Invalid URL' };
    }

    return {
      valid: true,
      normalizedUrl: buildCanonicalUrl(parsed),
    };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

const isSafeRedirectUrl = (url) => {
  const result = validateAndNormalizeUrl(url);
  return result.valid;
};

module.exports = {
  validateAndNormalizeUrl,
  isSafeRedirectUrl,
  buildCanonicalUrl,
};
