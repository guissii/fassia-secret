import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FlaskConical, X, Save, GripVertical } from 'lucide-react';
import { api } from './mockData';
import { Toast, ToastType } from './shared';

interface Ingredient {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: string;
  accent: string;
  searchQuery: string;
  order: number;
  isActive: boolean;
  _count?: { products: number };
}

const ICON_OPTIONS = ['droplet', 'flask', 'sparkles', 'sun', 'leaf'];
const ACCENT_OPTIONS = [
  { value: '#e10074', label: 'Rose' },
  { value: '#0ea5e9', label: 'Bleu' },
  { value: '#10b981', label: 'Vert' },
  { value: '#84cc16', label: 'Lime' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#a855f7', label: 'Violet' },
  { value: '#f97316', label: 'Abricot' },
  { value: '#ec4899', label: 'Fuchsia' },
  { value: '#06b6d4', label: 'Cyan' },
];

const EMPTY_INGREDIENT: Omit<Ingredient, 'id' | '_count'> = {
  tag: '',
  title: '',
  subtitle: '',
  description: '',
  image: '',
  icon: 'sparkles',
  accent: '#e10074',
  searchQuery: '',
  order: 0,
  isActive: true,
};

export function IngredientsTab() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [form, setForm] = useState<Omit<Ingredient, 'id' | '_count'>>(EMPTY_INGREDIENT);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.fetchWithAuth('/ingredients');
      setIngredients(res.ingredients || []);
    } catch {
      setToast({ message: 'Erreur de chargement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_INGREDIENT, order: ingredients.length });
    setEditingIngredient(null);
    setIsModalOpen(true);
  };

  const openEdit = (ing: Ingredient) => {
    setForm({
      tag: ing.tag,
      title: ing.title,
      subtitle: ing.subtitle,
      description: ing.description,
      image: ing.image,
      icon: ing.icon,
      accent: ing.accent,
      searchQuery: ing.searchQuery,
      order: ing.order,
      isActive: ing.isActive,
    });
    setEditingIngredient(ing);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.searchQuery.trim()) {
      setToast({ message: 'Titre et terme de recherche requis', type: 'error' });
      return;
    }
    try {
      if (editingIngredient) {
        await api.fetchWithAuth(`/ingredients/${editingIngredient.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        setToast({ message: 'Ingrédient mis à jour', type: 'success' });
      } else {
        await api.fetchWithAuth('/ingredients', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        setToast({ message: 'Ingrédient créé', type: 'success' });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur lors de la sauvegarde', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet ingrédient ?')) return;
    try {
      await api.fetchWithAuth(`/ingredients/${id}`, { method: 'DELETE' });
      setToast({ message: 'Ingrédient supprimé', type: 'success' });
      await loadData();
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur de suppression', type: 'error' });
    }
  };

  const handleToggleActive = async (ing: Ingredient) => {
    try {
      await api.fetchWithAuth(`/ingredients/${ing.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...ing, isActive: !ing.isActive }),
      });
      await loadData();
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur', type: 'error' });
    }
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="admin-dashboard-header">
        <h2>Ingrédients Actifs</h2>
        <p className="admin-subtitle">Gérer les ingrédients affichés sur la page d&apos;accueil</p>
      </div>

      <div className="admin-toolbar">
        <button className="admin-btn-primary" onClick={openCreate}>
          <Plus size={16} /> Ajouter un ingrédient
        </button>
      </div>

      {loading ? (
        <div className="text-center py-lg text-muted">Chargement...</div>
      ) : (
        <div className="admin-card">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Image</th>
                  <th>Titre</th>
                  <th>Tag</th>
                  <th>Terme recherche</th>
                  <th>Produits</th>
                  <th>Actif</th>
                  <th style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-lg text-muted">
                      Aucun ingrédient. Cliquez sur "Ajouter" pour commencer.
                    </td>
                  </tr>
                ) : (
                  ingredients.map((ing) => (
                    <tr key={ing.id}>
                      <td><GripVertical size={14} className="text-muted" /></td>
                      <td>
                        <img
                          src={ing.image || '/placeholder.png'}
                          alt={ing.title}
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, background: '#fff' }}
                        />
                      </td>
                      <td className="font-medium">{ing.title}</td>
                      <td><span className="text-muted">{ing.tag}</span></td>
                      <td><code style={{ fontSize: '0.8rem' }}>{ing.searchQuery}</code></td>
                      <td>{ing._count?.products ?? 0}</td>
                      <td>
                        <label className="switch-wrapper" style={{ margin: 0 }}>
                          <input
                            type="checkbox"
                            checked={ing.isActive}
                            onChange={() => handleToggleActive(ing)}
                          />
                          <span className="slider round"></span>
                        </label>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button className="action-btn" title="Éditer" onClick={() => openEdit(ing)}>
                            <Pencil size={16} />
                          </button>
                          <button className="action-btn text-danger" title="Supprimer" onClick={() => handleDelete(ing.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>{editingIngredient ? 'Modifier' : 'Nouvel'} ingrédient</h3>
              <button className="admin-mobile-close" onClick={() => setIsModalOpen(false)} style={{ display: 'block' }}>
                <X size={24} />
              </button>
            </div>

            <div className="form-col" style={{ gap: '1rem' }}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Titre *</label>
                  <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Sous-titre</label>
                  <input className="admin-input" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Tag (ex: ÉCLAT & UNIFORMITÉ)</label>
                <input className="admin-input" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea className="admin-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Image URL *</label>
                <input className="admin-input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/ingredients/niacinamide.webp" />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Terme de recherche *</label>
                  <input className="admin-input" value={form.searchQuery} onChange={(e) => setForm({ ...form, searchQuery: e.target.value })} placeholder="Niacinamide" />
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>Les produits ayant ce terme dans leurs tags apparaîtront</span>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Ordre</label>
                  <input className="admin-input" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Icône</label>
                  <select className="admin-select" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Couleur accent</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {ACCENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, accent: opt.value })}
                        title={opt.label}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: opt.value,
                          border: form.accent === opt.value ? '2px solid white' : '2px solid transparent',
                          outline: form.accent === opt.value ? `2px solid ${opt.value}` : 'none',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button className="admin-btn-outline" onClick={() => setIsModalOpen(false)}>Annuler</button>
              <button className="admin-btn-primary" onClick={handleSave}>
                <Save size={16} /> {editingIngredient ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
