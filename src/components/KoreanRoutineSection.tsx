import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import './KoreanRoutineSection.css';
import { RoutinePopup } from './RoutinePopup';

export function KoreanRoutineSection() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <section className="korean-routine-section section-padding">
        <div className="korean-routine-container">
          <div className="korean-routine-content">
            <div className="korean-routine-tag">
              <Sparkles size={16} />
              <span>Korean Beauty</span>
            </div>
            <h2 className="korean-routine-title">
              Le Secret du <span>Glow Parfait</span>
            </h2>
            <p className="korean-routine-desc">
              Découvrez la méthode ancestrale en 10 étapes pour une peau lumineuse, hydratée et sans imperfections. Une véritable expérience de luxe pour votre peau.
            </p>
            <button 
              className="korean-routine-trigger-btn"
              onClick={() => setIsPopupOpen(true)}
            >
              Discover the 10-step glow ritual
              <ArrowRight size={20} />
            </button>
          </div>
          <div className="korean-routine-visual">
            <div className="korean-routine-image-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1615397323214-7299a9a38f3c?auto=format&fit=crop&q=80&w=800" 
                alt="Korean skincare ritual" 
                className="korean-routine-image"
              />
              <div className="korean-routine-glow"></div>
            </div>
          </div>
        </div>
      </section>

      <RoutinePopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
      />
    </>
  );
}
