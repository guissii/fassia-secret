import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Store, X, Save } from 'lucide-react';
import { api } from './mockData';
import { Toast, ToastType } from './shared';

interface OfficialShop {
  id: number;
  category: string;
  name: string;
  order: number;
}

const CATEGORIES = [
  { key: 'kbeauty', label: 'Korean Beauty' },
  { key: 'complements', label: 'Compléments Alimentaires' },
  { key: 'maquillage', label: 'Maquillage & Parfums' },
];

export function OfficialShopsTab() {
  const [shops, setShops] = useState<OfficialShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('kbeauty');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');

  const loadShops = async () => {
    setLoading(true);
    try {
      const res = await api.fetchWithAuth('/official-shops');
      setShops(res.shops || []);
    } catch {
      setToast({ message: 'Erreur de chargement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const filteredShops = shops.filter(s => s.category === activeCategory).sort((a, b) => a.order - b.order);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await api.fetchWithAuth('/official-shops', {
        method: 'POST',
        body: JSON.stringify({ category: activeCategory, name: newName.trim(), order: filteredShops.length }),
      });
      setNewName('');
      setToast({ message: 'Marque ajoutée', type: 'success' });
      await loadShops();
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur', type: 'error' });
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    try {
      await api.fetchWithAuth(`/official-shops/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ category: activeCategory, name: editName.trim(), order: 0 }),
      });
      setEditingId(null);
      setEditName('');
      setToast({ message: 'Marque mise à jour', type: 'success' });
      await loadShops();
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette marque ?')) return;
    try {
      await api.fetchWithAuth(`/official-shops/${id}`, { method: 'DELETE' });
      setToast({ message: 'Marque supprimée', type: 'success' });
      await loadShops();
    } catch {
      setToast({ message: 'Erreur lors de la suppression', type: 'error' });
    }
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <h2><Store size={20} /> Boutiques Officielles</h2>
        <p className="text-muted text-sm">Gérez les marques affichées dans la section "Boutiques Officielles" de la page d'accueil.</p>
      </div>

      {/* Category tabs */}
      <div className="admin-tabs-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.5rem' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`admin-tab-btn ${activeCategory === cat.key ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.key)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              background: activeCategory === cat.key ? '#e10074' : 'transparent',
              color: activeCategory === cat.key ? '#fff' : '#666',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: 0,
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Add new */}
      <div className="admin-form-row" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input
          type="text"
          className="admin-input"
          placeholder={`Nouvelle marque ${CATEGORIES.find(c => c.key === activeCategory)?.label}...`}
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          style={{ flex: 1 }}
        />
        <button className="admin-btn-primary" onClick={handleAdd} style={{ borderRadius: 0 }}>
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="admin-loading">Chargement...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Marque</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.length === 0 ? (
                <tr style={{ background: 'transparent' }}>
                  <td colSpan={2} className="text-center text-muted">Aucune marque dans cette catégorie</td>
                </tr>
              ) : (
                filteredShops.map(shop => (
                  <tr key={shop.id} style={{ background: 'transparent' }}>
                    <td>
                      {editingId === shop.id ? (
                        <input
                          type="text"
                          className="admin-input"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleUpdate(shop.id)}
                          autoFocus
                        />
                      ) : (
                        <span style={{ fontWeight: 500 }}>{shop.name}</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {editingId === shop.id ? (
                        <>
                          <button className="admin-icon-btn" onClick={() => handleUpdate(shop.id)} title="Enregistrer" style={{ borderRadius: '4px', background: '#e10074', color: '#fff', border: 'none', padding: '4px 8px', marginRight: '4px' }}>
                            <Save size={16} color="#fff" />
                          </button>
                          <button className="admin-icon-btn" onClick={() => { setEditingId(null); setEditName(''); }} title="Annuler" style={{ borderRadius: '4px', background: '#374151', color: '#fff', border: 'none', padding: '4px 8px' }}>
                            <X size={16} color="#fff" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="admin-icon-btn" onClick={() => { setEditingId(shop.id); setEditName(shop.name); }} title="Modifier" style={{ borderRadius: '4px', background: '#e10074', color: '#fff', border: 'none', padding: '4px 8px', marginRight: '4px' }}>
                            <Pencil size={16} color="#fff" />
                          </button>
                          <button className="admin-icon-btn danger" onClick={() => handleDelete(shop.id)} title="Supprimer" style={{ borderRadius: '4px', background: '#dc2626', color: '#fff', border: 'none', padding: '4px 8px' }}>
                            <Trash2 size={16} color="#fff" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
