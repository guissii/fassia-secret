import type { ComponentType } from 'react';
import {
  Brush,
  Droplet,
  Flame,
  MoreHorizontal,
  Heart,
  HeartPulse,
  Leaf,
  Scissors,
  Sparkles,
  Smile,
  Sprout,
  Tag,
  ShieldCheck,
} from 'lucide-react';

export const desktopMenuCategories = [
  {
    title: "CORPS",
    items: ["Déodorants", "Gels Douche", "Gommage & Exfoliants", "Hydratation & Nutrition", "Parfums Femmes", "Rasage & Épilation", "Savons", "Soins des Mains & Pieds", "Soins des Ongles", "Soins Minceur & Anti-Cellulite", "Accessoires de Bain"]
  },
  {
    title: "VISAGE",
    items: ["Crèmes & Soins Hydratants", "Nettoyants & Démaquillants", "Protections Solaires", "Soins des Lèvres", "Soins Anti-taches & Éclaircissants", "Soins Anti-âge", "Soins Anti-Imperfections", "Soins des Yeux", "Masques & Gommages"]
  },
  {
    title: "CHEVEUX",
    items: ["Shampoings", "Après-shampoings", "Masques & Soins Réparateurs", "Colorations & Entretien", "Produits & Accessoires de Coiffure"]
  },
  {
    title: "HYGIÈNE DENTAIRE",
    items: ["Brosses à dents", "Dentifrices", "Bains De Bouche & Haleine", "Soins dentaires"]
  },
  {
    title: "MAQUILLAGE",
    items: ["Nettoyants & Démaquillants", "Teint", "Yeux", "Lèvres", "Accessoires Maquillage", "Trousses de Maquillage"]
  },
  {
    title: "HYGIÈNE & INTIMITÉ",
    items: ["Toilette Intime", "Serviettes Hygiéniques", "Tampons", "Lubrifiants"]
  },
  {
    title: "SANTÉ",
    items: ["Auto-Surveillance", "Compléments alimentaires", "Premiers Secours", "Orthopédie & Soutien"]
  },
  {
    title: "HOMMES",
    items: ["Déodorants", "Soins Hommes", "Lubrifiants", "Préservatifs"]
  },
  {
    title: "PREOCCUPATIONS",
    items: ["Acne & Imperfections", "Cernes", "Taches", "Rosacee & Rougeurs", "Peau seche", "Anti-age", "Chute de cheveux", "Immunite"]
  }
];

export type DrawerItem = { label: string; href: string };
export type DrawerCategory = { title: string; items: DrawerItem[] };

