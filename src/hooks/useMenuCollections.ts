import { useEffect, useState } from 'react';

export type DrawerItem = { label: string; href: string };
export type DrawerCategory = { title: string; items: DrawerItem[] };

const PAGE_LABEL_MAP: Record<string, string> = {
  'dermo-corner': 'DERMO-CORNER',
  'k-beauty': 'K-BEAUTY',
  'corps': 'CORPS',
  'visage': 'VISAGE',
  'cheveux': 'CHEVEUX',
  'hygiene-dentaire': 'HYGIÈNE DENTAIRE',
  'maquillage': 'MAQUILLAGE',
  'hygiene-intimite': 'HYGIÈNE & INTIMITÉ',
  'hygiene': 'HYGIÈNE',
  'accessoires': 'ACCESSOIRES',
  'minceur': 'MINCEUR',
  'sport': 'SPORT',
  'maman-bebe': 'MAMAN & BEBE',
  'hommes': 'HOMMES',
  'sante': 'SANTÉ',
  'preoccupations': 'PREOCCUPATIONS',
  'complements-alimentaires': 'COMPLEMENTS ALIMENTAIRES',
  'premium-hair-care': 'PREMIUM HAIR CARE',
};

const LABEL_PAGE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_LABEL_MAP).map(([page, label]) => [label, page])
);

function buildDrawerCategories(collections: any[]): DrawerCategory[] {
  const grouped: Record<string, { name: string; slug: string; order: number }[]> = {};

  collections
    .filter((c: any) => !c.parentId)
    .forEach((c: any) => {
      const label = PAGE_LABEL_MAP[c.page] || c.page;
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push({ name: c.name, slug: c.slug, order: c.order ?? 0 });
    });

  return Object.entries(grouped).map(([title, items]) => ({
    title,
    items: items
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        label: item.name,
        href: `/collection/${item.slug}`,
      })),
  }));
}

function buildDesktopCategories(collections: any[]) {
  const drawer = buildDrawerCategories(collections);
  const desktopTitles = [
    'CORPS', 'VISAGE', 'CHEVEUX', 'HYGIÈNE DENTAIRE', 'MAQUILLAGE',
    'HYGIÈNE & INTIMITÉ', 'SANTÉ', 'HOMMES', 'COMPLEMENTS ALIMENTAIRES', 'PREOCCUPATIONS',
  ];
  return desktopTitles
    .map((title) => {
      const found = drawer.find((c) => c.title === title);
      return { title, items: found?.items.map((i) => i.label) || [] };
    })
    .filter((c) => c.items.length > 0);
}

export function useMenuCollections() {
  const [mobileDrawerCategories, setMobileDrawerCategories] = useState<DrawerCategory[]>([]);
  const [desktopMenuCategories, setDesktopMenuCategories] = useState<{ title: string; items: string[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/collections')
      .then((r) => r.json())
      .then((data) => {
        const collections = data.collections || [];
        setMobileDrawerCategories(buildDrawerCategories(collections));
        setDesktopMenuCategories(buildDesktopCategories(collections));
      })
      .catch(() => {
        setMobileDrawerCategories([]);
        setDesktopMenuCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { mobileDrawerCategories, desktopMenuCategories, loading };
}

export { LABEL_PAGE_MAP };
