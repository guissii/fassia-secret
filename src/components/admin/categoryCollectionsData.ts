// Mapping des catégories et leurs collections (sous-sections)
// Basé sur la structure finale fournie par le client

export interface CategoryCollectionMapping {
  category: string;
  categoryAr: string;
  slug: string;
  collections: string[];
}

export const CATEGORY_COLLECTIONS_DATA: CategoryCollectionMapping[] = [
  {
    category: "Corps",
    categoryAr: "الجسم",
    slug: "corps",
    collections: [
      "Déodorants",
      "Gels Douche",
      "Gommage",
      "Hydratation",
      "Parfums Femmes",
      "Rasage",
      "Savons",
      "Soins Mains/Pieds",
      "Soins Ongles",
      "Minceur",
      "Accessoires Bain"
    ]
  },
  {
    category: "Visage",
    categoryAr: "الوجه",
    slug: "visage",
    collections: [
      "Crèmes Hydratantes",
      "Nettoyants",
      "Solaires",
      "Soins Lèvres",
      "Anti-taches",
      "Anti-âge",
      "Anti-Imperfections",
      "Soins Yeux",
      "Masques"
    ]
  },
  {
    category: "Cheveux",
    categoryAr: "الشعر",
    slug: "cheveux",
    collections: [
      "Shampoings",
      "Après-shampoings",
      "Masques Réparateurs",
      "Colorations",
      "Accessoires Coiffure"
    ]
  },
  {
    category: "Hygiène Dentaire",
    categoryAr: "العناية بالأسنان",
    slug: "hygiene-dentaire",
    collections: [
      "Brosses",
      "Dentifrices",
      "Bains de bouche",
      "Soins dentaires"
    ]
  },
  {
    category: "Maquillage",
    categoryAr: "المكياج",
    slug: "maquillage",
    collections: [
      "Nettoyants",
      "Teint",
      "Yeux",
      "Lèvres",
      "Accessoires",
      "Trousses"
    ]
  },
  {
    category: "Hygiène & Intimité",
    categoryAr: "النظافة والحماية",
    slug: "hygiene-intimite",
    collections: [
      "Toilette Intime",
      "Serviettes",
      "Tampons",
      "Lubrifiants"
    ]
  },
  {
    category: "Hygiène",
    categoryAr: "النظافة",
    slug: "hygiene",
    collections: [
      "Gel hydroalcoolique",
      "Déodorants",
      "Soin intime",
      "Protections"
    ]
  },
  {
    category: "Santé",
    categoryAr: "الصحة",
    slug: "sante",
    collections: [
      "Auto-Surveillance",
      "Compléments",
      "Premiers Secours",
      "Orthopédie"
    ]
  },
  {
    category: "Hommes",
    categoryAr: "الرجال",
    slug: "hommes",
    collections: [
      "Déodorants",
      "Soins visage/corps",
      "Rasage",
      "Barbe",
      "Parfums"
    ]
  },
  {
    category: "Préoccupations",
    categoryAr: "المشاكل",
    slug: "preoccupations",
    collections: [
      "Acne",
      "Cernes",
      "Taches",
      "Rosacée",
      "Peau sèche",
      "Anti-âge",
      "Chute cheveux",
      "Immunité"
    ]
  },
  {
    category: "Compléments Alimentaires",
    categoryAr: "المكملات الغذائية",
    slug: "complements-alimentaires",
    collections: [
      "Cheveux",
      "Ongles",
      "Immunité",
      "Minceur",
      "Énergie",
      "Sommeil",
      "Vitamines",
      "Collagène",
      "Omega 3",
      "Detox"
    ]
  },
  {
    category: "K-Beauty",
    categoryAr: "كي بيوتي",
    slug: "k-beauty",
    collections: [
      "Nettoyants",
      "Essence",
      "Sérum",
      "Masque",
      "Crème",
      "SPF"
    ]
  },
  {
    category: "Dermo-Corner",
    categoryAr: "درمو كورنر",
    slug: "dermo-corner",
    collections: [
      "La Roche-Posay",
      "Vichy",
      "CeraVe",
      "Bioderma",
      "SVR",
      "Eucerin"
    ]
  },
  {
    category: "Accessoires",
    categoryAr: "إكسسوارات",
    slug: "accessoires",
    collections: [
      "Visage",
      "Cheveux",
      "Trousses",
      "Brosses",
      "Éponges"
    ]
  },
  {
    category: "Minceur",
    categoryAr: "التخسيس",
    slug: "minceur",
    collections: [
      "Brûle-graisses",
      "Draineurs",
      "Collagène",
      "Sport"
    ]
  },
  {
    category: "Sport",
    categoryAr: "رياضة",
    slug: "sport",
    collections: [
      "Protéines",
      "Énergie",
      "Hydratation",
      "Récupération"
    ]
  },
  {
    category: "Maman & Bébé",
    categoryAr: "الأم والطفل",
    slug: "maman-bebe",
    collections: [
      "Bébé",
      "Maman",
      "Solaire",
      "Change",
      "Accessoires"
    ]
  },
  {
    category: "Premium Hair Care",
    categoryAr: "العناية الفاخرة بالشعر",
    slug: "premium-hair-care",
    collections: [
      "Shampoing premium",
      "Masque premium",
      "Huiles",
      "Anti-chute"
    ]
  }
];

// Helper pour obtenir les collections d'une catégorie
export function getCollectionsForCategory(categorySlug: string): string[] {
  const mapping = CATEGORY_COLLECTIONS_DATA.find(c => c.slug === categorySlug);
  return mapping?.collections || [];
}

// Helper pour obtenir toutes les catégories
export function getAllCategories(): { name: string; nameAr: string; slug: string }[] {
  return CATEGORY_COLLECTIONS_DATA.map(c => ({
    name: c.category,
    nameAr: c.categoryAr,
    slug: c.slug
  }));
}

// Helper pour obtenir toutes les collections uniques
export function getAllCollections(): string[] {
  const allCollections = new Set<string>();
  CATEGORY_COLLECTIONS_DATA.forEach(cat => {
    cat.collections.forEach(coll => allCollections.add(coll));
  });
  return Array.from(allCollections);
}

// Helper pour trouver la catégorie d'une collection
export function getCategoryForCollection(collectionName: string): string | undefined {
  for (const cat of CATEGORY_COLLECTIONS_DATA) {
    if (cat.collections.includes(collectionName)) {
      return cat.slug;
    }
  }
  return undefined;
}
