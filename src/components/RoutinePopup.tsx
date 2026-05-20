import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Droplet, 
  Sparkles, 
  Wand2, 
  Droplets, 
  Flower2, 
  FlaskConical, 
  ScanFace, 
  Eye, 
  Milk, 
  Sun,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import './RoutinePopup.css';

const ROUTINE_STEPS = [
  {
    id: 1,
    title: 'Oil Cleanser',
    desc: 'Remove makeup & SPF',
    icon: Droplet,
    productName: 'Gentle Cleansing Oil',
    productPrice: '32.00 €',
    image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 2,
    title: 'Foam Cleanser',
    desc: 'Deep clean pores',
    icon: Sparkles,
    productName: 'Purifying Foam',
    productPrice: '28.00 €',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 3,
    title: 'Exfoliator',
    desc: 'Remove dead skin cells',
    icon: Wand2,
    productName: 'Glow AHA/BHA Exfoliant',
    productPrice: '35.00 €',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 4,
    title: 'Toner',
    desc: 'Balance skin pH',
    icon: Droplets,
    productName: 'Hydrating Essence Toner',
    productPrice: '25.00 €',
    image: 'https://images.unsplash.com/photo-1615397323214-7299a9a38f3c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 5,
    title: 'Essence',
    desc: 'Hydrate & cellular turnover',
    icon: Flower2,
    productName: 'Snail Mucin Power Essence',
    productPrice: '42.00 €',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 6,
    title: 'Serum',
    desc: 'Target specific concerns',
    icon: FlaskConical,
    productName: 'Vitamin C Brightening Serum',
    productPrice: '55.00 €',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 7,
    title: 'Sheet Mask',
    desc: 'Intense hydration boost',
    icon: ScanFace,
    productName: 'Aloe Soothing Mask Set',
    productPrice: '15.00 €',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 8,
    title: 'Eye Cream',
    desc: 'Prevent fine lines',
    icon: Eye,
    productName: 'Peptide Eye Repair',
    productPrice: '48.00 €',
    image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 9,
    title: 'Moisturizer',
    desc: 'Seal in moisture',
    icon: Milk,
    productName: 'Ceramide Barrier Cream',
    productPrice: '60.00 €',
    image: 'https://images.unsplash.com/photo-1611077544760-4b2a3044a1b0?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 10,
    title: 'Sunscreen',
    desc: 'Protect from UV rays',
    icon: Sun,
    productName: 'Watery Sun Gel SPF50+',
    productPrice: '38.00 €',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&q=80&w=600'
  }
];

interface RoutinePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoutinePopup({ isOpen, onClose }: RoutinePopupProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCardClick = (id: number) => {
    if (expandedStep === id) {
      setExpandedStep(null);
    } else {
      setExpandedStep(id);
      
      // Optional: scroll the clicked card into view if needed
      setTimeout(() => {
        if (sliderRef.current) {
          const cardElement = sliderRef.current.querySelector(`[data-id="${id}"]`);
          if (cardElement) {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      }, 300);
    }
  };

  return (
    <div className="routine-popup-overlay">
      <div className="routine-popup-container">
        
        <header className="routine-popup-header">
          <div className="routine-popup-title-area">
            <span className="routine-popup-subtitle">Korean Beauty</span>
            <h2 className="routine-popup-title">The 10-Step Glow Ritual</h2>
          </div>
          <button className="routine-popup-close" onClick={onClose} aria-label="Close">
            <X size={28} />
          </button>
        </header>

        <div className="routine-slider-wrapper">
          <div className="routine-slider" ref={sliderRef}>
            {ROUTINE_STEPS.map((step) => {
              const isExpanded = expandedStep === step.id;
              const Icon = step.icon;

              return (
                <div 
                  key={step.id} 
                  data-id={step.id}
                  className={`routine-card ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => handleCardClick(step.id)}
                >
                  <div className="routine-card-inner">
                    <div className="routine-card-header">
                      <span className="routine-card-number">
                        {step.id.toString().padStart(2, '0')}
                      </span>
                      <div className="routine-card-icon">
                        <Icon size={24} strokeWidth={1.5} />
                      </div>
                    </div>
                    
                    <div className="routine-card-content">
                      <h3 className="routine-card-title">{step.title}</h3>
                      <p className="routine-card-desc">{step.desc}</p>
                    </div>

                    <div className="routine-card-expanded-content">
                      <div className="routine-product-image-container">
                        <img src={step.image} alt={step.productName} className="routine-product-image" />
                      </div>
                      <div className="routine-product-info">
                        <span className="routine-product-name">{step.productName}</span>
                        <span className="routine-product-price">{step.productPrice}</span>
                      </div>
                      <button className="routine-shop-step-btn" onClick={(e) => {
                        e.stopPropagation();
                        // Add to cart or redirect logic
                      }}>
                        <ShoppingBag size={18} />
                        Shop This Step
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Spacer for end of slider padding */}
            <div className="routine-slider-spacer"></div>
          </div>
        </div>

        <footer className="routine-popup-footer">
          <Link href="/korean-beauty" className="routine-shop-all-btn" onClick={onClose}>
            Shop Full Routine <ArrowRight size={20} />
          </Link>
        </footer>

      </div>
    </div>
  );
}
