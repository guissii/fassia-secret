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

type DrawerItem = { label: string; href: string };
type DrawerCategory = { title: string; items: DrawerItem[] };

const mobileDrawerCategories: DrawerCategory[] = [
  { title: "DERMO-CORNER", items: [
    { label: "La Roche-Posay", href: "/boutique?q=La+Roche-Posay" },
    { label: "Vichy", href: "/boutique?q=Vichy" },
    { label: "CeraVe", href: "/boutique?q=CeraVe" },
    { label: "Bioderma", href: "/boutique?q=Bioderma" },
    { label: "SVR", href: "/boutique?q=SVR" },
    { label: "Eucerin", href: "/boutique?q=Eucerin" },
  ] },
  { title: "PROMOTIONS !", items: [
    { label: "Offres du moment", href: "/boutique?promo=1" },
    { label: "Bons plans", href: "/boutique?promo=1" },
    { label: "Dernieres promotions", href: "/boutique?promo=1" },
  ] },
  { title: "K-BEAUTY", items: [
    { label: "Nettoyants", href: "/boutique?category=K-Beauty" },
    { label: "Serums", href: "/boutique?category=K-Beauty" },
    { label: "Creme hydratante", href: "/boutique?category=K-Beauty" },
    { label: "Masques", href: "/boutique?category=K-Beauty" },
    { label: "SPF", href: "/boutique?category=K-Beauty" },
  ] },
  {
    title: "VISAGE",
    items: [
      { label: "Solaire: Protection solaire", href: "/boutique?category=Visage" },
      { label: "Solaire: Auto-bronzant", href: "/boutique?category=Visage" },
      { label: "Solaire: Soin apres-soleil", href: "/boutique?category=Visage" },
      { label: "Type: Nettoyant visage", href: "/boutique?category=Visage" },
      { label: "Type: Serum", href: "/boutique?category=Visage" },
      { label: "Type: Creme de jour", href: "/boutique?category=Visage" },
      { label: "Type: Creme de nuit", href: "/boutique?category=Visage" },
      { label: "Type: Contour des yeux", href: "/boutique?category=Visage" },
      { label: "Type: Eau micellaire", href: "/boutique?category=Visage" },
      { label: "Type: Masque visage", href: "/boutique?category=Visage" },
      { label: "Besoins: Anti-imperfections", href: "/boutique?category=Visage&q=anti-imperfections" },
      { label: "Besoins: Anti-age", href: "/boutique?category=Visage&q=anti-age" },
      { label: "Besoins: Hydratant & nourrissant", href: "/boutique?category=Visage&q=hydratant" },
      { label: "Besoins: Anti-taches", href: "/boutique?category=Visage&q=anti-taches" },
      { label: "Besoins: Anti-rougeurs", href: "/boutique?category=Visage&q=anti-rougeurs" },
      { label: "Besoins: Eclat & anti-fatigue", href: "/boutique?category=Visage&q=eclat" },
      { label: "Besoins: Peaux sensibles", href: "/boutique?category=Visage&q=sensible" },
    ]
  },
  { title: "CHEVEUX", items: [
    { label: "Shampoing", href: "/boutique?category=Cheveux" },
    { label: "Apres-shampoing", href: "/boutique?category=Cheveux" },
    { label: "Masque cheveux", href: "/boutique?category=Cheveux" },
    { label: "Soins reparateurs", href: "/boutique?category=Cheveux" },
    { label: "Huiles & serums", href: "/boutique?category=Cheveux" },
  ] },
  { title: "MAQUILLAGE", items: [
    { label: "Teint", href: "/maquillage-parfums" },
    { label: "Yeux", href: "/maquillage-parfums" },
    { label: "Levres", href: "/maquillage-parfums" },
    { label: "Demaquillant", href: "/boutique?category=Maquillage" },
    { label: "Accessoires maquillage", href: "/boutique?category=Maquillage" },
  ] },
  { title: "CORPS", items: [
    { label: "Corps & bain", href: "/boutique?category=Corps" },
    { label: "Hydratation", href: "/boutique?category=Corps" },
    { label: "Gommage", href: "/boutique?category=Corps" },
    { label: "Rasage & epilation", href: "/boutique?category=Corps" },
    { label: "Minceur", href: "/boutique?category=Corps" },
  ] },
  { title: "MAMAN & BEBE", items: [
    { label: "Bebe", href: "/boutique?category=Maman+%26+B%C3%A9b%C3%A9" },
    { label: "Maman", href: "/boutique?category=Maman+%26+B%C3%A9b%C3%A9" },
    { label: "Solaire bebe", href: "/boutique?category=Maman+%26+B%C3%A9b%C3%A9" },
    { label: "Change & toilette", href: "/boutique?category=Maman+%26+B%C3%A9b%C3%A9" },
    { label: "Accessoires", href: "/boutique?category=Maman+%26+B%C3%A9b%C3%A9" },
  ] },
  { title: "HOMMES", items: [
    { label: "Soins visage homme", href: "/boutique?category=Hommes" },
    { label: "Soins corps homme", href: "/boutique?category=Hommes" },
    { label: "Deodorants", href: "/boutique?category=Hommes" },
    { label: "Rasage", href: "/boutique?category=Hommes" },
    { label: "Barbe", href: "/boutique?category=Hommes" },
  ] },
  { title: "HYGIÈNE DENTAIRE", items: [
    { label: "Dentifrices", href: "/boutique?category=Hygi%C3%A8ne+Dentaire" },
    { label: "Brosses a dents", href: "/boutique?category=Hygi%C3%A8ne+Dentaire" },
    { label: "Bains de bouche", href: "/boutique?category=Hygi%C3%A8ne+Dentaire" },
    { label: "Blanchiment", href: "/boutique?category=Hygi%C3%A8ne+Dentaire" },
  ] },
  { title: "HYGIÈNE", items: [
    { label: "Gel hydroalcoolique", href: "/boutique?category=Hygi%C3%A8ne" },
    { label: "Deodorants", href: "/boutique?category=Hygi%C3%A8ne" },
    { label: "Soin intime", href: "/boutique?category=Hygi%C3%A8ne" },
    { label: "Protections", href: "/boutique?category=Hygi%C3%A8ne" },
  ] },
  { title: "HYGIÈNE & INTIMITÉ", items: [
    { label: "Toilette Intime", href: "/boutique?category=Hygi%C3%A8ne" },
    { label: "Serviettes Hygieniques", href: "/boutique?category=Hygi%C3%A8ne" },
    { label: "Tampons", href: "/boutique?category=Hygi%C3%A8ne" },
    { label: "Lubrifiants", href: "/boutique?category=Hygi%C3%A8ne" },
  ] },
  { title: "ACCESSOIRES", items: [
    { label: "Accessoires visage", href: "/boutique?category=Accessoires" },
    { label: "Accessoires cheveux", href: "/boutique?category=Accessoires" },
    { label: "Trousses", href: "/boutique?category=Accessoires" },
    { label: "Brosses", href: "/boutique?category=Accessoires" },
    { label: "Eponges", href: "/boutique?category=Accessoires" },
  ] },
  { title: "MINCEUR", items: [
    { label: "Brule-graisses", href: "/boutique?category=Minceur" },
    { label: "Draineurs", href: "/boutique?category=Minceur" },
    { label: "Collagene", href: "/boutique?category=Minceur" },
    { label: "Sport & recuperation", href: "/boutique?category=Minceur" },
  ] },
  { title: "SPORT", items: [
    { label: "Proteines", href: "/boutique?category=Sport" },
    { label: "Energie", href: "/boutique?category=Sport" },
    { label: "Hydratation", href: "/boutique?category=Sport" },
    { label: "Recuperation", href: "/boutique?category=Sport" },
  ] },
  { title: "SANTÉ", items: [
    { label: "Auto-Surveillance", href: "/boutique?category=Sant%C3%A9" },
    { label: "Premiers Secours", href: "/boutique?category=Sant%C3%A9" },
    { label: "Orthopedie & soutien", href: "/boutique?category=Sant%C3%A9" },
    { label: "Bien-etre", href: "/boutique?category=Bien-%C3%AAtre" },
  ] },
  { title: "COMPLEMENTS ALIMENTAIRES", items: [
    { label: "Vitamines & Mineraux", href: "/boutique?category=Compl%C3%A9ments" },
    { label: "Collagene", href: "/boutique?category=Compl%C3%A9ments" },
    { label: "Omega 3", href: "/boutique?category=Compl%C3%A9ments" },
    { label: "Detox & Drainage", href: "/boutique?category=Compl%C3%A9ments" },
  ] },
  { title: "PREMIUM HAIR CARE", items: [
    { label: "Shampoing premium", href: "/boutique?category=Cheveux" },
    { label: "Masque premium", href: "/boutique?category=Cheveux" },
    { label: "Huiles & serums", href: "/boutique?category=Cheveux" },
    { label: "Anti-chute", href: "/boutique?category=Cheveux" },
  ] },
  { title: "PREOCCUPATIONS", items: [
    { label: "Acne & Imperfections", href: "/boutique?q=acne+imperfections" },
    { label: "Cernes", href: "/boutique?q=cernes" },
    { label: "Taches", href: "/boutique?q=taches" },
    { label: "Rosacee & Rougeurs", href: "/boutique?q=rougeurs" },
    { label: "Peau seche", href: "/boutique?q=peau+seche" },
    { label: "Anti-age", href: "/boutique?q=anti-age" },
    { label: "Chute de cheveux", href: "/boutique?q=chute+cheveux" },
    { label: "Immunite", href: "/boutique?q=immunite" },
  ] },
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

const mobileQuickCategories: Array<{ label: string; Icon: ComponentType<{ size?: number; className?: string }>; href?: string; openKey?: string }> = [
  { label: 'PROMOTIONS', Icon: Tag, href: '/promotions' },
  { label: 'COMPLÉMENTS\nALIMENTAIRES', Icon: Sprout, href: '/boutique?category=Compl%C3%A9ments' },
  { label: 'KOREAN\nBEAUTY', Icon: Sparkles, href: '/korean-beauty/' },
  { label: 'PARFUMS\n& MAQUILLAGE', Icon: Brush, href: '/maquillage-parfums' },
];

interface HeaderProps {
  onCartOpen: () => void;
  cartCount?: number;
  cartBumpKey?: number;
}

export function Header({ onCartOpen, cartCount = 0, cartBumpKey }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileCategory, setOpenMobileCategory] = useState<string | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuCloseButtonRef = useRef<HTMLButtonElement>(null);
  const restoreMenuFocusRef = useRef<HTMLElement | null>(null);
  const restoreSearchFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!cartBumpKey) return;
    setCartBump(true);
    const t = window.setTimeout(() => setCartBump(false), 420);
    return () => window.clearTimeout(t);
  }, [cartBumpKey]);

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
    const items: DrawerItem[] = fromDrawer?.items ?? [];

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
                  <Link
                    key={item.label}
                    href={item.href}
                    className="mobile-submenu-item"
                    onClick={() => closeMobileMenu()}
                  >
                    {item.label}
                  </Link>
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
              <div className={`cart-icon-wrapper ${cartBump ? 'bump' : ''}`}>
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
            {mobileQuickCategories.map(({ label, Icon, openKey, href }) => (
              href ? (
                <Link
                  key={label}
                  href={href}
                  className="mobile-category"
                  aria-label={label.replace(/\s*\n\s*/g, ' ')}
                >
                  <Icon size={22} className="mobile-category-icon" />
                  <span className="mobile-category-label">{label}</span>
                </Link>
              ) : (
                <button
                  key={label}
                  type="button"
                  className="mobile-category"
                  onClick={() => {
                    if (openKey) openDrawerWithCategory(openKey);
                  }}
                  aria-label={label.replace(/\s*\n\s*/g, ' ')}
                >
                  <Icon size={22} className="mobile-category-icon" />
                  <span className="mobile-category-label">{label}</span>
                </button>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-bar">
        <div className="container">
          <ul className="flex items-center gap-xs main-nav-list">
            {desktopMenuCategories.map((category, index) => {
              // Map each desktop category title to a proper boutique filter
              const desktopCatHrefMap: Record<string, string> = {
                'CORPS': '/boutique?category=Corps',
                'VISAGE': '/boutique?category=Visage',
                'CHEVEUX': '/boutique?category=Cheveux',
                'HYGIÈNE DENTAIRE': '/boutique?category=Hygi%C3%A8ne+Dentaire',
                'MAQUILLAGE': '/maquillage-parfums',
                'HYGIÈNE & INTIMITÉ': '/boutique?category=Hygi%C3%A8ne',
                'SANTÉ': '/boutique?category=Sant%C3%A9',
                'HOMMES': '/boutique?category=Hommes',
                'COMPLEMENTS ALIMENTAIRES': '/boutique?category=Compl%C3%A9ments',
                'PREOCCUPATIONS': '/boutique',
              };
              const parentHref = desktopCatHrefMap[category.title] || '/boutique';
              return (
              <li key={index} className="nav-item">
                <Link
                  href={parentHref}
                  className="nav-link flex items-center gap-xs"
                >
                  {category.title} <ChevronDown size={14} className="dropdown-icon" />
                </Link>
                <div className="dropdown-menu">
                  <ul>
                    {category.items.map((item, idx) => {
                      let itemHref = parentHref;
                      if (category.title === 'PREOCCUPATIONS') {
                        itemHref = `/boutique?q=${encodeURIComponent(item)}`;
                      } else if (category.title === 'MAQUILLAGE') {
                        if (['Teint', 'Yeux', 'Lèvres'].includes(item)) {
                          itemHref = '/maquillage-parfums';
                        } else {
                          itemHref = `/boutique?category=Maquillage`;
                        }
                      }
                      return (
                      <li key={idx}>
                        <Link href={itemHref} className="dropdown-item">
                          {item}
                        </Link>
                      </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
              );
            })}
            <li>
              <Link
                href="/promotions"
                className="nav-link nav-link-promos flex items-center gap-xs"
              >
                <Tag size={14} className="promos-icon" /> PROMOS
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
