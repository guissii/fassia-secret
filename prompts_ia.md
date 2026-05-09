# Prompts IA + Tailles (Démarche Pro)

Ce fichier sert de référence pour générer des visuels cohérents (même style, bonnes dimensions) et éviter les bugs d’affichage (images coupées, trop de vide, ratio mauvais).

## Règles générales

- Export final: **WEBP** (qualité 75–85) et viser **< 250–400 KB** par image (idéal mobile)
- Pas de texte incrusté dans les images (titres/prix/badges restent en HTML)
- Toujours laisser une **marge de sécurité** (aucun objet collé au bord)
- Lumière: studio diffuse, ombres légères, rendu “parapharmacie premium”
- Cohérence couleur: fonds clairs (blanc/rose-beige) + reflets doux

### Negative prompt (à réutiliser)
Texte, watermark, logo parasite, produits coupés, produits empilés, deux rangées, perspective extrême, flou, bruit, artefacts, duplication, mains, visage, décor chargé, packaging déformé, sur-saturation.

## 1) Images “cartes produit” (packshots)

**Où c’est utilisé:** toutes les cartes produits (slider)  
**Objectif:** image lisible, centrée, sans vide inutile, pas étirée

**Taille recommandée**
- **1200 × 1200** (ratio **1:1**) recommandé
- Alternative: 1000 × 1000

**Prompt (FR)**
Photo e-commerce premium d’un produit dermo‑cosmétique, packshot studio, objet centré, très net, fond clair minimal (blanc ou rose-beige très léger), lumière diffuse haut de gamme, ombres très légères, rendu photoréaliste, pas de décor, pas de mains, pas de texte. Laisse une marge de sécurité ~12% tout autour. Format 1200x1200.

## 2) Image “marque” (carte Centella / visuel de marque)

**Où c’est utilisé:** la 1ère carte du slider de la section marque (même taille qu’une carte produit)  
**Objectif:** éviter le grand vide blanc et garder les produits bien cadrés

**Taille recommandée**
- **1200 × 1200** (ratio **1:1**) recommandé (parfait pour la carte)

**Prompt (FR) — 5 produits sur UNE SEULE LIGNE**
Crée une image e-commerce photoréaliste premium style K‑beauty pour la gamme “SKIN1004 Madagascar Centella”. CANVAS 1200x1200 (ratio 1:1). Met 5 produits ALIGNÉS HORIZONTALEMENT SUR UNE SEULE LIGNE (de gauche à droite), tous entièrement visibles, mêmes hauteurs visuelles, bien espacés. Laisse une marge de sécurité: 12% sur les bords (aucun produit ne touche le bord). Fond studio doux rose-beige lumineux avec reflets, surface légèrement brillante avec reflet subtil sous les produits. Lumière diffuse, ombres très légères, rendu luxe minimal. Aucun texte, aucun watermark, aucune main, aucun décor chargé. Packaging net et lisible, pas de déformation.

## 3) Images “Catégories” (bento)

**Où c’est utilisé:** les cartes Catégories (fond en cover)  
**Objectif:** image qui supporte du texte par-dessus (lisible), sans sujet au centre trop important

**Tailles recommandées**
- **1600 × 1000** (ratio **16:10**) recommandé
- Alternative: 1920 × 1080

**Prompt (FR)**
Image de fond premium pour une catégorie parapharmacie (soins visage / cheveux / compléments). Style editorial, minimal et lumineux, texture douce (crème, silk, gradient), un seul élément subtil si nécessaire (feuille, flacon flouté), beaucoup d’espace négatif. Pas de texte, pas de mains. Format 1600x1000.

## 4) Démarche Pro (workflow)

1. Choisir le type d’image (Produit / Marque / Catégorie) + le ratio ci-dessus
2. Générer 4–8 variantes avec la même direction artistique
3. Valider à 100%:
   - pas de recadrage
   - marges OK (objets pas collés aux bords)
   - pas de texte/watermark
   - cohérence couleur (premium, clair)
4. Exporter en **WEBP** (75–85)
5. Nommer et déposer dans `public/` (nom simple sans accents si possible)
6. Tester sur mobile: vérifier qu’il n’y a pas de zone blanche “vide” et que rien n’est coupé

