import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FolderTree, ChevronRight, ChevronDown } from 'lucide-react';
import { api, Category, Collection, delay } from './mockData';
import { CategoryFormModal } from './CategoryFormModal';
import { CollectionFormModal } from './CollectionFormModal';
import { Toast, ToastType } from './shared';

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State Category
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // UI State Collection
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isCollModalOpen, setIsCollModalOpen] = useState(false);

  // Header dropdown
  const [showNewMenu, setShowNewMenu] = useState(false);

  // Delete with migration
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [migrateToId, setMigrateToId] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Tree expand/collapse
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Toasts
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, colls] = await Promise.all([
        api.getCategories(),
        api.getCollections(),
      ]);
      setCategories(cats);
      setCollections(colls);
    } catch {
      setToast({ message: 'Erreur de chargement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCategory = async (cat: Category) => {
    try {
      const existing = cat.id && categories.find(c => c.id === cat.id);
      if (existing) {
        await api.fetchWithAuth(`/categories/${cat.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: cat.name,
            nameAr: cat.nameAr,
            slug: cat.slug,
          }),
        });
        setToast({ message: 'Catégorie mise à jour', type: 'success' });
      } else {
        await api.fetchWithAuth('/categories', {
          method: 'POST',
          body: JSON.stringify({
            name: cat.name,
            nameAr: cat.nameAr,
            slug: cat.slug,
          }),
        });
        setToast({ message: 'Catégorie créée', type: 'success' });
      }
      loadData();
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur lors de la sauvegarde', type: 'error' });
    }
  };

  const handleSaveCollection = async (coll: Collection) => {
    try {
      if (selectedCollection?.id) {
        await api.fetchWithAuth(`/collections/${selectedCollection.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: coll.name,
            slug: coll.slug,
            page: coll.page,
            order: coll.order,
            parentId: (coll as any).parentId || null,
          }),
        });
        setToast({ message: 'Collection mise à jour', type: 'success' });
      } else {
        await api.fetchWithAuth('/collections', {
          method: 'POST',
          body: JSON.stringify({
            name: coll.name,
            slug: coll.slug,
            page: coll.page || 'general',
            order: coll.order || 0,
            parentId: (coll as any).parentId || null,
          }),
        });
        setToast({ message: 'Collection créée', type: 'success' });
      }
      setIsCollModalOpen(false);
      setSelectedCollection(null);
      loadData();
    } catch {
      setToast({ message: 'Erreur lors de la sauvegarde', type: 'error' });
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Supprimer cette collection ?')) return;
    try {
      await api.fetchWithAuth(`/collections/${id}`, { method: 'DELETE' });
      setCollections(prev => prev.filter(c => c.id !== id));
      setToast({ message: 'Collection supprimée', type: 'success' });
    } catch {
      setToast({ message: 'Erreur lors de la suppression', type: 'error' });
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

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderCollectionNode = (coll: any, depth: number, page: string) => {
    const childCollections = collections.filter((c: any) => c.parentId === coll.id);
    const hasChildren = childCollections.length > 0;
    const isExpanded = expandedIds.has(coll.id);
    const paddingLeft = depth * 1.5;

    return (
      <React.Fragment key={coll.id}>
        <tr style={{ background: 'transparent' }}>
          <td style={{ paddingLeft: `${paddingLeft}rem`, paddingTop: '0.4rem', paddingBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(coll.id)}
                  style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <span style={{ display: 'inline-block', width: '14px' }} />
              )}
              <span style={{ color: '#0ea5e9', fontSize: '0.85rem' }}>◆ {coll.name}</span>
              {hasChildren && <span className="text-muted" style={{ fontSize: '0.7rem' }}>({childCollections.length})</span>}
            </div>
          </td>
          <td></td>
          <td>
            <code style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              color: 'var(--admin-text-muted)',
            }}>
              {coll.slug}
            </code>
          </td>
          <td>
            <span className="admin-badge badge-neutral">{coll._count?.products ?? 0}</span>
          </td>
          <td>
            <div className="admin-row-actions">
              <button
                className="action-btn"
                title="Ajouter sous-collection"
                onClick={() => {
                  setSelectedCollection({ id: '', name: '', slug: '', page, order: 0, parentId: coll.id } as any);
                  setIsCollModalOpen(true);
                }}
                style={{ color: '#0ea5e9' }}
              >
                <Plus size={14} />
              </button>
              <button
                className="action-btn"
                title="Éditer"
                onClick={() => { setSelectedCollection(coll); setIsCollModalOpen(true); }}
              >
                <Pencil size={14} />
              </button>
              <button
                className="action-btn text-danger"
                title="Supprimer"
                onClick={() => handleDeleteCollection(coll.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </td>
        </tr>
        {isExpanded && hasChildren && childCollections.map((child: any) => renderCollectionNode(child, depth + 1, page))}
      </React.Fragment>
    );
  };

  const renderTreeNode = (cat: any, depth = 0) => {
    const catCollections = collections.filter((c: any) => (c.page === cat.slug || c.page === cat.id) && !c.parentId);
    const hasCollections = catCollections.length > 0;
    const isExpanded = expandedIds.has(cat.id);
    const paddingLeft = depth * 1.5;

    return (
      <React.Fragment key={cat.id}>
        <tr style={{ background: 'transparent' }}>
          <td style={{ paddingLeft: `${paddingLeft}rem`, paddingTop: '0.6rem', paddingBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {hasCollections ? (
                <button
                  onClick={() => toggleExpand(cat.id)}
                  style={{ background: 'none', border: 'none', color: '#e10074', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <span style={{ display: 'inline-block', width: '16px' }} />
              )}
              <FolderTree size={16} style={{ color: '#e10074' }} />
              <span style={{ fontWeight: 600 }}>{cat.name}</span>
              {hasCollections && <span className="text-muted" style={{ fontSize: '0.75rem' }}>({catCollections.length})</span>}
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
            <span className="admin-badge badge-neutral">{cat._count?.products ?? cat.productCount ?? 0}</span>
          </td>
          <td>
            <div className="admin-row-actions">
              <button
                className="action-btn"
                title="Ajouter collection"
                onClick={() => {
                  setSelectedCollection({ id: '', name: '', slug: '', page: cat.slug, order: 0, parentId: null } as any);
                  setIsCollModalOpen(true);
                }}
                style={{ color: '#0ea5e9' }}
              >
                <Plus size={16} />
              </button>
              <button
                className="action-btn"
                title="Éditer"
                onClick={() => { setSelectedCategory(cat); setIsModalOpen(true); }}
              >
                <Pencil size={16} />
              </button>
              <button
                className="action-btn text-danger"
                title="Supprimer"
                onClick={() => openDeleteModal(cat)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </td>
        </tr>
        {isExpanded && hasCollections && catCollections.map((coll: any) => renderCollectionNode(coll, depth + 1, cat.slug))}
      </React.Fragment>
    );
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

      <CollectionFormModal
        collection={selectedCollection}
        isOpen={isCollModalOpen}
        onClose={() => { setIsCollModalOpen(false); setSelectedCollection(null); }}
        onSave={handleSaveCollection}
        allCollections={collections}
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
        <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <button
              className="admin-btn-primary"
              onClick={() => setShowNewMenu(prev => !prev)}
            >
              <Plus size={18} /> Nouveau
            </button>
            {showNewMenu && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                zIndex: 100,
                minWidth: '160px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}>
                <button
                  style={{ display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}
                  onClick={() => { setShowNewMenu(false); setSelectedCategory(null); setIsModalOpen(true); }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(225,0,116,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <FolderTree size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Catégorie
                </button>
                <button
                  style={{ display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}
                  onClick={() => { setShowNewMenu(false); setSelectedCollection(null); setIsCollModalOpen(true); }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(225,0,116,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ marginRight: '8px', color: '#0ea5e9' }}>◆</span> Collection
                </button>
              </div>
            )}
          </div>
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
                <tr style={{ background: 'transparent' }}>
                  <td colSpan={5} className="text-center" style={{ padding: '2rem' }}>
                    Chargement...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr style={{ background: 'transparent' }}>
                  <td colSpan={5} className="text-center text-muted" style={{ padding: '2rem' }}>
                    Aucune catégorie
                  </td>
                </tr>
              ) : (
                categories
                  .filter((cat: any) => !cat.parentId)
                  .map((cat: any) => renderTreeNode(cat, 0))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
