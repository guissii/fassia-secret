import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Promo } from './mockData';

interface Props {
  promo: Promo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (promo: Promo) => void;
}

export function PromoFormModal({ promo, isOpen, onClose, onSave }: Props) {
  const [code, setCode] = useState('');
  const [type, setType] = useState<'fixed' | 'percentage'>('percentage');
  const [value, setValue] = useState(0);
  const [expiresAt, setExpiresAt] = useState('');
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (promo) {
      setCode(promo.code);
      setType(promo.type);
      setValue(promo.value);
      setExpiresAt(promo.expiresAt.slice(0, 16));
      setUsageLimit(promo.usageLimit ?? '');
    } else {
      setCode(''); setType('percentage'); setValue(10);
      const d = new Date(); d.setDate(d.getDate() + 30);
      setExpiresAt(d.toISOString().slice(0, 16)); setUsageLimit('');
    }
  }, [isOpen, promo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || value <= 0) return;
    setLoading(true);
    setTimeout(() => {
      onSave({
        id: promo?.id || `pro_${Date.now()}`,
        code: code.trim().toUpperCase(),
        type, value,
        expiresAt: new Date(expiresAt).toISOString(),
        usageLimit: usageLimit === '' ? null : Number(usageLimit),
        usageCount: promo?.usageCount || 0,
        isActive: promo?.isActive ?? true,
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
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Type</label>
                <select className="admin-select" value={type} onChange={e => setType(e.target.value as 'fixed' | 'percentage')} style={{ width: '100%' }}>
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (MAD)</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Valeur *</label>
                <input type="number" className="admin-input" value={value} onChange={e => setValue(Number(e.target.value))} min={1} max={type === 'percentage' ? 100 : 99999} required />
              </div>
            </div>
            <div className="form-group">
              <label>Date d'expiration</label>
              <input type="datetime-local" className="admin-input" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Limite d'utilisation</label>
              <input type="number" className="admin-input" value={usageLimit} onChange={e => setUsageLimit(e.target.value === '' ? '' : Number(e.target.value))} min={0} placeholder="Illimité" />
              <span className="text-muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>Vide = illimité</span>
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
