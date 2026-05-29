import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react';
import { api, Category, delay } from './mockData';
import { CategoryFormModal } from './CategoryFormModal';
import { Toast, ToastType } from './shared';

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete with migration
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [migrateToId, setMigrateToId] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Toasts
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch {
      setToast({ message: 'Erreur de chargement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSaveCategory = (cat: Category) => {
    const existing = categories.find(c => c.id === cat.id);
    if (existing) {
      // Update
      setCategories(prev => prev.map(c => (c.id === cat.id ? cat : c)));
      setToast({ message: 'Catégorie mise à jour', type: 'success' });
    } else {
      // Create new
      setCategories(prev => [...prev, cat]);
      setToast({ message: 'Catégorie créée', type: 'success' });
    }
  };

  const openDeleteModal = (cat: Category) => {
    setDeleteTarget(cat);
    setMigrateToId('');
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.productCount > 0 && !migrateToId) {
      setToast({ message: 'Choisissez une catégorie de destination pour les produits', type: 'error' });
      return;
    }

    try {
      await api.fetchWithAuth(`/categories/${deleteTarget.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ migrateToId: migrateToId || null })
      });
      
      const migratedTo = categories.find(c => c.id === migrateToId);

      setCategories(prev => {
        let updated = prev.filter(c => c.id !== deleteTarget.id);
        // If migration target exists, add product count
        if (migratedTo) {
          updated = updated.map(c =>
            c.id === migrateToId
              ? { ...c, productCount: c.productCount + deleteTarget.productCount }
              : c
          );
        }
        return updated;
      });

      setToast({
        message: migratedTo
          ? `Catégorie supprimée. ${deleteTarget.productCount} produit(s) migré(s) vers "${migratedTo.name}"`
          : 'Catégorie supprimée',
        type: 'success',
      });
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      setToast({ message: 'Erreur lors de la suppression de la catégorie', type: 'error' });
    }
  };

  return (
    <div className="admin-categories-tab">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <CategoryFormModal
        category={selectedCategory}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
      />

      {/* Custom Delete/Migrate Modal */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Supprimer "{deleteTarget.name}"</h3>

            {deleteTarget.productCount > 0 ? (
              <>
                <p style={{ margin: '1rem 0', color: 'var(--admin-text-muted)' }}>
                  Cette catégorie contient <strong style={{ color: '#fbbf24' }}>{deleteTarget.productCount} produit(s)</strong>.
                  Choisissez une catégorie de destination pour les migrer :
                </p>
                <div className="form-group">
                  <label>Migrer les produits vers :</label>
                  <select
                    className="admin-select"
                    value={migrateToId}
                    onChange={e => setMigrateToId(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">— Sélectionner une catégorie —</option>
                    {categories
                      .filter(c => c.id !== deleteTarget.id)
                      .map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.productCount} produits)
                        </option>
                      ))}
                  </select>
                </div>
              </>
            ) : (
              <p style={{ margin: '1rem 0', color: 'var(--admin-text-muted)' }}>
                Cette catégorie est vide. Voulez-vous la supprimer ?
              </p>
            )}

            <div className="admin-modal-actions">
              <button className="admin-btn-outline" onClick={() => setIsDeleteModalOpen(false)}>
                Annuler
              </button>
              <button
                className="admin-btn-primary btn-destructive"
                onClick={handleDeleteCategory}
                disabled={deleteTarget.productCount > 0 && !migrateToId}
              >
                Supprimer et migrer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Catégories</h2>
          <p className="admin-subtitle">Organisez vos produits par catégorie</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="admin-btn-outline"
            onClick={async () => {
              try {
                const res = await api.fetchWithAuth('/categories/seed', { method: 'POST' });
                setToast({ message: res.message, type: 'success' });
                loadCategories();
              } catch (error: any) {
                setToast({ message: error.message || 'Erreur import', type: 'error' });
              }
            }}
          >
            Importer catégories
          </button>
          <button
            className="admin-btn-outline"
            onClick={async () => {
              try {
                const res = await api.fetchWithAuth('/collections/seed', { method: 'POST' });
                setToast({ message: res.message, type: 'success' });
              } catch (error: any) {
                setToast({ message: error.message || 'Erreur import collections', type: 'error' });
              }
            }}
          >
            Importer collections
          </button>
          <button
            className="admin-btn-primary"
            onClick={() => { setSelectedCategory(null); setIsModalOpen(true); }}
          >
            <Plus size={18} /> Nouvelle catégorie
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Nom (AR)</th>
                <th>Slug</th>
                <th>Produits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center" style={{ padding: '2rem' }}>
                    Chargement...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted" style={{ padding: '2rem' }}>
                    Aucune catégorie
                  </td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="hover-bg">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FolderTree size={18} className="text-muted" />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </td>
                    <td style={{ direction: 'rtl', fontFamily: 'sans-serif' }}>{cat.nameAr}</td>
                    <td>
                      <code style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        color: 'var(--admin-text-muted)',
                      }}>
                        {cat.slug}
                      </code>
                    </td>
                    <td>
                      <span className="admin-badge badge-neutral">{cat.productCount}</span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          className="action-btn"
                          title="Éditer"
                          onClick={() => { setSelectedCategory(cat); setIsModalOpen(true); }}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="action-btn text-danger"
                          title="Supprimer"
                          onClick={() => openDeleteModal(cat)}
                        >
                          <Trash2 size={18} />
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
    </div>
  );
}
