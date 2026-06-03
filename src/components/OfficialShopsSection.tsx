"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { useCart } from "./CartContext";
import { productHref } from "../lib/productSlug";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./OfficialShopsSection.css";

interface CategoryTab {
  key: string;
  label: string;
  apiQuery: string;
}

const CATEGORIES: CategoryTab[] = [
  {
    key: "kbeauty",
    label: "Korean Beauty",
    apiQuery: "/api/products?category=K-Beauty&limit=15&random=true",
  },
  {
    key: "complements",
    label: "Compléments Alimentaires",
    apiQuery: "/api/products?category=Compléments&limit=15&random=true",
  },
  {
    key: "maquillage",
    label: "Maquillage & Parfums",
    apiQuery: "/api/products?category=Maquillage&limit=15&random=true",
  },
];

function HorizontalCarousel({ products }: { products: any[] }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || products.length <= 3) return;

    let animId: number;
    let lastTime = 0;
    const speed = 0.5; // pixels per frame

    const scroll = (time: number) => {
      if (!isPaused && el) {
        if (lastTime) {
          const delta = time - lastTime;
          el.scrollLeft += (speed * delta) / 16;
          // Loop when reaching end
          if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
            el.scrollLeft = 0;
          }
        }
        lastTime = time;
      }
      animId = requestAnimationFrame(scroll);
    };

    animId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animId);
  }, [products.length, isPaused]);

  const scrollBy = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <div
      className="official-shops-carousel-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <button
        className="official-shops-arrow official-shops-arrow-left"
        onClick={() => scrollBy(-1)}
        aria-label="Précédent"
      >
        <ChevronLeft size={20} />
      </button>

      <div
        ref={scrollRef}
        className="official-shops-carousel"
        style={{
          display: "flex",
          gap: "1rem",
          overflowX: "auto",
          scrollBehavior: "smooth",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          padding: "0.5rem 0",
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="official-shops-product"
            style={{ flex: "0 0 220px", minWidth: 220 }}
          >
            <ProductCard
              product={p}
              label={p.brand}
              onNavigate={() => router.push(productHref(p))}
              onAddToCart={() => addToCart(p)}
            />
          </div>
        ))}
      </div>

      <button
        className="official-shops-arrow official-shops-arrow-right"
        onClick={() => scrollBy(1)}
        aria-label="Suivant"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

export function OfficialShopsSection() {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].key);
  const [productsByTab, setProductsByTab] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    CATEGORIES.forEach((cat) => {
      setLoading((prev) => ({ ...prev, [cat.key]: true }));
      fetch(cat.apiQuery)
        .then((r) => r.json())
        .then((data) => {
          setProductsByTab((prev) => ({ ...prev, [cat.key]: data.products || [] }));
          setLoading((prev) => ({ ...prev, [cat.key]: false }));
        })
        .catch(() => {
          setProductsByTab((prev) => ({ ...prev, [cat.key]: [] }));
          setLoading((prev) => ({ ...prev, [cat.key]: false }));
        });
    });
  }, []);

  const activeProducts = productsByTab[activeTab] || [];
  const isLoading = loading[activeTab];

  return (
    <section className="official-shops-section py-3xl">
      <div className="container">
        <div className="section-header-premium">
          <h2 className="section-title-premium">Les Boutiques Officielles</h2>
          <div className="section-ornament-premium" aria-hidden="true" />
        </div>

        {/* Tabs */}
        <div
          className="official-shops-tabs"
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveTab(cat.key)}
              className={`official-shops-tab ${activeTab === cat.key ? "active" : ""}`}
              style={{
                padding: "0.6rem 1.4rem",
                borderRadius: "9999px",
                border: "1.5px solid",
                borderColor: activeTab === cat.key ? "#ec4899" : "#e5e7eb",
                background: activeTab === cat.key ? "#fdf2f8" : "#fff",
                color: activeTab === cat.key ? "#be185d" : "#374151",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Carousel */}
        {isLoading ? (
          <div
            style={{
              minHeight: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            Chargement des produits...
          </div>
        ) : activeProducts.length === 0 ? (
          <div
            style={{
              minHeight: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            Aucun produit disponible pour le moment.
          </div>
        ) : (
          <HorizontalCarousel products={activeProducts} />
        )}

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link
            href={
              activeTab === "kbeauty"
                ? "/korean-beauty"
                : activeTab === "complements"
                ? "/complements-alimentaires"
                : "/boutique?category=Maquillage"
            }
            className="see-more-products-cta"
            style={{ display: "inline-flex" }}
          >
            Voir plus
          </Link>
        </div>
      </div>
    </section>
  );
}
