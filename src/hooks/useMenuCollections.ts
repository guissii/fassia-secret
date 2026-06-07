import { useEffect, useState } from 'react';

export type DrawerItem = { label: string; href: string };
export type DrawerCategory = { title: string; page: string; items: DrawerItem[] };

// Static fallback for pages not yet in DB
const STATIC_FALLBACK: Record<string, string> = {
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

function buildDrawerCategories(collections: any[], pageLabelMap: Record<string, string>): DrawerCategory[] {
  const grouped: Record<string, { page: string; name: string; slug: string; order: number }[]> = {};

  collections
    .filter((c: any) => !c.parentId)
    .forEach((c: any) => {
      const label = pageLabelMap[c.page] || STATIC_FALLBACK[c.page] || c.page;
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push({ page: c.page, name: c.name, slug: c.slug, order: c.order ?? 0 });
    });

  return Object.entries(grouped).map(([title, items]) => ({
    title,
    page: items[0]?.page || '',
    items: items
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        label: item.name,
        href: `/boutique?collectionSlug=${encodeURIComponent(item.slug)}`,
      })),
  }));
}

export type DesktopCategoryItem = { label: string; slug: string };
export type DesktopCategory = { title: string; items: DesktopCategoryItem[] };

function buildDesktopCategories(collections: any[], pageLabelMap: Record<string, string>): DesktopCategory[] {
  const drawer = buildDrawerCategories(collections, pageLabelMap);
  const desktopPages = [
    'corps', 'visage', 'cheveux', 'hygiene-dentaire', 'maquillage',
    'hygiene-intimite', 'sante', 'hommes', 'complements-alimentaires', 'preoccupations',
  ];
  return desktopPages
    .map((page) => {
      const found = drawer.find((c) => c.page === page);
      return { title: pageLabelMap[page] || STATIC_FALLBACK[page] || page, items: found?.items.map((i) => ({ label: i.label, slug: i.href.replace('/boutique?collectionSlug=', '') })) || [] };
    })
    .filter((c) => c.items.length > 0);
}

export function useMenuCollections() {
  const [mobileDrawerCategories, setMobileDrawerCategories] = useState<DrawerCategory[]>([]);
  const [desktopMenuCategories, setDesktopMenuCategories] = useState<DesktopCategory[]>([]);
  const [pageLabelMap, setPageLabelMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/collections').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([collData, catData]) => {
        const collections = collData.collections || [];
        const categories = catData.categories || [];

        // Build dynamic page → label map from categories (slug → name)
        const dynamicMap: Record<string, string> = {};
        for (const cat of categories) {
          if (cat.slug && cat.name) {
            dynamicMap[cat.slug] = cat.name;
          }
        }
        setPageLabelMap(dynamicMap);

        setMobileDrawerCategories(buildDrawerCategories(collections, dynamicMap));
        setDesktopMenuCategories(buildDesktopCategories(collections, dynamicMap));
      })
      .catch(() => {
        setMobileDrawerCategories([]);
        setDesktopMenuCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { mobileDrawerCategories, desktopMenuCategories, pageLabelMap, loading };
}

const LABEL_PAGE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(STATIC_FALLBACK).map(([page, label]) => [label, page])
);

export { LABEL_PAGE_MAP };
