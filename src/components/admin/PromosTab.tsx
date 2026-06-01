import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Power, PowerOff, TicketPercent } from 'lucide-react';
import { api, Promo, delay } from './mockData';
import { PromoFormModal } from './PromoFormModal';
import { Toast, ToastType, ConfirmModal } from './shared';

const isExpired = (expiresAt: string) => new Date(expiresAt).getTime() < Date.now();

export function PromosTab() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Toasts
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const loadPromos = async () => {
    setLoading(true);
    try {
      const data = await api.getPromos();
      setPromos(data);
    } catch {
      setToast({ message: 'Erreur de chargement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleSavePromo = (promo: Promo) => {
    const existing = promos.find(p => p.id === promo.id);
    if (existing) {
      setPromos(prev => prev.map(p => (p.id === promo.id ? promo : p)));
      setToast({ message: 'Promotion mise à jour', type: 'success' });
    } else {
      setPromos(prev => [...prev, promo]);
      setToast({ message: 'Promotion créée', type: 'success' });
    }
  };

  const toggleStatus = async (id: string) => {
    setPromos(prev => prev.map(p => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
    const promo = promos.find(p => p.id === id);
    setToast({ message: `Promotion ${!promo?.isActive ? 'activée' : 'désactivée'}`, type: 'info' });
    await delay(300);
  };

  const handleDeletePromo = async () => {
    if (!deleteTargetId) return;
    setPromos(prev => prev.filter(p => p.id !== deleteTargetId));
    setToast({ message: 'Promotion supprimée', type: 'success' });
    setDeleteTargetId(null);
  };

  return (
    <div className="admin-promos-tab">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PromoFormModal
        promo={selectedPromo}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePromo}
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Supprimer la promotion"
        message="Êtes-vous sûr de vouloir supprimer ce code promo ? Cette action est irréversible."
        confirmLabel="Supprimer"
        isDestructive={true}
        onConfirm={handleDeletePromo}
        onCancel={() => setDeleteTargetId(null)}
      />

      <div className="admin-dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Promotions & Coupons</h2>
          <p className="admin-subtitle">Gérez vos codes de réduction</p>
        </div>
        <button
          className="admin-btn-primary"
          onClick={() => { setSelectedPromo(null); setIsModalOpen(true); }}
        >
          <Plus size={18} /> Nouveau coupon
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code Promo</th>
                <th>Type</th>
                <th>Expiration</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center" style={{ padding: '2rem' }}>Chargement...</td></tr>
              ) : promos.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted" style={{ padding: '2rem' }}>Aucune promotion</td></tr>
              ) : (
                promos.map(promo => {
                  const expired = isExpired(promo.expiresAt);
                  const typeLabel =
                    promo.type === 'CLIENT' ? 'Client' :
                    promo.type === 'WHOLESALE' ? 'Grossiste' :
                    promo.type === 'percentage' ? 'Pourcentage' :
                    promo.type === 'fixed' ? 'Montant fixe' : promo.type;
                  return (
                    <tr key={promo.id} className={!promo.isActive || expired ? 'opacity-60 hover-bg' : 'hover-bg'}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <TicketPercent size={18} className="text-muted" />
                          <code style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '4px',
                            fontWeight: 600,
                            letterSpacing: '1px'
                          }}>
                            {promo.code}
                          </code>
                        </div>
                      </td>
                      <td>
                        <span className="admin-badge badge-info" style={{ textTransform: 'none' }}>{typeLabel}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{new Date(promo.expiresAt).toLocaleDateString('fr-FR')}</span>
                          <span className="text-muted text-xs">{new Date(promo.expiresAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td>
                        {expired ? (
                          <span className="admin-badge badge-error">Expiré</span>
                        ) : promo.isActive ? (
                          <span className="admin-badge badge-success">Actif</span>
                        ) : (
                          <span className="admin-badge badge-neutral">Inactif</span>
                        )}
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            className={`action-btn ${promo.isActive ? 'text-success' : 'text-muted'}`}
                            title={promo.isActive ? 'Désactiver' : 'Activer'}
                            onClick={() => toggleStatus(promo.id)}
                            disabled={expired}
                          >
                            {promo.isActive ? <Power size={18} /> : <PowerOff size={18} />}
                          </button>
                          <button
                            className="action-btn"
                            title="Éditer"
                            onClick={() => { setSelectedPromo(promo); setIsModalOpen(true); }}
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            className="action-btn text-danger"
                            title="Supprimer"
                            onClick={() => setDeleteTargetId(promo.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
