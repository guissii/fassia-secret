/**
 * Returns the public asset URL for a given path.
 * Handles base64 data URIs, HTTP URLs, and local public assets.
 */
export function publicAssetUrl(inputPath: string): string {
  if (!inputPath || !inputPath.trim()) {
    return '/';
  }

  const trimmed = inputPath.trim();

  // Already a full URL, data URI, or blob — return as-is
  if (/^(https?:)?\/\//.test(trimmed) || /^data:/.test(trimmed) || /^blob:/.test(trimmed)) {
    return trimmed;
  }

  // Ensure leading slash for local public assets
  const pathWithSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  // Encode special characters in the path
  try {
    return encodeURI(decodeURI(pathWithSlash));
  } catch {
    return encodeURI(pathWithSlash);
  }
}

// Kept for backwards compatibility
export function getBasePath(): string {
  return '';
}
