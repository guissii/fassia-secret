export function getBasePath() {
  const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH;
  if (envBasePath) return envBasePath;

  if (typeof window === 'undefined') return '';

  const { hostname, pathname } = window.location;
  if (!hostname.endsWith('github.io')) return '';

  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return firstSegment ? `/${firstSegment}` : '';
}

function safeEncodePath(path: string) {
  try {
    return encodeURI(decodeURI(path));
  } catch {
    return encodeURI(path);
  }
}

export function publicAssetUrl(inputPath: string) {
  const basePath = getBasePath();

  if (!inputPath) {
    return basePath || '/';
  }

  const trimmed = inputPath.trim();
  if (!trimmed) {
    return basePath || '/';
  }

  if (/^(https?:)?\/\//.test(trimmed) || /^data:/.test(trimmed)) {
    return trimmed;
  }

  const baseNoSlash = basePath.replace(/^\/+/, '').replace(/\/+$/, '');
  let pathNoSlash = trimmed.replace(/^\/+/, '');

  if (baseNoSlash && pathNoSlash.startsWith(`${baseNoSlash}/`)) {
    pathNoSlash = pathNoSlash.slice(baseNoSlash.length + 1);
  }

  const encoded = safeEncodePath(pathNoSlash);

  if (!basePath) {
    return `/${encoded}`;
  }

  return `${basePath.replace(/\/+$/, '')}/${encoded}`;
}
