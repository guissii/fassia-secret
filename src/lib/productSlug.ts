type WithIdAndName = { id: number; name: string };

function stripAccents(input: string) {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function slugifyProductName(name: string) {
  return stripAccents(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

export function productToSlug(p: WithIdAndName) {
  const s = slugifyProductName(p.name);
  return s ? `${p.id}-${s}` : String(p.id);
}

export function productHref(p: WithIdAndName) {
  return `/produit/${productToSlug(p)}`;
}

export function parseProductIdFromSlug(slug: string) {
  const m = /^(\d+)(?:-|$)/.exec(slug);
  if (!m) return null;
  const id = Number(m[1]);
  return Number.isFinite(id) ? id : null;
}

