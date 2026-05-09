import './NewArrivalsBanner.css';

type NewArrivalsBannerProps = {
  image?: string;
  href?: string;
  alt?: string;
};

export function NewArrivalsBanner({
  image = 'neww section.png',
  href = '/nouveautes',
  alt = 'Nouveautés',
}: NewArrivalsBannerProps) {
  return (
    <section className="new-arrivals-banner-section py-3xl">
      <div className="container">
        {/* Cliquer sur l'image redirige vers la page Nouveautés */}
        <a href={href} className="new-arrivals-banner-link" aria-label={alt}>
          <span className="new-arrivals-banner-media" aria-hidden="true">
            <img
              src={`/${image}`}
              alt={alt}
              className="new-arrivals-banner-img"
              loading="lazy"
            />
          </span>
        </a>
      </div>
    </section>
  );
}

