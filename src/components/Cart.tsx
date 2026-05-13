import { useEffect, useRef } from 'react';
import { X, Minus, Plus, ShoppingBag, Leaf, ArrowRight, Trash2, ShieldCheck, Truck } from 'lucide-react';
import { publicAssetUrl } from '../lib/publicUrl';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
}

const SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 39;

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }: CartProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isFreeShipping = subtotal >= SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const progressPct = Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isOpen) {
      restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      requestAnimationFrame(() => closeButtonRef.current?.focus());
      return;
    }

    const toRestore = restoreFocusRef.current;
    restoreFocusRef.current = null;
    if (toRestore) requestAnimationFrame(() => toRestore.focus());
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-backdrop ${isOpen ? 'cart-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className={`cart-drawer ${isOpen ? 'cart-drawer--open' : ''}`} role="dialog" aria-modal="true" aria-label="Votre panier">

        {/* ── Header ── */}
        <div className="cart-header">
          <div className="cart-header-left">
            <ShoppingBag size={20} className="cart-header-icon" strokeWidth={1.5} />
            <span className="cart-header-title">MON PANIER</span>
            {totalItems > 0 && (
              <span className="cart-header-count">{totalItems}</span>
            )}
          </div>
          <button
            className="cart-close-btn"
            onClick={onClose}
            aria-label="Fermer le panier"
            type="button"
            ref={closeButtonRef}
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* ── Ornament ── */}
        <div className="cart-ornament">
          <span className="cart-ornament-line" />
          <Leaf size={14} strokeWidth={1.5} className="cart-ornament-icon" />
          <span className="cart-ornament-line" />
        </div>

        {/* ── Free Shipping Banner ── */}
        {items.length > 0 && (
          <div className="cart-shipping-banner">
            <div className="cart-shipping-text">
              {isFreeShipping ? (
                <span className="cart-shipping-achieved">
                  <Truck size={14} /> Livraison offerte ! Félicitations 🎉
                </span>
              ) : (
                <span>
                  Plus que <strong>{(SHIPPING_THRESHOLD - subtotal).toFixed(2)} MAD</strong> pour la livraison gratuite
                </span>
              )}
            </div>
            <div className="cart-shipping-progress-track">
              <div className="cart-shipping-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}

        {/* ── Items List ── */}
        <div className="cart-items-list">
          {items.length === 0 ? (
            <EmptyCartState />
          ) : (
            items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveItem}
              />
            ))
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)} MAD</span>
              </div>
              <div className="cart-summary-row">
                <span>Livraison</span>
                <span className={isFreeShipping ? 'cart-free-shipping-label' : ''}>
                  {isFreeShipping ? 'GRATUITE' : `${SHIPPING_COST.toFixed(2)} MAD`}
                </span>
              </div>
              <div className="cart-summary-divider" />
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span>{total.toFixed(2)} MAD</span>
              </div>
            </div>

            <button className="cart-checkout-btn" type="button">
              PASSER LA COMMANDE <ArrowRight size={16} />
            </button>

            <button className="cart-continue-btn" onClick={onClose} type="button">
              Continuer mes achats
            </button>

            <div className="cart-trust-row">
              <ShieldCheck size={14} strokeWidth={1.5} />
              <span>Paiement 100% sécurisé — Livraison rapide</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

/* ────────────────────────────────────────────
   Sub-components
   ──────────────────────────────────────────── */

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="cart-item">
      <div className="cart-item-image-wrap">
        <img src={publicAssetUrl(item.image)} alt={item.name} className="cart-item-image" />
      </div>

      <div className="cart-item-details">
        <span className="cart-item-category">{item.category}</span>
        <h4 className="cart-item-name">{item.name}</h4>

        <div className="cart-item-bottom">
          {/* Quantity Stepper */}
          <div className="cart-qty-stepper">
            <button
              className="cart-qty-btn"
              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
              aria-label="Diminuer la quantité"
              type="button"
            >
              <Minus size={12} />
            </button>
            <span className="cart-qty-value">{item.quantity}</span>
            <button
              className="cart-qty-btn"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              aria-label="Augmenter la quantité"
              type="button"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Price */}
          <div className="cart-item-prices">
            <span className="cart-item-price">{(item.price * item.quantity).toFixed(2)} MAD</span>
            {item.oldPrice && (
              <span className="cart-item-old-price">{(item.oldPrice * item.quantity).toFixed(2)} MAD</span>
            )}
          </div>

          {/* Remove */}
          <button
            className="cart-remove-btn"
            onClick={() => onRemove(item.id)}
            aria-label="Supprimer l'article"
            type="button"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyCartState() {
  return (
    <div className="cart-empty">
      <div className="cart-empty-icon-ring">
        <ShoppingBag size={32} strokeWidth={1} />
      </div>
      <h3 className="cart-empty-title">Votre panier est vide</h3>
      <p className="cart-empty-subtitle">
        Découvrez nos soins et produits de beauté premium pour commencer vos achats.
      </p>
      <div className="cart-empty-ornament">
        <span className="cart-ornament-line" />
        <Leaf size={12} strokeWidth={1.5} />
        <span className="cart-ornament-line" />
      </div>
    </div>
  );
}
