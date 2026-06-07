export type Focus = {
  key: string;
  label: string;
  timing: string;
  title: string;
  description: string;
  q: string;
};

export const FOCUSES: Focus[] = [
  {
    key: 'sleep',
    label: 'Sommeil',
    timing: 'Soir',
    title: 'Sommeil & Relaxation',
    description: 'Mélatonine, magnésium glycinate, plantes apaisantes.',
    q: 'melatonine magnesium sommeil',
  },
  {
    key: 'stress',
    label: 'Équilibre',
    timing: 'Matin',
    title: 'Stress & Humeur',
    description: 'Adaptogènes & focus doux: ashwagandha, rhodiola, L-théanine.',
    q: 'ashwagandha theanine rhodiola',
  },
  {
    key: 'digest',
    label: 'Intestin',
    timing: 'Repas',
    title: 'Digestion & Probiotiques',
    description: 'Confort intestinal, enzymes & microbiote (probiotiques).',
    q: 'probiotiques enzymes digestion',
  },
  {
    key: 'metabolic',
    label: 'Silhouette',
    timing: 'Avant repas',
    title: 'Poids & Métabolisme',
    description: 'Berbérine, chrome, ALA: routine métabolique.',
    q: 'berberine chrome ala metabolisme',
  },
  {
    key: 'immunity',
    label: 'Immunité',
    timing: 'Matin',
    title: 'Immunité & Ruche',
    description: 'Propolis, vitamine C, zinc: protection quotidienne.',
    q: 'propolis zinc vitamine c',
  },
  {
    key: 'beauty',
    label: 'Beauty',
    timing: 'Matin',
    title: 'Beauté In & Out',
    description: 'Collagène, biotine & acide hyaluronique: glow, cheveux, ongles.',
    q: 'collagene biotine hyaluronique',
  },
];
