import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import './KoreanRoutineSection.css';

export function KoreanRoutineSection() {
  const [banner, setBanner] = useState<{ imageUrl: string; linkUrl: string; title: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/banners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const kbBanner = data.find(b => b.section === 'korean-beauty');
          if (kbBanner) setBanner(kbBanner);
        }
      })
      .catch(console.error);
  }, []);

  const defaultImageUrl = '/logo.png';

  return (
    <>
      <section className="korean-routine-section section-padding">
        <div className="korean-routine-container">
          <div className="korean-routine-content">
            <Link href={banner?.linkUrl || "/korean-beauty"} className="korean-routine-tag" aria-label="Aller à Korean Beauty">
              <Sparkles size={16} />
              <span>{banner?.title || 'Korean Beauty'}</span>
            </Link>
            <h2 className="korean-routine-title">
              Le Secret du <span>Glow Parfait</span>
            </h2>
            <p className="korean-routine-desc">
              Découvrez la méthode ancestrale en 10 étapes pour une peau lumineuse, hydratée et sans imperfections. Une véritable expérience de luxe pour votre peau.
            </p>
            <Link className="korean-routine-trigger-btn" href={banner?.linkUrl || "/korean-beauty"}>
              Discover the 10-step glow ritual
              <ArrowRight size={20} />
            </Link>
          </div>
          <div className="korean-routine-visual">
            <Link href={banner?.linkUrl || "/korean-beauty"} className="korean-routine-image-wrapper" aria-label="Découvrir le rituel Korean Beauty">
              <img 
                src={banner?.imageUrl || defaultImageUrl} 
                alt="Korean skincare ritual" 
                className="korean-routine-image"
              />
              <div className="korean-routine-glow"></div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
