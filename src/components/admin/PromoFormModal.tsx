import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Promo } from './mockData';

interface Props {
  promo: Promo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (promo: Promo) => void;
}

const TYPE_LABELS: Record<string, string> = {
  CLIENT: 'Client (prix promo)',
  WHOLESALE: 'Grossiste (prix de gros)',
};

export function PromoFormModal({ promo, isOpen, onClose, onSave }: Props) {
  const [code, setCode] = useState('');
  const [type, setType] = useState<'CLIENT' | 'WHOLESALE'>('CLIENT');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (promo) {
      setCode(promo.code);
      setType(promo.type === 'CLIENT' || promo.type === 'WHOLESALE' ? promo.type : 'CLIENT');
      setExpiresAt(promo.expiresAt.slice(0, 16));
      setIsActive(promo.isActive);
    } else {
      setCode(''); setType('CLIENT');
      const d = new Date(); d.setDate(d.getDate() + 30);
      setExpiresAt(d.toISOString().slice(0, 16)); setIsActive(true);
    }
  }, [isOpen, promo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setTimeout(() => {
      onSave({
        id: promo?.id || `pro_${Date.now()}`,
        code: code.trim().toUpperCase(),
        type,
        value: 0,
        expiresAt: new Date(expiresAt).toISOString(),
        usageLimit: null,
        usageCount: promo?.usageCount || 0,
        isActive,
      });
      setLoading(false); onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3>{promo ? 'Éditer le coupon' : 'Nouveau coupon'}</h3>
          <button className="admin-mobile-close" onClick={onClose} style={{ display: 'block' }}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-col" style={{ gap: '1.25rem' }}>
            <div className="form-group">
              <label>Code promo *</label>
              <input type="text" className="admin-input" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="WELCOME10" style={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }} required />
            </div>
            <div className="form-group">
              <label>Type de code</label>
              <select className="admin-select" value={type} onChange={e => setType(e.target.value as 'CLIENT' | 'WHOLESALE')} style={{ width: '100%' }}>
                <option value="CLIENT">Client — affiche le prix promo du produit</option>
                <option value="WHOLESALE">Grossiste — affiche le prix de gros du produit</option>
              </select>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
                {type === 'CLIENT'
                  ? 'Le client verra le « Prix promo » défini sur chaque produit.'
                  : 'Le grossiste verra le « Prix grossiste » (< 10 produits) ou « Prix bulk » (≥ 10 produits).'}
              </p>
            </div>
            <div className="form-group">
              <label>Date d'expiration</label>
              <input type="datetime-local" className="admin-input" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                id="promo-active"
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <label htmlFor="promo-active" style={{ margin: 0, cursor: 'pointer', fontWeight: 500 }}>
                Code promo actif
              </label>
            </div>
          </div>
          <div className="admin-modal-actions">
            <button type="button" className="admin-btn-outline" onClick={onClose} disabled={loading}>Annuler</button>
            <button type="submit" className="admin-btn-primary" disabled={loading}>{loading ? 'Enregistrement...' : (promo ? 'Mettre à jour' : 'Créer')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
