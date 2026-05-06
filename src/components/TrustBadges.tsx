import { ShieldCheck, Lock, Truck, Headset } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    {
      icon: <ShieldCheck size={24} strokeWidth={1.5} />,
      title: "Authenticité",
      desc: "Produits 100% certifiés"
    },
    {
      icon: <Lock size={24} strokeWidth={1.5} />,
      title: "Paiement Sécurisé",
      desc: "Transactions cryptées"
    },
    {
      icon: <Truck size={24} strokeWidth={1.5} />,
      title: "Livraison Rapide",
      desc: "Partout au Maroc"
    },
    {
      icon: <Headset size={24} strokeWidth={1.5} />,
      title: "Service Client",
      desc: "Assistance 7j/7"
    }
  ];

  return (
    <section className="trust-section">
      <div className="container">
        <div className="trust-wrapper">
          {badges.map((badge, index) => (
            <div key={index} className="trust-item">
              <div className="trust-icon">{badge.icon}</div>
              <div className="trust-text">
                <h4 className="trust-title">{badge.title}</h4>
                <p className="trust-desc">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
