import React, { useState, useEffect } from 'react';
import { Search, Plus, Archive, Eye, EyeOff, Pencil, Trash2, Tag } from 'lucide-react';
import { api, AdminProduct, delay } from './mockData';
import { ProductFormModal } from './ProductFormModal';
import { Toast, ToastType, ConfirmModal } from './shared';
import { publicAssetUrl } from '../../lib/publicUrl';

export function ProductsTab() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  
  // UI State
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modals & Toasts
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
      
      // Extract unique categories for filter
      const allCategories = data.flatMap((p: AdminProduct) => p.categories || []);
      const uniqueCats = Array.from(new Set(allCategories)).filter(Boolean) as string[];
      setCategories(uniqueCats);
    } catch (e) {
      setToast({ message: "Erreur de chargement", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = categoryFilter === 'all' || product.categories.includes(categoryFilter);
    const matchesArchive = showArchived ? product.isArchived : !product.isArchived;
    
    return matchesSearch && matchesCategory && matchesArchive;
  });

  const toggleVisibility = async (id: number) => {
    try {
      // Optimistic update
      setProducts(prev => prev.map(p => p.id === id ? { ...p, isVisible: !p.isVisible } : p));
      
      const response = await api.fetchWithAuth(`/products/${id}/visibility`, { method: 'PATCH' });
      const isNowVisible = response.product.isVisible;
      
      setToast({ message: `Produit ${isNowVisible ? 'visible' : 'masqué'}`, type: 'info' });
    } catch (error) {
      setToast({ message: "Erreur lors de la modification de la visibilité", type: 'error' });
      // Revert optimistic update on error
      setProducts(prev => prev.map(p => p.id === id ? { ...p, isVisible: !p.isVisible } : p));
    }
  };

  const toggleArchive = async (id: number) => {
    try {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, isArchived: !p.isArchived } : p));
      
      const response = await api.fetchWithAuth(`/products/${id}/archive`, { method: 'PATCH' });
      const isNowArchived = response.product.isArchived;
      
      setToast({ message: `Produit ${isNowArchived ? 'archivé' : 'désarchivé'}`, type: 'info' });
    } catch (error) {
      setToast({ message: "Erreur lors de l'archivage", type: 'error' });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, isArchived: !p.isArchived } : p));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.fetchWithAuth(`/products/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, isArchived: true } : p).filter(p => p.id !== id));
      setToast({ message: "Produit supprimé", type: 'success' });
    } catch (error) {
      setToast({ message: "Erreur lors de la suppression", type: 'error' });
    }
  };

  const handleSaveProduct = (productData: AdminProduct) => {
    const existingIndex = products.findIndex(p => p.id === productData.id);
    if (existingIndex >= 0) {
      // Update
      setProducts(prev => prev.map(p => p.id === productData.id ? productData : p));
      setToast({ message: "Produit mis à jour", type: 'success' });
    } else {
      // Create new
      setProducts(prev => [productData, ...prev]);
      setToast({ message: "Produit créé avec succès", type: 'success' });
      
      // Update category list if there are new categories
      const newCats = (productData.categories || []).filter(cat => !categories.includes(cat as string));
      if (newCats.length > 0) {
        setCategories(prev => [...prev, ...(newCats as string[])]);
      }
    }
  };

  const handleBulkTags = async (mode: 'clear' | 'auto') => {
    setToast({ message: "Opération en cours...", type: 'info' });
    await delay(800);
    
    if (mode === 'clear') {
      setProducts(prev => prev.map(p => ({ ...p, tags: [] })));
      setToast({ message: "Tags retirés de tous les produits", type: 'success' });
    } else {
      // Randomly assign tags to some products
      setProducts(prev => prev.map(p => {
        if (Math.random() > 0.8) {
          const possibleTags = ['Exclusif', 'Meilleure vente', 'Nouveau'];
          const randomTag = possibleTags[Math.floor(Math.random() * possibleTags.length)];
          return { ...p, tags: [...(p.tags || []), randomTag] };
        }
        return p;
      }));
      setToast({ message: "Tags assignés automatiquement", type: 'success' });
    }
  };

  const formatMAD = (amount: number) => {
    return amount.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD';
  };

  return (
    <div className="admin-products-tab">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <ConfirmModal 
        isOpen={!!confirmDeleteId}
        title="Supprimer le produit"
        message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
        confirmLabel="Supprimer"
        isDestructive={true}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <ProductFormModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
      />

      <div className="admin-dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Inventaire</h2>
          <p className="admin-subtitle">Gérez vos produits, stocks et prix</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="dropdown-container">
            <button className="admin-btn-outline">
              <Tag size={18} />
              Tags en masse
            </button>
            <div className="dropdown-menu-custom">
              <button onClick={() => handleBulkTags('auto')}>Auto-assigner (Exclusif, etc.)</button>
              <button onClick={() => handleBulkTags('clear')} className="text-danger">Effacer tous les tags</button>
            </div>
          </div>
          
          <button 
            className="admin-btn-primary" 
            onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }}
          >
            <Plus size={18} />
            Nouveau produit
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Rechercher un produit ou une marque..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="admin-filters">
            <label className="toggle-label" style={{ marginRight: '1rem' }}>
              <span className="text-sm">Archivés</span>
              <div className="switch-wrapper">
                <input 
                  type="checkbox" 
                  checked={showArchived} 
                  onChange={() => setShowArchived(!showArchived)}
                />
                <span className="slider round"></span>
              </div>
            </label>
            
            <select 
              className="admin-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Catégorie</th>
                <th>Visibilité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-lg">Chargement...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-lg text-muted">Aucun produit trouvé.</td></tr>
              ) : (
                filteredProducts.map(product => {
                  const imageSrc = product.image.startsWith('data:') || product.image.startsWith('http') || product.image.startsWith('blob:') 
                    ? product.image 
                    : publicAssetUrl(product.image);
                  
                  const isLowStock = product.stock < 10 && product.stock > 0;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <tr key={product.id} className={!product.isVisible ? 'opacity-60 hover-bg' : 'hover-bg'}>
                      <td>
                        <div className="admin-product-cell">
                          <img src={imageSrc} alt={product.name} className="admin-product-thumb" />
                          <div className="admin-product-info">
                            <span className="admin-product-name">{product.name}</span>
                            <span className="admin-product-brand">{product.brand}</span>
                            {product.tags && product.tags.length > 0 && (
                              <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                                {product.tags.map(tag => (
                                  <span key={tag} className="admin-badge badge-neutral" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="font-medium">{formatMAD(product.price)}</span>
                          {product.oldPrice && <span className="text-muted text-xs" style={{ textDecoration: 'line-through' }}>{formatMAD(product.oldPrice)}</span>}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge ${isOutOfStock ? 'badge-error' : isLowStock ? 'badge-warning' : 'badge-neutral'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        {product.categories && product.categories.length > 0 
                          ? product.categories.join(', ') 
                          : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        <button 
                          className={`action-btn ${product.isVisible ? 'text-success' : 'text-muted'}`}
                          onClick={() => toggleVisibility(product.id)}
                          title={product.isVisible ? "Visible" : "Masqué"}
                        >
                          {product.isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button 
                            className="action-btn" 
                            title="Éditer"
                            onClick={() => { setSelectedProduct(product); setIsModalOpen(true); }}
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            className="action-btn" 
                            title={product.isArchived ? "Désarchiver" : "Archiver"}
                            onClick={() => toggleArchive(product.id)}
                          >
                            <Archive size={18} className={product.isArchived ? "text-success" : ""} />
                          </button>
                          <button 
                            className="action-btn text-danger" 
                            title="Supprimer"
                            onClick={() => setConfirmDeleteId(product.id)}
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
          
          <div className="admin-table-footer">
            <span className="text-sm text-muted">
              Affichage de {filteredProducts.length} produit(s)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
