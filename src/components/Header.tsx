import { useEffect, useRef, useState, type ComponentType } from 'react';
import {
  Brush,
  ChevronDown,
  Droplet,
  Flame,
  MoreHorizontal,
  Headphones,
  Heart,
  HeartPulse,
  Leaf,
  Lock,
  Menu,
  Scissors,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Smile,
  Sprout,
  Tag,
  Truck,
  X
} from 'lucide-react';

const menuCategories = [
  {
    title: "CORPS",
    items: ["Déodorants", "Gels Douche", "Gommage & Exfoliants", "Hydratation & Nutrition", "Parfums Femmes", "Rasage & Épilation", "Savons", "Soins des Mains & Pieds", "Soins des Ongles", "Soins Minceur & Anti-Cellulite", "Accessoires de Bain"]
  },
  {
    title: "VISAGE",
    items: ["Crèmes & Soins Hydratants", "Nettoyants & Démaquillants", "Protections Solaires", "Soins des Lèvres", "Soins Anti-taches & Éclaircissants", "Soins Anti-âge", "Soins Anti-Imperfections", "Soins des Yeux", "Masques & Gommages"]
  },
  {
    title: "CHEVEUX",
    items: ["Shampoings", "Après-shampoings", "Masques & Soins Réparateurs", "Colorations & Entretien", "Produits & Accessoires de Coiffure"]
  },
  {
    title: "HYGIÈNE DENTAIRE",
    items: ["Brosses à dents", "Dentifrices", "Bains De Bouche & Haleine", "Soins dentaires"]
  },
  {
    title: "MAQUILLAGE",
    items: ["Nettoyants & Démaquillants", "Teint", "Yeux", "Lèvres", "Accessoires Maquillage", "Trousses de Maquillage"]
  },
  {
    title: "HYGIÈNE & INTIMITÉ",
    items: ["Toilette Intime", "Serviettes Hygiéniques", "Tampons", "Lubrifiants"]
  },
  {
    title: "SANTÉ",
    items: ["Auto-Surveillance", "Compléments alimentaires", "Premiers Secours", "Orthopédie & Soutien"]
  },
  {
    title: "HOMMES",
    items: ["Déodorants", "Soins Hommes", "Lubrifiants", "Préservatifs"]
  },
  {
    title: "PREOCCUPATIONS",
    items: ["Acne & Imperfections", "Cernes", "Taches", "Rosacee & Rougeurs", "Peau seche", "Anti-age", "Chute de cheveux", "Immunite"]
  }
];

const mobileMenuItems: Array<{ label: string; Icon: ComponentType<{ size?: number; className?: string }> }> = [
  { label: 'CORPS', Icon: Droplet },
  { label: 'VISAGE', Icon: Sparkles },
  { label: 'CHEVEUX', Icon: Scissors },
  { label: 'HYGIÈNE DENTAIRE', Icon: Smile },
  { label: 'MAQUILLAGE', Icon: Brush },
  { label: 'HYGIÈNE & INTIMITÉ', Icon: Leaf },
  { label: 'SANTÉ', Icon: HeartPulse },
  { label: 'PREOCCUPATIONS', Icon: Flame },
  { label: 'COMPLEMENTS ALIMENTAIRES', Icon: Sprout }
];

const mobileQuickCategories: Array<{ label: string; Icon: ComponentType<{ size?: number; className?: string }>; openKey?: string }> = [
  { label: 'CORPS', Icon: Droplet, openKey: 'CORPS' },
  { label: 'VISAGE', Icon: Sparkles, openKey: 'VISAGE' },
  { label: 'CHEVEUX', Icon: Scissors, openKey: 'CHEVEUX' },
  { label: 'HYGIÈNE\nDENTAIRE', Icon: Smile, openKey: 'HYGIÈNE DENTAIRE' },
  { label: 'MAQUILLAGE', Icon: Brush, openKey: 'MAQUILLAGE' },
  { label: 'PLUS', Icon: MoreHorizontal },
  { label: 'PREOCCUPA\nTIONS', Icon: Flame, openKey: 'PREOCCUPATIONS' }
];

interface HeaderProps {
  onCartOpen: () => void;
  cartCount?: number;
}

