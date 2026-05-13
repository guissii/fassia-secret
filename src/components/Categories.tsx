import { ArrowRight, Leaf } from 'lucide-react';
import { publicAssetUrl } from '../lib/publicUrl';

export function Categories() {
  const categories = [
    {
      id: 1,
      title: "Soins du Visage",
      productsCount: "150 PRODUITS",
      image: "dd9f7066-738b-4260-b004-c51ed5442367.png",
      className: "category-large",
      btnClass: "btn-primary-rounded"
    },
    {
      id: 2,
      title: "Soins des Cheveux",
      productsCount: "120 PRODUITS",
      image: "36a4c7fc-c2d8-492c-acee-a8f606be17b7.png",
      className: "category-small",
      btnClass: "btn-primary-rounded"
    },
    {
      id: 3,
      title: "Complements Alimentaires",
      productsCount: "200 PRODUITS",
      image: "hero%20new.png",
      className: "category-small category-supplements",
      btnClass: "btn-primary-rounded"
    }
  ];

  return (
    <section className="categories-section py-3xl">
      <div className="container">
        
        {/* Section Title */}
        <div className="categories-header text-center mb-2xl">
          <h2 className="categories-title">
            Catégories Populaires
          </h2>
          <div className="categories-ornament">
            <span className="ornament-line"></span>
            <Leaf size={20} className="ornament-icon" strokeWidth={1.5} />
            <span className="ornament-line"></span>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="categories-bento-grid">
          {categories.map((cat) => (
            <div key={cat.id} className={`bento-card ${cat.className}`}>
              <div 
                className="bento-bg"
                style={{
                  backgroundImage: `url('${publicAssetUrl(cat.image)}')`,
                }}
              ></div>
              <div className="bento-gradient"></div>
              
              <div className="bento-content text-center">
                <h3 className="bento-title">{cat.title}</h3>
                <p className="bento-count">{cat.productsCount}</p>
                <button className={`bento-btn ${cat.btnClass}`} type="button">
                  DÉCOUVRIR <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
