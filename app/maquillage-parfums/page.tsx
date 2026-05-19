"use client";

import { Header } from '../../src/components/Header';
import { Footer } from '../../src/components/Footer';
import { BrandFlow } from '../../src/components/BrandFlow';

// --- MOCK DATA FOR MAKEUP CATEGORIES ---

const MOCK_TEINT = [
  { id: 1, name: "Fond de Teint Lumineux", price: 245, image: "dd9f7066-738b-4260-b004-c51ed5442367.png", badge: "Best-seller" },
  { id: 2, name: "BB Crème Hydratante", price: 185, image: "dd9f7066-738b-4260-b004-c51ed5442367.png" },
  { id: 3, name: "Anti-Cernes Éclat", price: 145, image: "dd9f7066-738b-4260-b004-c51ed5442367.png" },
  { id: 4, name: "Poudre Libre Matifiante", price: 210, image: "dd9f7066-738b-4260-b004-c51ed5442367.png" }
];

const MOCK_YEUX = [
  { id: 11, name: "Mascara Volume Noir", price: 195, image: "36a4c7fc-c2d8-492c-acee-a8f606be17b7.png", badge: "Nouveau" },
  { id: 12, name: "Eyeliner Précision", price: 125, image: "36a4c7fc-c2d8-492c-acee-a8f606be17b7.png" },
  { id: 13, name: "Palette Ombres Nude", price: 345, image: "36a4c7fc-c2d8-492c-acee-a8f606be17b7.png" },
  { id: 14, name: "Crayon Sourcils", price: 85, image: "36a4c7fc-c2d8-492c-acee-a8f606be17b7.png" }
];

const MOCK_LEVRES = [
  { id: 21, name: "Rouge à Lèvres Velours", price: 175, image: "image proooood 1.png", badge: "-20%" },
  { id: 22, name: "Gloss Repulpant", price: 145, image: "image proooood 1.png" },
  { id: 23, name: "Baume Hydratant Teinté", price: 95, image: "image proooood 1.png" },
  { id: 24, name: "Crayon Lèvres Contour", price: 75, image: "image proooood 1.png" }
];

const MOCK_DEMAQUILLANTS = [
  { id: 31, name: "Huile Démaquillante", price: 215, image: "19bd7403-d2ac-49a4-a584-be5895add421.png" },
  { id: 32, name: "Eau Micellaire Apaisante", price: 125, image: "19bd7403-d2ac-49a4-a584-be5895add421.png" },
  { id: 33, name: "Lait Nettoyant Doux", price: 145, image: "19bd7403-d2ac-49a4-a584-be5895add421.png" }
];

// --- MOCK DATA FOR PERFUMES ---

const MOCK_PARFUM_FEMME = [
  { id: 41, name: "Éclat de Rose", price: 850, image: "950aa654-e0a2-4875-8451-ca8805a6d44a.png", badge: "Luxe" },
  { id: 42, name: "Nuit Ambrée", price: 920, image: "950aa654-e0a2-4875-8451-ca8805a6d44a.png" },
  { id: 43, name: "Fleur de Vanille", price: 780, image: "950aa654-e0a2-4875-8451-ca8805a6d44a.png" }
];

const MOCK_PARFUM_HOMME = [
  { id: 51, name: "Bois de Cèdre", price: 890, image: "5aa79a5c-fd9e-42f0-bf17-d64dbb490eb8.png" },
  { id: 52, name: "Océan Frais", price: 750, image: "5aa79a5c-fd9e-42f0-bf17-d64dbb490eb8.png" },
  { id: 53, name: "Épices d'Orient", price: 980, image: "5aa79a5c-fd9e-42f0-bf17-d64dbb490eb8.png" }
];

export default function MaquillageParfumsPage() {
  return (
    <div className="app-container">
      <Header onCartOpen={() => {}} cartCount={0} />
      
      <main className="py-sm">
        
        {/* --- UNIVERS MAQUILLAGE --- */}
        <div className="section-header-premium mb-xl">
          <h2 className="section-title-premium">Univers Maquillage</h2>
          <div className="section-ornament-premium" aria-hidden="true" />
        </div>

        <div className="makeup-flow-group mb-2xl">
          {/* TEINT: OVERSIZED HERO (Marketing Focus) */}
          <BrandFlow 
            brandName="TEINT" 
            visualImage="dd9f7066-738b-4260-b004-c51ed5442367.png"
            products={MOCK_TEINT}
            seeMoreHref="/boutique?cat=teint"
            layout="standard"
            overlapHero
          />

          {/* YEUX: STANDARD COMPACT */}
          <BrandFlow 
            brandName="YEUX" 
            visualImage="36a4c7fc-c2d8-492c-acee-a8f606be17b7.png"
            products={MOCK_YEUX}
            seeMoreHref="/boutique?cat=yeux"
            layout="standard"
            overlapHero
          />

          {/* LÈVRES: STANDARD COMPACT */}
          <BrandFlow 
            brandName="LÈVRES" 
            visualImage="image proooood 1.png"
            products={MOCK_LEVRES}
            seeMoreHref="/boutique?cat=levres"
            layout="standard"
            overlapHero
          />

          {/* DÉMAQUILLANTS: OVERSIZED HERO (Storytelling) */}
          <BrandFlow 
            brandName="SOINS" 
            visualImage="19bd7403-d2ac-49a4-a584-be5895add421.png"
            products={MOCK_DEMAQUILLANTS}
            seeMoreHref="/boutique?cat=demaquillants"
            layout="standard"
            overlapHero
          />
        </div>

        {/* --- COLLECTION PARFUMS --- */}
        <div className="section-header-premium mt-3xl mb-xl">
          <h2 className="section-title-premium">Collection Parfums</h2>
          <div className="section-ornament-premium" aria-hidden="true" />
        </div>

        <div className="perfume-flow-group">
          <BrandFlow 
            brandName="FEMME" 
            visualImage="950aa654-e0a2-4875-8451-ca8805a6d44a.png"
            products={MOCK_PARFUM_FEMME}
            seeMoreHref="/boutique?cat=parfum-femme"
            layout="standard"
            overlapHero
          />

          <BrandFlow 
            brandName="HOMME" 
            visualImage="5aa79a5c-fd9e-42f0-bf17-d64dbb490eb8.png"
            products={MOCK_PARFUM_HOMME}
            seeMoreHref="/boutique?cat=parfum-homme"
            layout="standard"
            overlapHero
          />
        </div>

      </main>

      <Footer />
    </div>
  );
}