export function Header({ onCartOpen, cartCount = 0 }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileCategory, setOpenMobileCategory] = useState<string | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileCategory(null);
  };

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((v) => {
      const next = !v;
      if (next) setOpenMobileCategory(null);
      return next;
    });
    setIsMobileSearchOpen(false);
  };

  const openDrawerWithCategory = (category: string | null) => {
    setIsMobileMenuOpen(true);
    setOpenMobileCategory(category);
    setIsMobileSearchOpen(false);
  };

  useEffect(() => {
    if (!isMobileMenuOpen && !isMobileSearchOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isMobileSearchOpen) closeMobileSearch();
      else closeMobileMenu();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileMenuOpen, isMobileSearchOpen]);

  useEffect(() => {
    if (!isMobileSearchOpen) return;
    mobileSearchInputRef.current?.focus();
  }, [isMobileSearchOpen]);

  const openMobileSearch = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileCategory(null);
    setIsMobileSearchOpen(true);
  };

  const mobileMenuCategories = mobileMenuItems.map(({ label, Icon }) => {
    const fromDesktop = menuCategories.find((c) => c.title === label);
    const items =
      fromDesktop?.items ??
      (label === 'PREOCCUPATIONS'
        ? ['Acne & Imperfections', 'Cernes', 'Taches', 'Rosacee & Rougeurs', 'Peau seche', 'Anti-age', 'Chute de cheveux', 'Immunite']
        : label === 'COMPLEMENTS ALIMENTAIRES'
          ? ['Vitamines & Mineraux', 'Collagene', 'Omega 3', 'Detox & Drainage']
          : []);

    return { label, Icon, items };
  });

  return (
    <header className="header">
      <div className="top-info-bar">
        <div className="container top-info-inner">
          <div className="top-info-items">
            <div className="top-info-track">
              <div className="top-info-item">
                <Truck size={16} className="top-info-icon" />
                <span>Livraison gratuite dès 400 MAD d'achat</span>
              </div>
              <div className="top-info-sep" />
              <div className="top-info-item">
                <ShieldCheck size={16} className="top-info-icon" />
                <span>Paiement à la livraison disponible</span>
              </div>

              <div className="top-info-sep" />
              <div className="top-info-item">
                <Truck size={16} className="top-info-icon" />
                <span>Livraison gratuite dès 400 MAD d'achat</span>
              </div>
              <div className="top-info-sep" />
              <div className="top-info-item">
                <ShieldCheck size={16} className="top-info-icon" />
                <span>Paiement à la livraison disponible</span>
              </div>
            </div>
          </div>

          <button className="top-lang" type="button" aria-label="Langue">
            <span>FR</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={closeMobileMenu}
        aria-hidden={!isMobileMenuOpen}
      />

      <div
        className={`mobile-search-overlay ${isMobileSearchOpen ? 'open' : ''}`}
        onClick={closeMobileSearch}
        aria-hidden={!isMobileSearchOpen}
      />

      <div
        className={`mobile-search-panel ${isMobileSearchOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Recherche"
      >
        <div className="mobile-search-inner" onClick={(e) => e.stopPropagation()}>
          <div className="search-bar flex">
            <input
              ref={mobileSearchInputRef}
              type="text"
              placeholder="Rechercher un produit, une marque..."
              aria-label="Rechercher un produit, une marque"
            />
            <button className="btn-primary search-btn" aria-label="Rechercher">
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>

      <aside
        id="mobile-menu"
        className={`mobile-menu-drawer ${isMobileMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="mobile-menu-header">
          <button className="mobile-menu-icon-btn" onClick={closeMobileMenu} aria-label="Fermer le menu">
            <X size={24} />
          </button>

          <div className="mobile-menu-brand" aria-label="Fassia Secret">
            <img className="mobile-menu-logo" src="logo.png" alt="Fassia Secret" />
            <div className="mobile-menu-brand-text">
              <div className="mobile-menu-brand-title">Fassia Secret</div>
              <div className="mobile-menu-brand-subtitle">PARAPHARMACIE</div>
            </div>
          </div>

          <button className="mobile-menu-icon-btn" onClick={onCartOpen} aria-label="Ouvrir le panier">
            <div className="mobile-menu-cart">
              <ShoppingCart size={22} />
              <span className="mobile-menu-cart-badge">{cartCount}</span>
            </div>
          </button>
        </div>

        <ul className="mobile-menu-list">
          {mobileMenuCategories.map(({ label, Icon, items }) => (
            <li key={label} className="mobile-menu-list-item">
              <button
                className="mobile-menu-link"
                type="button"
                onClick={() => setOpenMobileCategory((v) => (v === label ? null : label))}
                aria-expanded={openMobileCategory === label}
              >
                <span className="mobile-menu-link-left">
                  <Icon size={20} className="mobile-menu-link-icon" />
                  <span className="mobile-menu-link-label">{label}</span>
                </span>
                <ChevronDown size={18} className={`mobile-menu-link-chevron ${openMobileCategory === label ? 'open' : ''}`} />
              </button>

              <div className={`mobile-submenu ${openMobileCategory === label ? 'open' : ''}`}>
                {items.map((item) => (
                  <a key={item} href="#" className="mobile-submenu-item" onClick={closeMobileMenu}>
                    {item}
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <div className="mobile-menu-features" aria-label="Rassurance">
          <div className="mobile-menu-feature">
            <Leaf size={18} className="mobile-menu-feature-icon" />
            <div>
              <div className="mobile-menu-feature-title">Ingrédients naturels</div>
              <div className="mobile-menu-feature-subtitle">Sains & efficaces</div>
            </div>
          </div>
          <div className="mobile-menu-feature">
            <Truck size={18} className="mobile-menu-feature-icon" />
            <div>
              <div className="mobile-menu-feature-title">Livraison rapide</div>
              <div className="mobile-menu-feature-subtitle">Partout au Maroc</div>
            </div>
          </div>
          <div className="mobile-menu-feature">
            <Lock size={18} className="mobile-menu-feature-icon" />
            <div>
              <div className="mobile-menu-feature-title">Paiement sécurisé</div>
              <div className="mobile-menu-feature-subtitle">100% sécurisé</div>
            </div>
          </div>
          <div className="mobile-menu-feature">
            <Headphones size={18} className="mobile-menu-feature-icon" />
            <div>
              <div className="mobile-menu-feature-title">Conseils experts</div>
              <div className="mobile-menu-feature-subtitle">À votre écoute</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Header */}
      <div className="main-header">
        <div className="container header-main-grid">
          
          <button 
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Ouvrir le menu"
          >
            <Menu size={28} />
          </button>

          <a className="logo" href="#" aria-label="Fassia Secret">
            <img className="site-logo" src="logo.png" alt="Fassia Secret" />
          </a>
          
          <div className="header-search-slot">
            <div className="search-bar flex header-search hidden-mobile">
              <input type="text" placeholder="Rechercher un produit, une marque..." />
              <button className="btn-primary search-btn" aria-label="Rechercher">
                <Search size={20} />
              </button>
            </div>

            <button className="mobile-search-btn" type="button" onClick={openMobileSearch} aria-label="Ouvrir la recherche">
              <Search size={22} />
            </button>
          </div>

          <div className="actions flex items-center gap-lg">
            <button className="action-btn flex-col items-center hidden-mobile" aria-label="Favoris">
              <Heart size={24} />
              <span className="action-label text-xs">Favoris</span>
            </button>
            <button className="action-btn flex-col items-center cart-btn mobile-cart-btn" onClick={onCartOpen} aria-label="Panier">
              <div className="cart-icon-wrapper">
                <ShoppingCart size={24} />
                <span className="cart-badge">{cartCount}</span>
              </div>
              <span className="action-label text-xs hidden-mobile">Panier</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mobile-categories-bar">
        <div className="container">
          <div className="mobile-categories-grid" role="navigation" aria-label="Catégories">
            {mobileQuickCategories.map(({ label, Icon, openKey }) => (
              <button
                key={label}
                type="button"
                className="mobile-category"
                onClick={() => {
                  openDrawerWithCategory(openKey ?? null);
                }}
                aria-label={label.replace('\n', ' ')}
              >
                <Icon size={22} className="mobile-category-icon" />
                <span className="mobile-category-label">{label}</span>
                <ChevronDown size={14} className="mobile-category-chevron" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-bar">
        <div className="container">
          <ul className="flex items-center gap-xs main-nav-list">
            {menuCategories.map((category, index) => (
              <li key={index} className="nav-item">
                <a href="#" className="nav-link flex items-center gap-xs">
                  {category.title} <ChevronDown size={14} className="dropdown-icon" />
                </a>
                <div className="dropdown-menu">
                  <ul>
                    {category.items.map((item, idx) => (
                      <li key={idx}>
                        <a href="#" className="dropdown-item">{item}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
            <li>
              <a href="#" className="nav-link nav-link-promos flex items-center gap-xs">
                <Tag size={14} className="promos-icon" /> PROMOS
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
