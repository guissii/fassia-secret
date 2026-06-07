import { useEffect, useRef, useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Leaf, ArrowRight, Trash2, ShieldCheck, Truck, CheckCircle2, Loader2, Tag, MessageCircle } from 'lucide-react';
import { publicAssetUrl } from '../lib/publicUrl';
import { useCart } from './CartContext';
import { useSiteConfig } from './SiteConfigContext';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  promoPrice?: number;
  wholesalePrice?: number;
  bulkWholesalePrice?: number;
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

function getEffectivePrice(
  item: CartItem,
  promo: import('./CartContext').ActivePromo | null,
  totalItems: number
): number {
  if (!promo) return item.price;

  // CLIENT promo: show the product's promoPrice
  if (promo.type === 'CLIENT') {
    return typeof item.promoPrice === 'number' && item.promoPrice > 0
      ? item.promoPrice
      : item.price;
  }

  // WHOLESALE promo: show wholesalePrice (< 10 items) or bulkWholesalePrice (>= 10 items)
  if (promo.type === 'WHOLESALE') {
    if (totalItems >= 10) {
      return typeof item.bulkWholesalePrice === 'number' && item.bulkWholesalePrice > 0
        ? item.bulkWholesalePrice
        : item.price;
    }
    return typeof item.wholesalePrice === 'number' && item.wholesalePrice > 0
      ? item.wholesalePrice
      : item.price;
  }

  // Legacy: FIXED / PERCENTAGE
  if (promo.type === 'PERCENTAGE') {
    return Math.max(0, item.price * (1 - promo.value / 100));
  }
  return Math.max(0, item.price - promo.value);
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }: CartProps) {
  const { deliveryFee, freeDeliveryThreshold } = useSiteConfig();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const waLinkRef = useRef<HTMLAnchorElement | null>(null);

  const [checkoutMode, setCheckoutMode] = useState(false);
  const [formData, setFormData] = useState({ customerName: '', phone: '', city: '', address: '', notes: '' });
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const { clearCart, activePromo, setActivePromo } = useCart();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate totals using effective prices
  const lineItems = items.map(item => ({
    ...item,
    effectivePrice: getEffectivePrice(item, activePromo, totalItems),
  }));

  const subtotal = lineItems.reduce((sum, item) => sum + item.effectivePrice * item.quantity, 0);
  const originalSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = originalSubtotal - subtotal;
  const isFreeShipping = subtotal >= freeDeliveryThreshold;
  const shipping = isFreeShipping ? 0 : deliveryFee;
  const total = subtotal + shipping;
  const progressPct = Math.min((subtotal / freeDeliveryThreshold) * 100, 100);

  // Reset states when cart opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (orderSuccess) {
        setOrderSuccess(false);
        setCheckoutMode(false);
      }
    } else {
      document.body.style.overflow = '';
      setTimeout(() => {
        if (!orderSuccess) setCheckoutMode(false);
      }, 300);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, orderSuccess]);

  const handleApplyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) {
        setActivePromo(data.promo);
      } else {
        setActivePromo(null);
        setPromoError(data.error || 'Code promo invalide');
      }
    } catch {
      setPromoError('Erreur réseau, réessayez');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Construire le message WhatsApp et ouvrir IMMÉDIATEMENT (avant tout await)
    //    pour éviter le blocage popup sur mobile
    const number = "212774656745";
    let message = `🌸🫰 *Nouvelle commande Fassia Secret* 🫰🌸\n\n`;
    message += `👤 *Nom:* ${formData.customerName}\n`;
    message += `📞 *Téléphone:* ${formData.phone}\n`;
    message += `📍 *Ville:* ${formData.city}\n`;
    message += `🏠 *Adresse:* ${formData.address}\n`;
    if (formData.notes) message += `📝 *Notes:* ${formData.notes}\n`;
    message += `\n`;
    message += `📦 *Produits:*\n`;
    items.forEach(item => {
      const effectivePrice = getEffectivePrice(item, activePromo, totalItems);
      message += `  • ${item.quantity}x ${item.name} (${(effectivePrice * item.quantity).toFixed(2)} MAD)\n`;
    });
    message += `\n`;
    if (activePromo) {
      if (activePromo.type === 'CLIENT') {
        message += `🏷️ *Code Promo Client:* ${activePromo.code}\n`;
        message += `💰 *Prix standard:* ${originalSubtotal.toFixed(2)} MAD\n`;
        message += `✅ *Prix promo:* ${subtotal.toFixed(2)} MAD\n`;
      } else if (activePromo.type === 'WHOLESALE') {
        message += `🏷️ *Code Promo Grossiste:* ${activePromo.code}\n`;
        message += `💰 *Prix standard:* ${originalSubtotal.toFixed(2)} MAD\n`;
        message += `✅ *Prix grossiste:* ${subtotal.toFixed(2)} MAD\n`;
      } else {
        message += `🏷️ *Code Promo:* ${activePromo.code}\n`;
        message += `💰 *Remise:* -${discountAmount.toFixed(2)} MAD\n`;
      }
    }
    message += `🚚 *Livraison:* ${isFreeShipping ? 'GRATUITE' : deliveryFee.toFixed(2) + ' MAD'}\n`;
    message += `💳 *Total:* ${total.toFixed(2)} MAD\n\n`;
    message += `🫰 Merci de confirmer la disponibilité 🌸`;

    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    // Ouvrir WhatsApp via un <a> caché : plus rapide et jamais bloqué par les navigateurs
    if (waLinkRef.current) {
      waLinkRef.current.href = url;
      waLinkRef.current.click();
    } else {
      window.open(url, '_blank');
    }

    // 2. Sauvegarder la commande dans le backend (en arrière-plan)
    try {
      const payload = {
        customerName: formData.customerName,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        notes: formData.notes,
        items: items.map(i => ({
          productId: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          image: i.image
        })),
        total: total
      };

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('Erreur sauvegarde commande:', err);
    }

    // 3. Afficher le succès et vider le panier
    setOrderSuccess(true);
    clearCart();
    setIsSubmitting(false);
  };

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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <>
      {/* Lien caché pour ouvrir WhatsApp rapidement sans window.open() */}
      <a ref={waLinkRef} target="_blank" rel="noopener noreferrer" style={{ display: 'none' }} aria-hidden="true" />
      <div className={`cart-backdrop ${isOpen ? 'cart-backdrop--visible' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`cart-drawer ${isOpen ? 'cart-drawer--open' : ''}`} role="dialog" aria-modal="true">
        <div className="cart-header">
          <div className="cart-header-left">
            <ShoppingBag size={20} className="cart-header-icon" strokeWidth={1.5} />
            <span className="cart-header-title">{checkoutMode && !orderSuccess ? 'PAIEMENT' : 'MON PANIER'}</span>
            {totalItems > 0 && !orderSuccess && (
              <span className="cart-header-count">{totalItems}</span>
            )}
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Fermer le panier" type="button" ref={closeButtonRef}>
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        <div className="cart-ornament">
          <span className="cart-ornament-line" />
          <Leaf size={14} strokeWidth={1.5} className="cart-ornament-icon" />
          <span className="cart-ornament-line" />
        </div>

        {orderSuccess ? (
          <div className="cart-success-state" style={{ padding: '40px 20px', textAlign: 'center', flex: 1 }}>
            <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Commande confirmée !</h3>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '30px' }}>
              Merci pour votre confiance. Notre équipe vous contactera très vite pour confirmer la livraison.
            </p>
            <button className="cart-continue-btn" onClick={onClose} style={{ width: '100%', padding: '15px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Fermer
            </button>
          </div>
        ) : checkoutMode ? (
          <div className="cart-checkout-form-container" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            <button type="button" onClick={() => setCheckoutMode(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
              ← Retour au panier
            </button>
            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>Nom & Prénom</label>
                  <input type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>Téléphone *</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="06..." style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>Ville *</label>
                  <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>Adresse *</label>
                  <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Rue, quartier..." style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem' }} />
                </div>
              </div>

              {/* Code Promo */}
              <div style={{ marginTop: '4px' }}>
                {activePromo ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Tag size={14} color="#10b981" />
                      <span style={{ fontWeight: 600, color: '#10b981', fontSize: '0.8rem' }}>{activePromo.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setActivePromo(null); setPromoCode(''); }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="Code promo"
                      value={promoCode}
                      onChange={e => { setPromoCode(e.target.value); setPromoError(''); }}
                      disabled={promoLoading}
                      style={{ flex: 1, padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.8rem' }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={promoLoading}
                      style={{ padding: '0 12px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 500, fontSize: '0.75rem', cursor: 'pointer', opacity: promoLoading ? 0.6 : 1 }}
                    >
                      {promoLoading ? '...' : 'OK'}
                    </button>
                  </div>
                )}
                {promoError && (
                  <p style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '4px', marginBottom: 0 }}>{promoError}</p>
                )}
              </div>
              
              <div style={{ marginTop: '4px', padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem' }}>Total</span>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{total.toFixed(2)} MAD</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', textAlign: 'center', marginTop: '2px' }}>
                  Paiement à la livraison
                </div>
              </div>
              
              <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '0.6rem', background: '#25D366', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? <Loader2 size={14} className="animate-spin" style={{ margin: '0 auto' }} /> : <><MessageCircle size={16} /> COMMANDER VIA WHATSAPP</>}
              </button>
            </form>
          </div>
        ) : (
          <>
            {items.length > 0 && (
              <div className="cart-shipping-banner">
                <div className="cart-shipping-text">
                  {isFreeShipping ? (
                    <span className="cart-shipping-achieved">
                      <Truck size={14} /> Livraison offerte ! Félicitations 🎉
                    </span>
                  ) : (
                    <span>
                      Plus que <strong>{Math.max(0, freeDeliveryThreshold - subtotal).toFixed(2)} MAD</strong> pour la livraison gratuite
                    </span>
                  )}
                </div>
                <div className="cart-shipping-progress-track">
                  <div className="cart-shipping-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}

            <div className="cart-items-list">
              {lineItems.length === 0 ? <EmptyCartState /> : lineItems.map(item => (
                <CartItemRow key={item.id} item={item} onUpdateQuantity={onUpdateQuantity} onRemove={onRemoveItem} />
              ))}
            </div>

            {items.length > 0 && (
              <div className="cart-footer">
                
                <div className="cart-summary">
                  {activePromo && (activePromo.type === 'CLIENT' || activePromo.type === 'WHOLESALE') ? (
                    <>
                      <div className="cart-summary-row">
                        <span>Prix standard</span>
                        <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>{originalSubtotal.toFixed(2)} MAD</span>
                      </div>
                      <div className="cart-summary-row">
                        <span style={{ color: '#10b981', fontWeight: 600 }}>
                          {activePromo.type === 'CLIENT' ? 'Prix Promo' : 'Prix Grossiste'} ({activePromo.code})
                        </span>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>{subtotal.toFixed(2)} MAD</span>
                      </div>
                    </>
                  ) : (
                    <div className="cart-summary-row">
                      <span>Sous-total</span>
                      <span>{subtotal.toFixed(2)} MAD</span>
                    </div>
                  )}
                  {activePromo && activePromo.type !== 'CLIENT' && activePromo.type !== 'WHOLESALE' && discountAmount > 0 && (
                    <div className="cart-summary-row" style={{ color: '#10b981' }}>
                      <span>Remise Promo ({activePromo.code})</span>
                      <span>-{discountAmount.toFixed(2)} MAD</span>
                    </div>
                  )}
                  <div className="cart-summary-row">
                    <span>Livraison</span>
                    <span className={isFreeShipping ? 'cart-free-shipping-label' : ''}>
                      {isFreeShipping ? 'GRATUITE' : `${deliveryFee.toFixed(2)} MAD`}
                    </span>
                  </div>
                  <div className="cart-summary-divider" />
                  <div className="cart-summary-row cart-summary-total">
                    <span>Total</span>
                    <span>{total.toFixed(2)} MAD</span>
                  </div>
                </div>

                <button className="cart-checkout-btn" type="button" onClick={() => setCheckoutMode(true)}>
                  VALIDER MON PANIER <ArrowRight size={16} />
                </button>

                <button className="cart-continue-btn" onClick={onClose} type="button">
                  Continuer mes achats
                </button>

              </div>
            )}
          </>
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
            <span className="cart-item-price">{(((item as any).effectivePrice ?? item.price) * item.quantity).toFixed(2)} MAD</span>
            {(item as any).effectivePrice && (item as any).effectivePrice !== item.price && (
              <span className="cart-item-old-price">{(item.price * item.quantity).toFixed(2)} MAD</span>
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
