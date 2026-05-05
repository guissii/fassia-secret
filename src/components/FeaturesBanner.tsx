import { Leaf, FlaskConical, Heart, Droplet } from 'lucide-react';
import './FeaturesBanner.css';

export function FeaturesBanner() {
  const features = [
    {
      icon: <Leaf size={32} strokeWidth={1} />,
      title: "Ingrédients Naturels",
      desc: "100% d'origine naturelle"
    },
    {
      icon: <FlaskConical size={32} strokeWidth={1} />,
      title: "Sans Parabènes",
      desc: "Formules saines"
    },
    {
      icon: <Heart size={32} strokeWidth={1} />,
      title: "Cruelty Free",
      desc: "Non testé sur les animaux"
    },
    {
      icon: <Droplet size={32} strokeWidth={1} />,
      title: "Convient à Tous",
      desc: "Tous types de peaux"
    }
  ];

  return (
    <section className="features-banner py-xl">
      <div className="container">
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <div className="feature-icon">{feature.icon}</div>
              <h4 className="feature-title">{feature.title}</h4>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
