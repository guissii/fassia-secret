"use client";

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { ProductCarousel } from './components/ProductCarousel';
import './styles/CollectionLayout.css';

export default function HommeClientPage({ collections }: { collections: any[] }) {
  return (
    <>
      <main className="collection-page">
        <section className="collection-hero" style={{ backgroundColor: '#f4f5f7' }}>
          <div className="container">
            <h1 className="collection-hero-title">Espace <span>Homme</span></h1>
            <p className="collection-hero-desc" style={{ color: '#555' }}>
              Soins, hygiène et entretien de la barbe. L'excellence pour lui.
            </p>
          </div>
        </section>

        {collections.length === 0 ? (
          <section className="empty-section">
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0', minHeight: '40vh' }}>
              <p style={{ color: '#666', fontSize: '1.2rem' }}>Aucune collection homme n'est disponible pour le moment.</p>
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
                        <span className="highlight" style={{ color: '#4a5568' }}>{stepId}.</span> {step.name}
                      </h2>
                    </div>
                  </div>

                  <ProductCarousel
                    stepId={stepId}
                    title={step.name}
                    visualImage={step.image}
                    visualImageComponent={!step.image ? (
                      <div className="essentials-visual-placeholder" style={{ backgroundColor: '#e2e8f0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#4a5568', fontWeight: 'bold', fontSize: '1.2rem', padding: '1rem', textAlign: 'center' }}>{step.name}</span>
                      </div>
                    ) : undefined}
                    products={step.products}
                    productLabel="HOMME"
                    seeMoreHref={`/boutique?collection=${step.slug}`}
                  />
                </div>
              </section>
            );
          })
        )}

        <section className="kb-global-cta">
          <div className="container" style={{ textAlign: 'center' }}>
            <Link href="/boutique?category=Hommes" className="kb-global-cta-link" style={{ backgroundColor: '#2d3748' }}>
              <span className="kb-global-cta-text">
                <span className="kb-global-cta-title">Tout l'univers Homme</span>
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
