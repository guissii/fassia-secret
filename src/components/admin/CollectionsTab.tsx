import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react';
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
          body: JSON.stringify(coll),
        });
        setCollections(prev => prev.map(c => (c.id === coll.id ? coll : c)));
        setToast({ message: 'Collection mise à jour', type: 'success' });
      } else {
        const res = await api.fetchWithAuth('/collections', {
          method: 'POST',
          body: JSON.stringify(coll),
        });
        setCollections(prev => [...prev, res.collection || coll]);
        setToast({ message: 'Collection créée', type: 'success' });
      }
      setIsModalOpen(false);
      setSelectedCollection(null);
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

  return (
    <div className="admin-categories-tab">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <CollectionFormModal
        collection={selectedCollection}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedCollection(null); }}
        onSave={handleSaveCollection}
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
        <button
          className="admin-btn-primary"
          onClick={() => { setSelectedCollection(null); setIsModalOpen(true); }}
        >
          <Plus size={18} /> Nouvelle collection
        </button>
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
                <tr>
                  <td colSpan={5} className="text-center" style={{ padding: '2rem' }}>
                    Chargement...
                  </td>
                </tr>
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted" style={{ padding: '2rem' }}>
                    Aucune collection
                  </td>
                </tr>
              ) : (
                collections.map(coll => (
                  <tr key={coll.id} className="hover-bg">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FolderTree size={18} className="text-muted" />
                        <span className="font-medium">{coll.name}</span>
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
                          title="Éditer"
                          onClick={() => { setSelectedCollection(coll); setIsModalOpen(true); }}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="action-btn text-danger"
                          title="Supprimer"
                          onClick={() => openDeleteModal(coll)}
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
