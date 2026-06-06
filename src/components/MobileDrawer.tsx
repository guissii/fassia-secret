import Link from 'next/link';
import { ChevronDown, Headphones, Leaf, Lock, ShoppingCart, Truck, X } from 'lucide-react';
import { publicAssetUrl } from '../lib/publicUrl';
import { mobileMenuItems, type DrawerItem } from '../data/menuData';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCartOpen: () => void;
  cartCount: number;
  openCategory: string | null;
  setOpenCategory: React.Dispatch<React.SetStateAction<string | null>>;
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>;
  drawerCategories?: { title: string; items: DrawerItem[] }[];
}

export function MobileDrawer({
  isOpen,
  onClose,
  onCartOpen,
  cartCount,
  openCategory,
  setOpenCategory,
  closeButtonRef,
  drawerCategories = [],
}: MobileDrawerProps) {
  const mobileMenuCategories = mobileMenuItems.map(({ label, Icon }) => {
    const fromDrawer = drawerCategories.find((c) => c.title === label);
    const items: DrawerItem[] = fromDrawer?.items ?? [];

    return { label, Icon, items };
  });

  return (
    <aside
      id="mobile-menu"
      className={`mobile-menu-drawer ${isOpen ? 'open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div className="mobile-menu-header">
        <button
          className="mobile-menu-icon-btn"
          onClick={onClose}
          aria-label="Fermer le menu"
          ref={closeButtonRef as React.RefObject<HTMLButtonElement>}
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
              onClick={() => setOpenCategory((v) => (v === label ? null : label))}
              aria-expanded={openCategory === label}
            >
              <span className="mobile-menu-link-left">
                <Icon size={20} className="mobile-menu-link-icon" />
                <span className="mobile-menu-link-label">{label}</span>
              </span>
              <ChevronDown size={18} className={`mobile-menu-link-chevron ${openCategory === label ? 'open' : ''}`} />
            </button>

            <div className={`mobile-submenu ${openCategory === label ? 'open' : ''}`}>
              {items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="mobile-submenu-item"
                  onClick={() => onClose()}
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
  );
}
