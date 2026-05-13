import { useEffect, useRef, useState, type ComponentType } from 'react';
import Link from 'next/link';
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
import { publicAssetUrl } from '../lib/publicUrl';

const desktopMenuCategories = [
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

const mobileDrawerCategories = [
  { title: "DERMO-CORNER", items: ["La Roche-Posay", "Vichy", "CeraVe", "Bioderma", "SVR", "Eucerin"] },
  { title: "PROMOTIONS !", items: ["Offres du moment", "Bons plans", "Dernieres promotions"] },
  { title: "K-BEAUTY", items: ["Nettoyants", "Serums", "Creme hydratante", "Masques", "SPF"] },
  {
    title: "VISAGE",
    items: [
      "Solaire: Protection solaire",
      "Solaire: Auto-bronzant",
      "Solaire: Soin apres-soleil",
      "Type: Nettoyant visage",
      "Type: Serum",
      "Type: Creme de jour",
      "Type: Creme de nuit",
      "Type: Contour des yeux",
      "Type: Eau micellaire",
      "Type: Masque visage",
      "Besoins: Anti-imperfections",
      "Besoins: Anti-age",
      "Besoins: Hydratant & nourrissant",
      "Besoins: Anti-taches",
      "Besoins: Anti-rougeurs",
      "Besoins: Eclat & anti-fatigue",
      "Besoins: Peaux sensibles",
    ]
  },
  { title: "CHEVEUX", items: ["Shampoing", "Apres-shampoing", "Masque cheveux", "Soins reparateurs", "Huiles & serums"] },
  { title: "MAQUILLAGE", items: ["Teint", "Yeux", "Levres", "Demaquillant", "Accessoires maquillage"] },
  { title: "CORPS", items: ["Corps & bain", "Hydratation", "Gommage", "Rasage & epilation", "Minceur"] },
  { title: "MAMAN & BEBE", items: ["Bebe", "Maman", "Solaire bebe", "Change & toilette", "Accessoires"] },
  { title: "HOMMES", items: ["Soins visage homme", "Soins corps homme", "Deodorants", "Rasage", "Barbe"] },
  { title: "HYGIÈNE DENTAIRE", items: ["Dentifrices", "Brosses a dents", "Bains de bouche", "Blanchiment"] },
  { title: "HYGIÈNE", items: ["Gel hydroalcoolique", "Deodorants", "Soin intime", "Protections"] },
  { title: "HYGIÈNE & INTIMITÉ", items: ["Toilette Intime", "Serviettes Hygieniques", "Tampons", "Lubrifiants"] },
  { title: "ACCESSOIRES", items: ["Accessoires visage", "Accessoires cheveux", "Trousses", "Brosses", "Eponges"] },
  { title: "MINCEUR", items: ["Brule-graisses", "Draineurs", "Collagene", "Sport & recuperation"] },
  { title: "SPORT", items: ["Proteines", "Energie", "Hydratation", "Recuperation"] },
  { title: "SANTÉ", items: ["Auto-Surveillance", "Premiers Secours", "Orthopedie & soutien", "Bien-etre"] },
  { title: "COMPLEMENTS ALIMENTAIRES", items: ["Vitamines & Mineraux", "Collagene", "Omega 3", "Detox & Drainage"] },
  { title: "PREMIUM HAIR CARE", items: ["Shampoing premium", "Masque premium", "Huiles & serums", "Anti-chute"] },
  { title: "PREOCCUPATIONS", items: ["Acne & Imperfections", "Cernes", "Taches", "Rosacee & Rougeurs", "Peau seche", "Anti-age", "Chute de cheveux", "Immunite"] },
];

const mobileMenuItems: Array<{ label: string; Icon: ComponentType<{ size?: number; className?: string }> }> = [
  { label: 'DERMO-CORNER', Icon: ShieldCheck },
  { label: 'PROMOTIONS !', Icon: Tag },
  { label: 'K-BEAUTY', Icon: Sparkles },
  { label: 'CORPS', Icon: Droplet },
  { label: 'VISAGE', Icon: Sparkles },
  { label: 'CHEVEUX', Icon: Scissors },
  { label: 'HYGIÈNE DENTAIRE', Icon: Smile },
  { label: 'MAQUILLAGE', Icon: Brush },
  { label: 'HYGIÈNE & INTIMITÉ', Icon: Leaf },
  { label: 'HYGIÈNE', Icon: Leaf },
  { label: 'ACCESSOIRES', Icon: MoreHorizontal },
  { label: 'MINCEUR', Icon: HeartPulse },
  { label: 'SPORT', Icon: HeartPulse },
  { label: 'MAMAN & BEBE', Icon: Heart },
  { label: 'HOMMES', Icon: Heart },
  { label: 'SANTÉ', Icon: HeartPulse },
  { label: 'PREOCCUPATIONS', Icon: Flame },
  { label: 'COMPLEMENTS ALIMENTAIRES', Icon: Sprout },
  { label: 'PREMIUM HAIR CARE', Icon: Scissors }
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
  const mobileMenuCloseButtonRef = useRef<HTMLButtonElement>(null);
  const restoreMenuFocusRef = useRef<HTMLElement | null>(null);
  const restoreSearchFocusRef = useRef<HTMLElement | null>(null);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileCategory(null);
  };

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
  };

  const toggleMobileMenu = () => {
    if (typeof document !== 'undefined' && !isMobileMenuOpen) {
      restoreMenuFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    setIsMobileMenuOpen((v) => {
      const next = !v;
      if (next) setOpenMobileCategory(null);
      return next;
    });
    setIsMobileSearchOpen(false);
  };

  const openDrawerWithCategory = (category: string | null) => {
    if (typeof document !== 'undefined') {
      restoreMenuFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
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
    if (typeof document !== 'undefined') {
      restoreSearchFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    setIsMobileMenuOpen(false);
    setOpenMobileCategory(null);
    setIsMobileSearchOpen(true);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      requestAnimationFrame(() => mobileMenuCloseButtonRef.current?.focus());
      return;
    }

    if (isMobileSearchOpen) return;

    const toRestore = restoreMenuFocusRef.current;
    restoreMenuFocusRef.current = null;
    if (toRestore) requestAnimationFrame(() => toRestore.focus());
  }, [isMobileMenuOpen, isMobileSearchOpen]);

  useEffect(() => {
    if (isMobileSearchOpen) return;
    if (isMobileMenuOpen) return;

    const toRestore = restoreSearchFocusRef.current;
    restoreSearchFocusRef.current = null;
    if (toRestore) requestAnimationFrame(() => toRestore.focus());
  }, [isMobileSearchOpen, isMobileMenuOpen]);

  const mobileMenuCategories = mobileMenuItems.map(({ label, Icon }) => {
    const fromDrawer = mobileDrawerCategories.find((c) => c.title === label);
    const items = fromDrawer?.items ?? [];

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
          <button
            className="mobile-menu-icon-btn"
            onClick={closeMobileMenu}
            aria-label="Fermer le menu"
            ref={mobileMenuCloseButtonRef}
            type="button"
          >
            <X size={24} />
          </button>

          <div className="mobile-menu-brand" aria-label="Fassia Secret">
            <img className="mobile-menu-logo" src={publicAssetUrl('logo.png')} alt="Fassia Secret" />
            <div className="mobile-menu-brand-text">
              <div className="mobile-menu-brand-title">Fassia Secret</div>
              <div className="mobile-menu-brand-subtitle">PARAPHARMACIE</div>
            </div>
          </div>

          <button className="mobile-menu-icon-btn" onClick={onCartOpen} aria-label="Ouvrir le panier" type="button">
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
                  <a
                    key={item}
                    href="#"
                    className="mobile-submenu-item"
                    onClick={(e) => {
                      e.preventDefault();
                      closeMobileMenu();
                    }}
                  >
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
            type="button"
          >
            <Menu size={28} />
          </button>

          <Link className="logo" href="/" aria-label="Fassia Secret">
            <img className="site-logo" src={publicAssetUrl('logo.png')} alt="Fassia Secret" />
          </Link>
          
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
            <button className="action-btn flex-col items-center hidden-mobile" aria-label="Favoris" type="button">
              <Heart size={24} />
              <span className="action-label text-xs">Favoris</span>
            </button>
            <button
              className="action-btn flex-col items-center cart-btn mobile-cart-btn"
              onClick={onCartOpen}
              aria-label="Panier"
              type="button"
            >
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
            {desktopMenuCategories.map((category, index) => (
              <li key={index} className="nav-item">
                <a
                  href="#"
                  className="nav-link flex items-center gap-xs"
                  onClick={(e) => e.preventDefault()}
                >
                  {category.title} <ChevronDown size={14} className="dropdown-icon" />
                </a>
                <div className="dropdown-menu">
                  <ul>
                    {category.items.map((item, idx) => (
                      <li key={idx}>
                        <a href="#" className="dropdown-item" onClick={(e) => e.preventDefault()}>
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
            <li>
              <a
                href="#"
                className="nav-link nav-link-promos flex items-center gap-xs"
                onClick={(e) => e.preventDefault()}
              >
                <Tag size={14} className="promos-icon" /> PROMOS
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