export const mobileDrawerCategories: DrawerCategory[] = [
  { title: "DERMO-CORNER", items: [
    { label: "La Roche-Posay", href: "/boutique?q=La+Roche-Posay" },
    { label: "Vichy", href: "/boutique?q=Vichy" },
    { label: "CeraVe", href: "/boutique?q=CeraVe" },
    { label: "Bioderma", href: "/boutique?q=Bioderma" },
    { label: "SVR", href: "/boutique?q=SVR" },
    { label: "Eucerin", href: "/boutique?q=Eucerin" },
  ] },
  // { title: "PROMOTIONS !", items: [
  //   { label: "Offres du moment", href: "/boutique?promo=1" },
  //   { label: "Bons plans", href: "/boutique?promo=1" },
  //   { label: "Dernieres promotions", href: "/boutique?promo=1" },
  // ] },
  { title: "K-BEAUTY", items: [
    { label: "Nettoyants", href: "/boutique?category=K-Beauty&q=Nettoyant" },
    { label: "Serums", href: "/boutique?category=K-Beauty&q=Serum" },
    { label: "Creme hydratante", href: "/boutique?category=K-Beauty&q=Creme" },
    { label: "Masques", href: "/boutique?category=K-Beauty&q=Masque" },
    { label: "SPF", href: "/boutique?category=K-Beauty&q=SPF" },
  ] },
  {
    title: "VISAGE",
    items: [
      { label: "Solaire: Protection solaire", href: "/boutique?category=Visage&q=Protection+solaire" },
      { label: "Solaire: Auto-bronzant", href: "/boutique?category=Visage&q=Auto-bronzant" },
      { label: "Solaire: Soin apres-soleil", href: "/boutique?category=Visage&q=apres-soleil" },
      { label: "Type: Nettoyant visage", href: "/boutique?category=Visage&q=Nettoyant" },
      { label: "Type: Serum", href: "/boutique?category=Visage&q=Serum" },
      { label: "Type: Creme de jour", href: "/boutique?category=Visage&q=Creme+de+jour" },
      { label: "Type: Creme de nuit", href: "/boutique?category=Visage&q=Creme+de+nuit" },
      { label: "Type: Contour des yeux", href: "/boutique?category=Visage&q=Contour+des+yeux" },
      { label: "Type: Eau micellaire", href: "/boutique?category=Visage&q=Eau+micellaire" },
      { label: "Type: Masque visage", href: "/boutique?category=Visage&q=Masque" },
      { label: "Besoins: Anti-imperfections", href: "/boutique?category=Visage&q=anti-imperfections" },
      { label: "Besoins: Anti-age", href: "/boutique?category=Visage&q=anti-age" },
      { label: "Besoins: Hydratant & nourrissant", href: "/boutique?category=Visage&q=hydratant" },
      { label: "Besoins: Anti-taches", href: "/boutique?category=Visage&q=anti-taches" },
      { label: "Besoins: Anti-rougeurs", href: "/boutique?category=Visage&q=anti-rougeurs" },
      { label: "Besoins: Eclat & anti-fatigue", href: "/boutique?category=Visage&q=eclat" },
      { label: "Besoins: Peaux sensibles", href: "/boutique?category=Visage&q=sensible" },
    ]
  },
  { title: "CHEVEUX", items: [
    { label: "Shampoing", href: "/boutique?category=Cheveux&q=Shampoing" },
    { label: "Apres-shampoing", href: "/boutique?category=Cheveux&q=Apres-shampoing" },
    { label: "Masque cheveux", href: "/boutique?category=Cheveux&q=Masque" },
    { label: "Soins reparateurs", href: "/boutique?category=Cheveux&q=Soins+reparateurs" },
    { label: "Huiles & serums", href: "/boutique?category=Cheveux&q=Huiles" },
  ] },
  { title: "MAQUILLAGE", items: [
    { label: "Teint", href: "/maquillage-parfums?step=1" },
    { label: "Yeux", href: "/maquillage-parfums?step=2" },
    { label: "Levres", href: "/maquillage-parfums?step=3" },
    { label: "Demaquillant", href: "/boutique?category=Maquillage&q=Demaquillant" },
    { label: "Accessoires maquillage", href: "/boutique?category=Maquillage&q=Accessoires" },
  ] },
  { title: "CORPS", items: [
    { label: "Corps & bain", href: "/boutique?category=Corps&q=bain" },
    { label: "Hydratation", href: "/boutique?category=Corps&q=Hydratation" },
    { label: "Gommage", href: "/boutique?category=Corps&q=Gommage" },
    { label: "Rasage & epilation", href: "/boutique?category=Corps&q=Rasage" },
    { label: "Minceur", href: "/boutique?category=Corps&q=Minceur" },
  ] },
  { title: "MAMAN & BEBE", items: [
    { label: "Bebe", href: "/boutique?category=Maman+%26+B%C3%A9b%C3%A9&q=Bebe" },
    { label: "Maman", href: "/boutique?category=Maman+%26+B%C3%A9b%C3%A9&q=Maman" },
    { label: "Solaire bebe", href: "/boutique?category=Maman+%26+B%C3%A9b%C3%A9&q=Solaire" },
    { label: "Change & toilette", href: "/boutique?category=Maman+%26+B%C3%A9b%C3%A9&q=Change" },
    { label: "Accessoires", href: "/boutique?category=Maman+%26+B%C3%A9b%C3%A9&q=Accessoires" },
  ] },
  { title: "HOMMES", items: [
    { label: "Soins visage homme", href: "/boutique?category=Hommes&q=Visage" },
    { label: "Soins corps homme", href: "/boutique?category=Hommes&q=Corps" },
    { label: "Deodorants", href: "/boutique?category=Hommes&q=Deodorants" },
    { label: "Rasage", href: "/boutique?category=Hommes&q=Rasage" },
    { label: "Barbe", href: "/boutique?category=Hommes&q=Barbe" },
  ] },
  { title: "HYGIÈNE DENTAIRE", items: [
    { label: "Dentifrices", href: "/boutique?category=Hygi%C3%A8ne+Dentaire&q=Dentifrices" },
    { label: "Brosses a dents", href: "/boutique?category=Hygi%C3%A8ne+Dentaire&q=Brosses" },
    { label: "Bains de bouche", href: "/boutique?category=Hygi%C3%A8ne+Dentaire&q=Bains+de+bouche" },
    { label: "Blanchiment", href: "/boutique?category=Hygi%C3%A8ne+Dentaire&q=Blanchiment" },
  ] },
  { title: "HYGIÈNE", items: [
    { label: "Gel hydroalcoolique", href: "/boutique?category=Hygi%C3%A8ne&q=Gel" },
    { label: "Deodorants", href: "/boutique?category=Hygi%C3%A8ne&q=Deodorants" },
    { label: "Soin intime", href: "/boutique?category=Hygi%C3%A8ne&q=Soin+intime" },
    { label: "Protections", href: "/boutique?category=Hygi%C3%A8ne&q=Protections" },
  ] },
  { title: "HYGIÈNE & INTIMITÉ", items: [
    { label: "Toilette Intime", href: "/boutique?category=Hygi%C3%A8ne&q=Toilette" },
    { label: "Serviettes Hygieniques", href: "/boutique?category=Hygi%C3%A8ne&q=Serviettes" },
    { label: "Tampons", href: "/boutique?category=Hygi%C3%A8ne&q=Tampons" },
    { label: "Lubrifiants", href: "/boutique?category=Hygi%C3%A8ne&q=Lubrifiants" },
  ] },
  { title: "ACCESSOIRES", items: [
    { label: "Accessoires visage", href: "/boutique?category=Accessoires&q=visage" },
    { label: "Accessoires cheveux", href: "/boutique?category=Accessoires&q=cheveux" },
    { label: "Trousses", href: "/boutique?category=Accessoires&q=Trousses" },
    { label: "Brosses", href: "/boutique?category=Accessoires&q=Brosses" },
    { label: "Eponges", href: "/boutique?category=Accessoires&q=Eponges" },
  ] },
  { title: "MINCEUR", items: [
    { label: "Brule-graisses", href: "/boutique?category=Minceur&q=Brule" },
    { label: "Draineurs", href: "/boutique?category=Minceur&q=Draineurs" },
    { label: "Collagene", href: "/boutique?category=Minceur&q=Collagene" },
    { label: "Sport & recuperation", href: "/boutique?category=Minceur&q=Sport" },
  ] },
  { title: "SPORT", items: [
    { label: "Proteines", href: "/boutique?category=Sport&q=Proteines" },
    { label: "Energie", href: "/boutique?category=Sport&q=Energie" },
    { label: "Hydratation", href: "/boutique?category=Sport&q=Hydratation" },
    { label: "Recuperation", href: "/boutique?category=Sport&q=Recuperation" },
  ] },
  { title: "SANTÉ", items: [
    { label: "Auto-Surveillance", href: "/boutique?category=Sant%C3%A9&q=Surveillance" },
    { label: "Premiers Secours", href: "/boutique?category=Sant%C3%A9&q=Premiers+Secours" },
    { label: "Orthopedie & soutien", href: "/boutique?category=Sant%C3%A9&q=Orthopedie" },
    { label: "Bien-etre", href: "/boutique?category=Bien-%C3%AAtre" },
  ] },
  { title: "COMPLEMENTS ALIMENTAIRES", items: [
    { label: "Vitamines & Mineraux", href: "/complements-alimentaires" },
    { label: "Collagene", href: "/complements-alimentaires" },
    { label: "Omega 3", href: "/complements-alimentaires" },
    { label: "Detox & Drainage", href: "/complements-alimentaires" },
  ] },
  { title: "PREMIUM HAIR CARE", items: [
    { label: "Shampoing premium", href: "/boutique?category=Cheveux&q=Shampoing" },
    { label: "Masque premium", href: "/boutique?category=Cheveux&q=Masque" },
    { label: "Huiles & serums", href: "/boutique?category=Cheveux&q=Huiles" },
    { label: "Anti-chute", href: "/boutique?category=Cheveux&q=Anti-chute" },
  ] },
  { title: "PREOCCUPATIONS", items: [
    { label: "Acne & Imperfections", href: "/boutique?q=acne+imperfections" },
    { label: "Cernes", href: "/boutique?q=cernes" },
    { label: "Taches", href: "/boutique?q=taches" },
    { label: "Rosacee & Rougeurs", href: "/boutique?q=rougeurs" },
    { label: "Peau seche", href: "/boutique?q=peau+seche" },
    { label: "Anti-age", href: "/boutique?q=anti-age" },
    { label: "Chute de cheveux", href: "/boutique?q=chute+cheveux" },
    { label: "Immunite", href: "/boutique?q=immunite" },
  ] },
];

