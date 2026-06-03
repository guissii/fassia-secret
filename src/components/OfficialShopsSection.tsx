"use client";

import React from "react";
import Link from "next/link";
import "./OfficialShopsSection.css";

interface Brand {
  name: string;
}

interface CategoryRow {
  key: string;
  label: string;
  brands: Brand[];
}

const CATEGORIES: CategoryRow[] = [
  {
    key: "kbeauty",
    label: "Korean Beauty",
    brands: [
      { name: "COSRX" },
      { name: "Laneige" },
      { name: "Innisfree" },
      { name: "Sulwhasoo" },
      { name: "Beauty of Joseon" },
      { name: "Anua" },
      { name: "Mediheal" },
      { name: "Dr. Jart+" },
      { name: "Banila Co" },
      { name: "Etude House" },
      { name: "Missha" },
      { name: "The Face Shop" },
      { name: "Pyunkang Yul" },
      { name: "Purito" },
      { name: "Benton" },
    ],
  },
  {
    key: "complements",
    label: "Compléments Alimentaires",
    brands: [
      { name: "Pure Encapsulations" },
      { name: "Optimum Nutrition" },
      { name: "Now Foods" },
      { name: "Solgar" },
      { name: "Garden of Life" },
      { name: "Thorne" },
      { name: "Life Extension" },
      { name: "Doctor's Best" },
      { name: "Jarrow Formulas" },
      { name: "Nordic Naturals" },
      { name: "Sports Research" },
      { name: "Nature's Way" },
      { name: "Source Naturals" },
      { name: "Country Life" },
      { name: "Nutrilite" },
    ],
  },
  {
    key: "maquillage",
    label: "Maquillage & Parfums",
    brands: [
      { name: "Chanel" },
      { name: "Dior" },
      { name: "YSL" },
      { name: "Lancôme" },
      { name: "MAC" },
      { name: "NARS" },
      { name: "Fenty Beauty" },
      { name: "Tarte" },
      { name: "Urban Decay" },
      { name: "Estée Lauder" },
      { name: "Maybelline" },
      { name: "L'Oréal" },
      { name: "Charlotte Tilbury" },
      { name: "Huda Beauty" },
      { name: "Benefit" },
    ],
  },
];

function MarqueeRow({ brands }: { brands: Brand[] }) {
  const doubled = [...brands, ...brands];

  return (
    <div className="marquee-row">
      <div className="marquee-track">
        {doubled.map((brand, i) => (
          <Link
            key={`${brand.name}-${i}`}
            href={`/boutique?q=${encodeURIComponent(brand.name)}`}
            className="marquee-brand"
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function OfficialShopsSection() {
  return (
    <section className="official-shops-section py-3xl">
      <div className="container">
        <div className="section-header-premium">
          <h2 className="section-title-premium">Les Boutiques Officielles</h2>
          <div className="section-ornament-premium" aria-hidden="true" />
        </div>

        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="official-shops-category">
            <h3 className="official-shops-category-title">{cat.label}</h3>
            <MarqueeRow brands={cat.brands} />
          </div>
        ))}
      </div>
    </section>
  );
}
