"use client";

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { ProductCarousel } from './components/ProductCarousel';
import './styles/CollectionLayout.css';

export default function AccessoiresClientPage({ collections }: { collections: any[] }) {
  return (
    <>
      <main className="collection-page">
        <section className="collection-hero" style={{ backgroundColor: '#fdfbfb' }}>
          <div className="container">
            <h1 className="collection-hero-title">Accessoires <span>Premium</span></h1>
            <p className="collection-hero-desc">
              Découvrez notre sélection d'accessoires de beauté pour sublimer votre routine.
            </p>
          </div>
        </section>

        {collections.length === 0 ? (
          <section className="empty-section">
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0', minHeight: '40vh' }}>
              <p style={{ color: '#666', fontSize: '1.2rem' }}>Aucune collection d'accessoires n'est disponible pour le moment.</p>
            </div>
          </section>
        ) : (
          collections.map((step, index) => {
            const stepId = (index + 1).toString().padStart(2, '0');

            return (
              <section className="essentials-section" key={step.id}>
                <div className="container">
                  <div className="essentials-header-row">
                    <div className="essentials-title-group">
                      <h2 className="essentials-title">
                        <span className="highlight">{stepId}.</span> {step.name}
                      </h2>
                    </div>
                  </div>

                  <ProductCarousel
                    stepId={stepId}
                    title={step.name}
                    visualImage={step.image}
                    visualImageComponent={!step.image ? (
                      <div className="essentials-visual-placeholder" style={{ backgroundColor: '#f5ebe9', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#cbaea3', fontWeight: 'bold', fontSize: '1.2rem', padding: '1rem', textAlign: 'center' }}>{step.name}</span>
                      </div>
                    ) : undefined}
                    products={step.products}
                    productLabel="ACCESSOIRES"
                    seeMoreHref={`/boutique?collection=${step.slug}`}
                  />
                </div>
              </section>
            );
          })
        )}

        <section className="kb-global-cta">
          <div className="container" style={{ textAlign: 'center' }}>
            <Link href="/boutique?category=Accessoires" className="kb-global-cta-link">
              <span className="kb-global-cta-text">
                <span className="kb-global-cta-title">Tous les Accessoires</span>
              </span>
              <span className="kb-global-cta-icon" aria-hidden="true">
                <ArrowRight size={24} />
              </span>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
