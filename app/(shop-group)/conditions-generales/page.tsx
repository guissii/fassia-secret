import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente',
  description: 'Conditions générales de vente de Fassia Secret — Parapharmacie en ligne au Maroc.',
};

export default function ConditionsGeneralesPage() {
  return (
    <main className="container" style={{ padding: '3rem 1rem', maxWidth: '860px' }}>
      <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
        Conditions Générales de Vente
      </h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
          1 — Acceptation des Conditions Générales
        </h2>
        <p style={{ lineHeight: 1.7, color: 'var(--color-text-muted)' }}>
          En utilisant le site web <strong>fassiasecret.com</strong>, vous acceptez pleinement et sans réserve les présentes conditions générales de vente. Ces conditions peuvent être modifiées à tout moment sans préavis. Il est de votre responsabilité de consulter régulièrement les conditions générales mises à jour.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
          2 — Produits
        </h2>
        <p style={{ lineHeight: 1.7, color: 'var(--color-text-muted)' }}>
          <strong>Fassia Secret</strong> propose une sélection de produits de parfumerie et de cosmétique en ligne. Les descriptions des produits sont fournies avec autant de précision que possible, mais nous ne pouvons garantir l’exactitude des informations fournies. Les photos des produits sont fournies à titre illustratif uniquement et peuvent différer légèrement des produits réels.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
          3 — Commandes
        </h2>
        <p style={{ lineHeight: 1.7, color: 'var(--color-text-muted)' }}>
          Toutes les commandes sont sujettes à disponibilité des produits. <strong>Fassia Secret</strong> se réserve le droit d’annuler ou de refuser toute commande pour quelque raison que ce soit, y compris en cas de violation des présentes conditions générales ou de suspicion de fraude.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
          4 — Prix et Paiement
        </h2>
        <p style={{ lineHeight: 1.7, color: 'var(--color-text-muted)' }}>
          Les prix des produits sont indiqués en dirhams marocains (MAD) et sont sujets à changement sans préavis. Les frais de livraison sont à la charge de l’acheteur et seront indiqués lors du processus de commande.
        </p>
        <p style={{ lineHeight: 1.7, color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
          <strong>Important :</strong> Nous n&apos;acceptons pas le paiement en ligne. Le paiement s&apos;effectue exclusivement à la livraison, en espèces ou par tout autre moyen accepté par le livreur au moment de la réception de votre commande.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
          5 — Livraison
        </h2>
        <p style={{ lineHeight: 1.7, color: 'var(--color-text-muted)' }}>
          Les délais de livraison sont estimés et peuvent varier en fonction de la destination et de la disponibilité des produits. La livraison est assurée partout au Maroc. Les frais de livraison sont calculés en fonction de la destination et indiqués lors de la validation de la commande.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
          6 — Retours et Remboursements
        </h2>
        <p style={{ lineHeight: 1.7, color: 'var(--color-text-muted)' }}>
          Pour des raisons d&apos;hygiène et de sécurité, <strong>les produits vendus ne sont ni repris ni échangés</strong>. Nous vous invitons à vérifier attentivement votre commande avant de valider votre achat.
        </p>
        <p style={{ lineHeight: 1.7, color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
          En cas de produit défectueux ou non conforme à la commande lors de la livraison, veuillez nous contacter immédiatement via WhatsApp au <strong>+212 774-656745</strong>. Nous étudierons votre réclamation au cas par cas.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
          7 — Propriété Intellectuelle
        </h2>
        <p style={{ lineHeight: 1.7, color: 'var(--color-text-muted)' }}>
          Tous les contenus du site <strong>fassiasecret.com</strong>, y compris les textes, les images, les logos et les vidéos, sont la propriété exclusive de <strong>Fassia Secret</strong> et sont protégés par les lois nationales et internationales sur la propriété intellectuelle. Toute reproduction ou utilisation non autorisée de ces contenus est strictement interdite.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
          8 — Contact
        </h2>
        <p style={{ lineHeight: 1.7, color: 'var(--color-text-muted)' }}>
          Pour toute question relative aux présentes conditions générales, vous pouvez nous contacter via WhatsApp au <strong>+212 774-656745</strong> ou par e-mail à <strong>fassiasecret@gmail.com</strong>.
        </p>
      </section>
    </main>
  );
}
