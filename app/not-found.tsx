export default function NotFound() {
  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '48px 16px' }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Page introuvable</h1>
        <p style={{ marginTop: 12, color: 'rgba(26,26,26,0.7)' }}>
          La page que vous cherchez n&apos;existe pas ou a ete deplacee.
        </p>
        <a
          href="./"
          style={{
            display: 'inline-flex',
            marginTop: 18,
            padding: '12px 22px',
            borderRadius: 9999,
            background: 'var(--color-primary)',
            color: '#fff',
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: 'uppercase',
            fontSize: '0.85rem',
          }}
        >
          Retour accueil
        </a>
      </div>
    </main>
  );
}