export const mobileMenuItems: Array<{ label: string; page: string; Icon: ComponentType<{ size?: number; className?: string }> }> = [
  { label: 'DERMO-CORNER', page: 'dermo-corner', Icon: ShieldCheck },
  // { label: 'PROMOTIONS !', page: 'promotions', Icon: Tag },
  { label: 'K-BEAUTY', page: 'k-beauty', Icon: Sparkles },
  { label: 'CORPS', page: 'corps', Icon: Droplet },
  { label: 'VISAGE', page: 'visage', Icon: Sparkles },
  { label: 'CHEVEUX', page: 'cheveux', Icon: Scissors },
  { label: 'HYGIÈNE DENTAIRE', page: 'hygiene-dentaire', Icon: Smile },
  { label: 'MAQUILLAGE', page: 'maquillage', Icon: Brush },
  { label: 'HYGIÈNE & INTIMITÉ', page: 'hygiene-intimite', Icon: Leaf },
  { label: 'HYGIÈNE', page: 'hygiene', Icon: Leaf },
  { label: 'ACCESSOIRES', page: 'accessoires', Icon: MoreHorizontal },
  { label: 'MINCEUR', page: 'minceur', Icon: HeartPulse },
  { label: 'SPORT', page: 'sport', Icon: HeartPulse },
  { label: 'MAMAN & BEBE', page: 'maman-bebe', Icon: Heart },
  { label: 'HOMMES', page: 'hommes', Icon: Heart },
  { label: 'SANTÉ', page: 'sante', Icon: HeartPulse },
  { label: 'PREOCCUPATIONS', page: 'preoccupations', Icon: Flame },
  { label: 'COMPLEMENTS ALIMENTAIRES', page: 'complements-alimentaires', Icon: Sprout },
  { label: 'PREMIUM HAIR CARE', page: 'premium-hair-care', Icon: Scissors }
];

export const mobileQuickCategories: Array<{ label: string; page?: string; Icon: ComponentType<{ size?: number; className?: string }>; href?: string; openKey?: string }> = [
  { label: 'PROMOTIONS', Icon: Tag, href: '/boutique?hasOldPrice=true' },
  { label: 'COMPLÉMENTS\nALIMENTAIRES', page: 'complements-alimentaires', Icon: Sprout, href: '/complements-alimentaires' },
  { label: 'KOREAN\nBEAUTY', page: 'k-beauty', Icon: Sparkles, href: '/korean-beauty' },
  { label: 'PARFUMS\n& MAQUILLAGE', page: 'maquillage', Icon: Brush, href: '/maquillage-parfums' },
];
