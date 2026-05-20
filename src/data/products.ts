export type CatalogProduct = {
  id: number;
  brand: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  badge?: string;
};

const imageUrl = (prompt: string) => {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square_hd`;
};

export const ALL_PRODUCTS: CatalogProduct[] = [
  {
    id: 1,
    brand: 'DERMINA',
    name: 'Derma Hydrating Serum',
    description: "Sérum hydratant à l’acide hyaluronique + vitamine B5.",
    price: 180.0,
    image: '19bd7403-d2ac-49a4-a584-be5895add421.png',
    category: 'Visage',
    badge: 'Nouveau',
  },
  {
    id: 2,
    brand: 'LA ROCHE-POSAY',
    name: 'Hydra Boost Gel Cream',
    description: 'Gel-crème hydratant avec acide hyaluronique & thé vert.',
    price: 199.0,
    oldPrice: 249.0,
    image: 'd6f902fd-0b09-48d0-8055-d03094820431.png',
    category: 'Visage',
  },
  {
    id: 3,
    brand: 'MIXA',
    name: 'Detox & Drainage',
    description: "Complément détox à base d’actifs botaniques.",
    price: 129.0,
    oldPrice: 159.0,
    image: '5aa79a5c-fd9e-42f0-bf17-d64dbb490eb8.png',
    category: 'Compléments',
  },
  {
    id: 4,
    brand: 'VICHY',
    name: 'Vitamin D3 2000 IU',
    description: 'Soutien immunitaire & santé osseuse au quotidien.',
    price: 149.0,
    image: '950aa654-e0a2-4875-8451-ca8805a6d44a.png',
    category: 'Santé',
  },
  {
    id: 5,
    brand: 'SVR',
    name: 'Routine Huiles & Plantes',
    description: 'Sélection d’actifs botaniques pour une peau éclatante.',
    price: 169.0,
    image: 'image%202%202.png',
    category: 'Bien-être',
    badge: 'Nouveau',
  },
  {
    id: 6,
    brand: 'MADAGASCAR',
    name: 'Centella Ampoule Foam',
    description: 'Nettoyant doux à la Centella Asiatica pour apaiser et hydrater la peau.',
    price: 129.0,
    image: 'ca  quon va utiiser.png',
    category: 'K-Beauty',
    badge: 'Nouveau',
  },
  {
    id: 7,
    brand: 'MADAGASCAR',
    name: 'Centella Toning Toner',
    description: 'Tonique hydratant enrichi en Centella Asiatica pour une peau fraîche et éclatante.',
    price: 159.0,
    oldPrice: 189.0,
    image: 'ca  quon va utiiser.png',
    category: 'K-Beauty',
    badge: '-16%',
  },
  {
    id: 8,
    brand: 'MADAGASCAR',
    name: 'Centella Ampoule',
    description: 'Sérum à la Centella Asiatica pour réparer et renforcer la barrière cutanée.',
    price: 199.0,
    image: 'ca  quon va utiiser.png',
    category: 'K-Beauty',
  },
  {
    id: 9,
    brand: 'FASSIA BEAUTY',
    name: 'Perfect Glow Foundation',
    description: 'Fond de teint lumineux, finition naturelle et tenue longue durée.',
    price: 219.0,
    image: imageUrl(
      'Photographie premium e-commerce, fond de teint liquide en flacon en verre, teintes nude, fond beige rosé, lumière studio douce, style luxe minimaliste, haute définition'
    ),
    category: 'Maquillage',
    badge: 'Nouveau',
  },
  {
    id: 10,
    brand: 'FASSIA BEAUTY',
    name: 'Velvet Matte Lipstick',
    description: 'Rouge à lèvres velours, couleur intense et confortable.',
    price: 149.0,
    oldPrice: 179.0,
    image: imageUrl(
      'Photographie premium e-commerce, rouge à lèvres luxe, texture velours, fond beige crème, reflets doux, style Dior, haute définition'
    ),
    category: 'Maquillage',
    badge: '-17%',
  },
  {
    id: 11,
    brand: 'FASSIA BEAUTY',
    name: 'Silk Blush',
    description: 'Blush soyeux, effet bonne mine immédiat.',
    price: 129.0,
    image: imageUrl(
      'Photographie premium e-commerce, blush compact avec pinceau, poudres rosées, fond beige, style luxe minimaliste, lumière studio douce, haute définition'
    ),
    category: 'Maquillage',
  },
  {
    id: 12,
    brand: 'FASSIA BEAUTY',
    name: 'Lash Define Mascara',
    description: 'Mascara allongeant, définition nette sans paquets.',
    price: 119.0,
    image: imageUrl(
      'Photographie premium e-commerce, mascara noir et brosse, fond beige clair, style minimaliste luxe, lumière studio douce, haute définition'
    ),
    category: 'Maquillage',
  },
  {
    id: 13,
    brand: 'FASSIA PARFUM',
    name: 'Rose Velvet Eau de Parfum',
    description: 'Notes florales rosées, musc doux et sillage élégant.',
    price: 349.0,
    image: imageUrl(
      'Photographie premium e-commerce parfum, flacon de parfum en verre avec reflets, fond beige rosé, ambiance luxe, lumière studio douce, haute définition'
    ),
    category: 'Parfums',
    badge: 'Nouveau',
  },
  {
    id: 14,
    brand: 'FASSIA PARFUM',
    name: 'Amber Night Eau de Parfum',
    description: 'Ambre chaud, vanille et bois précieux.',
    price: 399.0,
    image: imageUrl(
      'Photographie premium e-commerce parfum, flacon de parfum ambré, reflets dorés, fond beige crème, ambiance luxe minimaliste, haute définition'
    ),
    category: 'Parfums',
  },
  {
    id: 15,
    brand: 'FASSIA PARFUM',
    name: 'Citrus Fresh Cologne',
    description: 'Agrumes frais, propre et léger pour tous les jours.',
    price: 279.0,
    oldPrice: 329.0,
    image: imageUrl(
      'Photographie premium e-commerce parfum, flacon transparent avec agrumes subtils, fond clair, lumière studio douce, style luxe, haute définition'
    ),
    category: 'Parfums',
    badge: '-15%',
  },
  {
    id: 16,
    brand: 'FASSIA PARFUM',
    name: 'Vanilla Skin Mist',
    description: 'Brume parfumée vanillée, douce et enveloppante.',
    price: 169.0,
    image: imageUrl(
      'Photographie premium e-commerce, brume parfumée en flacon, tons crème vanille, fond beige doux, style minimaliste luxe, haute définition'
    ),
    category: 'Parfums',
  },
];
