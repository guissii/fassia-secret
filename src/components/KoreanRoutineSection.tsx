import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import './KoreanRoutineSection.css';

export function KoreanRoutineSection() {
  const imageUrl = (prompt: string) => {
    return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=portrait_4_3`;
  };

  return (
    <>
      <section className="korean-routine-section section-padding">
        <div className="korean-routine-container">
          <div className="korean-routine-content">
            <Link href="/korean-beauty" className="korean-routine-tag" aria-label="Aller à Korean Beauty">
              <Sparkles size={16} />
              <span>Korean Beauty</span>
            </Link>
            <h2 className="korean-routine-title">
              Le Secret du <span>Glow Parfait</span>
            </h2>
            <p className="korean-routine-desc">
              Découvrez la méthode ancestrale en 10 étapes pour une peau lumineuse, hydratée et sans imperfections. Une véritable expérience de luxe pour votre peau.
            </p>
            <Link className="korean-routine-trigger-btn" href="/korean-beauty">
              Discover the 10-step glow ritual
              <ArrowRight size={20} />
            </Link>
          </div>
          <div className="korean-routine-visual">
            <Link href="/korean-beauty" className="korean-routine-image-wrapper" aria-label="Découvrir le rituel Korean Beauty">
              <img 
                src={imageUrl('Photographie premium skincare coréen, flacons sérum et textures glossy, ambiance rose nude minimal luxe, lumière studio douce, haute définition')} 
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
