## Objectif

Refaire le header pour qu’il ressemble à la maquette “Fassia Secret” (logo à gauche, recherche au centre, favoris/panier à droite), avec un logo plus petit, **sans ajouter** le bloc “rassurance/badges” de la 2ème photo.

## Ce qui sera fait

1. **Logo**
   - Réduire la taille du logo desktop (hauteur) et ajuster l’alignement pour garder le rendu propre.
   - Ajuster aussi la taille du logo dans le drawer mobile (cohérent avec le desktop).
2. **Layout desktop du header**
   - Garder la grille: logo (gauche) / recherche (centre) / actions (droite).
   - Afficher les libellés “Favoris” et “Panier” sous les icônes (comme la maquette) et harmoniser l’espacement.
3. **Couleurs & détails**
   - Conserver un style proche de la maquette (tons rose) uniquement dans le header (ex: bordure recherche, badge panier, hover).
   - Ne pas ajouter de section/bandeau “badges” sous le header.

## Fichiers concernés

- `src/components/Header.tsx`
- `src/components/Header.css`

## Hors scope (pour éviter la 2ème photo)

- Pas d’ajout du composant/section “Ingrédients naturels / Formules efficaces / …” sous le header.

