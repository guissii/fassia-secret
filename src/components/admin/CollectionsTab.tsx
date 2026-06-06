import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FolderTree, ChevronRight, ChevronDown } from 'lucide-react';
import { api, Collection, delay } from './mockData';
import { CollectionFormModal } from './CollectionFormModal';
import { Toast, ToastType } from './shared';

export function CollectionsTab() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await api.getCollections();
      setCollections(data);
    } catch {
      setToast({ message: 'Erreur de chargement', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleSaveCollection = async (coll: Collection) => {
    try {
      if (selectedCollection) {
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
      setIsModalOpen(false);
      setSelectedCollection(null);
      loadCollections();
    } catch (error) {
      setToast({ message: 'Erreur lors de la sauvegarde', type: 'error' });
    }
  };

  const openDeleteModal = (coll: Collection) => {
    setDeleteTarget(coll);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCollection = async () => {
    if (!deleteTarget) return;
    try {
      await api.fetchWithAuth(`/collections/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      setCollections(prev => prev.filter(c => c.id !== deleteTarget.id));
      setToast({ message: 'Collection supprimée', type: 'success' });
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      setToast({ message: 'Erreur lors de la suppression', type: 'error' });
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

  const renderTreeNode = (coll: any, depth = 0) => {
    const hasChildren = coll.children && coll.children.length > 0;
    const isExpanded = expandedIds.has(coll.id);
    const paddingLeft = depth * 1.5;

    return (
      <React.Fragment key={coll.id}>
        <tr style={{ background: 'transparent' }}>
          <td style={{ paddingLeft: `${paddingLeft}rem`, paddingTop: '0.6rem', paddingBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(coll.id)}
                  style={{ background: 'none', border: 'none', color: '#e10074', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <span style={{ display: 'inline-block', width: '16px' }} />
              )}
              <FolderTree size={16} className="text-muted" />
              <span style={{ fontWeight: depth === 0 ? 600 : 400 }}>{coll.name}</span>
              {hasChildren && <span className="text-muted" style={{ fontSize: '0.75rem' }}>({coll.children.length})</span>}
            </div>
          </td>
          <td>
            <code style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              color: 'var(--admin-text-muted)',
            }}>
              {coll.slug}
            </code>
          </td>
          <td>
            <span className="admin-badge badge-neutral">{coll.page || 'general'}</span>
          </td>
          <td>{coll.order ?? 0}</td>
          <td>
            <div className="admin-row-actions">
              <button
                className="action-btn"
                title="Ajouter sous-collection"
                onClick={() => {
                  setSelectedCollection({ id: '', name: '', slug: '', page: 'general', order: 0, parentId: coll.id } as any);
                  setIsModalOpen(true);
                }}
                style={{ color: '#10b981' }}
              >
                <Plus size={16} />
              </button>
              <button
                className="action-btn"
                title="Éditer"
                onClick={() => { setSelectedCollection(coll); setIsModalOpen(true); }}
              >
                <Pencil size={16} />
              </button>
              <button
                className="action-btn text-danger"
                title="Supprimer"
                onClick={() => openDeleteModal(coll)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </td>
        </tr>
        {isExpanded && hasChildren && coll.children.map((child: any) => renderTreeNode(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="admin-categories-tab">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <CollectionFormModal
        collection={selectedCollection}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedCollection(null); }}
        onSave={handleSaveCollection}
        allCollections={collections}
      />

      {isDeleteModalOpen && deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Supprimer "{deleteTarget.name}"</h3>
            <p style={{ margin: '1rem 0', color: 'var(--admin-text-muted)' }}>
              Cette action est irréversible. Les produits associés perdront cette collection.
            </p>
            <div className="admin-modal-actions">
              <button className="admin-btn-outline" onClick={() => setIsDeleteModalOpen(false)}>
                Annuler
              </button>
              <button className="admin-btn-primary btn-destructive" onClick={handleDeleteCollection}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Collections</h2>
          <p className="admin-subtitle">Gérez vos collections et sous-catégories</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="admin-btn-outline"
            onClick={async () => {
              try {
                const res = await api.fetchWithAuth('/collections/seed', { method: 'POST' });
                setToast({ message: res.message, type: 'success' });
                loadCollections();
              } catch (error: any) {
                setToast({ message: error.message || 'Erreur import', type: 'error' });
              }
            }}
          >
            Importer sous-catégories
          </button>
          <button
            className="admin-btn-primary"
            onClick={() => { setSelectedCollection(null); setIsModalOpen(true); }}
          >
            <Plus size={18} /> Nouvelle collection
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Slug</th>
                <th>Page</th>
                <th>Ordre</th>
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
              ) : collections.length === 0 ? (
                <tr style={{ background: 'transparent' }}>
                  <td colSpan={5} className="text-center text-muted" style={{ padding: '2rem' }}>
                    Aucune collection
                  </td>
                </tr>
              ) : (
                collections
                  .filter((coll: any) => !coll.parentId)
                  .map((coll: any) => renderTreeNode(coll, 0))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
