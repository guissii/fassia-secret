import React, { useState, useEffect } from 'react';
import { Search, Plus, Archive, Eye, EyeOff, Pencil, Trash2, X, Trash, Star } from 'lucide-react';
import './ProductsTab.css';
import { api, AdminProduct } from './mockData';
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
  const [sectionFilter, setSectionFilter] = useState('all');
  const [collections, setCollections] = useState<string[]>([]);
  
  // Pagination
  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [lastSelectedId, setLastSelectedId] = useState<number | null>(null);
  const [selectAllMode, setSelectAllMode] = useState<'none' | 'visible' | 'filtered'>('none');

  const MAX_ESSENTIALS = 10;
  const essentialCount = products.filter(p => p.isEssential).length;
  const selectedEssentialCount = Array.from(selectedIds).filter(id => {
    const p = products.find(prod => prod.id === id);
    return p && !p.isEssential;
  }).length;
  const canAddEssential = essentialCount + selectedEssentialCount <= MAX_ESSENTIALS;
  
  // UI State
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modals & Toasts
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const [data, colls] = await Promise.all([api.getProducts(), api.getCollections()]);
      setProducts(data);
      
      // Extract unique categories for filter
      const allCategories = data.flatMap((p: AdminProduct) => (p.categories || []).map((c: any) => typeof c === 'string' ? c : c.name));
      const uniqueCats = Array.from(new Set(allCategories)).filter(Boolean) as string[];
      setCategories(uniqueCats);
      
      // Extract collection names for section filter
      setCollections(colls.map((c: any) => c.name));
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
      
    const matchesCategory = categoryFilter === 'all' || 
      product.categories.some((c: any) => (typeof c === 'string' ? c : c.name) === categoryFilter) ||
      product.collections.some((c: any) => (typeof c === 'string' ? c : c.name) === categoryFilter);
    const matchesArchive = showArchived ? product.isArchived : !product.isArchived;
    const matchesSection = sectionFilter === 'all' || product.collections.some((c: any) => (typeof c === 'string' ? c : c.name) === sectionFilter);
    
    return matchesSearch && matchesCategory && matchesArchive && matchesSection;
  });
  
  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setSelectedIds(new Set());
  }, [searchQuery, categoryFilter, sectionFilter, showArchived]);
  
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  // Bulk selection handlers
  const toggleSelect = (id: number, event?: React.MouseEvent) => {
    const isShiftClick = event?.shiftKey;
    
    if (isShiftClick && lastSelectedId !== null) {
      // Range selection
      const ids = visibleProducts.map(p => p.id);
      const startIdx = ids.indexOf(lastSelectedId);
      const endIdx = ids.indexOf(id);
      if (startIdx !== -1 && endIdx !== -1) {
        const [min, max] = [Math.min(startIdx, endIdx), Math.max(startIdx, endIdx)];
        const rangeIds = ids.slice(min, max + 1);
        setSelectedIds(prev => {
          const next = new Set(prev);
          rangeIds.forEach(rid => next.add(rid));
          return next;
        });
      }
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
    setLastSelectedId(id);
  };

  const toggleSelectAll = () => {
    if (selectAllMode === 'visible') {
      // Upgrade to filtered (all)
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
      setSelectAllMode('filtered');
    } else if (selectAllMode === 'filtered') {
      // Clear
      setSelectedIds(new Set());
      setSelectAllMode('none');
    } else {
      // Select visible
      setSelectedIds(new Set(visibleProducts.map(p => p.id)));
      setSelectAllMode('visible');
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectAllMode('none');
    setLastSelectedId(null);
  };

  const handleBulkVisibility = async (visible: boolean) => {
    if (selectedIds.size === 0) return;
    try {
      setToast({ message: `${visible ? 'Publication' : 'Masquage'} de ${selectedIds.size} produit(s)...`, type: 'info' });
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        await api.fetchWithAuth(`/products/${id}/visibility`, { method: 'PATCH', body: JSON.stringify({ isVisible: visible }) });
      }
      setProducts(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, isVisible: visible } : p));
      setToast({ message: `${ids.length} produit(s) ${visible ? 'publié(s)' : 'masqué(s)'}`, type: 'success' });
    } catch {
      setToast({ message: "Erreur lors de la modification de la visibilité", type: 'error' });
    }
  };

  const handleBulkArchive = async (archive: boolean) => {
    if (selectedIds.size === 0) return;
    try {
      setToast({ message: `${archive ? 'Archivage' : 'Désarchivage'} de ${selectedIds.size} produit(s)...`, type: 'info' });
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        await api.fetchWithAuth(`/products/${id}/archive`, { method: 'PATCH', body: JSON.stringify({ isArchived: archive }) });
      }
      setProducts(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, isArchived: archive } : p));
      setToast({ message: `${ids.length} produit(s) ${archive ? 'archivé(s)' : 'désarchivé(s)'}`, type: 'success' });
    } catch {
      setToast({ message: "Erreur lors de l'archivage", type: 'error' });
    }
  };

  const handleBulkEssential = async (essential: boolean) => {
    if (selectedIds.size === 0) return;
    try {
      setToast({ message: `${essential ? 'Ajout' : 'Retrait'} de ${selectedIds.size} produit(s) aux Essentiels...`, type: 'info' });
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        await api.fetchWithAuth(`/products/${id}/essential`, { method: 'PATCH', body: JSON.stringify({ isEssential: essential }) });
      }
      setProducts(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, isEssential: essential } : p));
      setToast({ message: `${ids.length} produit(s) ${essential ? 'ajouté(s) aux' : 'retiré(s) des'} Essentiels`, type: 'success' });
    } catch {
      setToast({ message: "Erreur lors de la modification des Essentiels", type: 'error' });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    try {
      setToast({ message: `Suppression de ${selectedIds.size} produit(s)...`, type: 'info' });
      
      // Delete one by one since bulk delete endpoint may not exist
      const ids = Array.from(selectedIds);
      for (const id of ids) {
        await api.fetchWithAuth(`/products/${id}`, { method: 'DELETE' });
      }
      
      setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      setConfirmBulkDelete(false);
      setToast({ message: `${ids.length} produit(s) supprimé(s)`, type: 'success' });
    } catch (error) {
      setToast({ message: "Erreur lors de la suppression par lot", type: 'error' });
    }
  };

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

  const getPromoBadge = (price: number, oldPrice?: number | null) => {
    if (!oldPrice || oldPrice <= price) return null;
    const pct = Math.round(((oldPrice - price) / oldPrice) * 100);
    if (pct <= 0) return null;
    return `-${pct}%`;
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

      <ConfirmModal 
        isOpen={confirmBulkDelete}
        title="Supprimer la sélection"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedIds.size} produit(s) ? Cette action est irréversible.`}
        confirmLabel="Supprimer tout"
        isDestructive={true}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
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
              style={{ minWidth: '200px' }}
            >
              <option value="all">Toutes les catégories</option>
              <optgroup label="Catégories principales">
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </optgroup>
              <optgroup label="Collections / Sous-catégories">
                {collections.map(coll => (
                  <option key={coll} value={coll}>📁 {coll}</option>
                ))}
              </optgroup>
            </select>

            <select 
              className="admin-select"
              value={sectionFilter}
              onChange={(e) => { setSectionFilter(e.target.value); setSelectedIds(new Set()); }}
              style={{ minWidth: '180px' }}
            >
              <option value="all">📁 Filtrer par collection</option>
              {collections.map(coll => (
                <option key={coll} value={coll}>{coll}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="admin-bulk-bar" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.5rem 1rem', 
            background: '#f0fdf4', 
            borderBottom: '1px solid #bbf7d0',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}>
            <span className="text-sm font-medium" style={{ color: '#166534', marginRight: 'auto' }}>
              {selectedIds.size} produit(s) sélectionné(s)
              {selectAllMode === 'filtered' && ` (tous les ${filteredProducts.length} filtrés)`}
              {selectAllMode === 'visible' && filteredProducts.length > visibleProducts.length && (
                <button 
                  className="text-xs" 
                  onClick={() => {
                    setSelectedIds(new Set(filteredProducts.map(p => p.id)));
                    setSelectAllMode('filtered');
                  }}
                  style={{ color: '#166534', textDecoration: 'underline', marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Sélectionner les {filteredProducts.length} produits filtrés
                </button>
              )}
              <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: '#92400e', background: '#fef3c7', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid #f59e0b' }}>
                ★ Essentiels : {essentialCount}/{MAX_ESSENTIALS}
              </span>
            </span>
            <button className="admin-btn-outline text-sm" onClick={() => handleBulkVisibility(true)} title="Publier">
              <Eye size={14} /> Publier
            </button>
            <button className="admin-btn-outline text-sm" onClick={() => handleBulkVisibility(false)} title="Masquer">
              <EyeOff size={14} /> Masquer
            </button>
            <button className="admin-btn-outline text-sm" onClick={() => handleBulkArchive(true)} title="Archiver">
              <Archive size={14} /> Archiver
            </button>
            <button 
              className="admin-btn-outline text-sm" 
              onClick={() => canAddEssential ? handleBulkEssential(true) : setToast({ message: `Maximum ${MAX_ESSENTIALS} produits essentiels atteint`, type: 'error' })} 
              title={canAddEssential ? "Ajouter aux Essentiels" : `Limite ${MAX_ESSENTIALS} atteinte`}
              style={{ 
                background: canAddEssential ? '#fef3c7' : '#f3f4f6', 
                borderColor: canAddEssential ? '#f59e0b' : '#d1d5db', 
                color: canAddEssential ? '#92400e' : '#9ca3af',
                cursor: canAddEssential ? 'pointer' : 'not-allowed'
              }}
              disabled={!canAddEssential}
            >
              <Star size={14} /> Essentiel
            </button>
            <button 
              className="admin-btn-outline text-sm" 
              onClick={clearSelection}
            >
              <X size={14} /> Annuler
            </button>
            <button 
              className="admin-btn-danger text-sm" 
              onClick={() => setConfirmBulkDelete(true)}
            >
              <Trash size={14} /> Supprimer
            </button>
          </div>
        )}

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={visibleProducts.length > 0 && selectedIds.size === visibleProducts.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Produit</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Catégorie</th>
                <th>Collections</th>
                <th>Visibilité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-lg">Chargement...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-lg text-muted">Aucun produit trouvé.</td></tr>
              ) : (
                visibleProducts.map(product => {
                  const imageSrc = product.image.startsWith('data:') || product.image.startsWith('http') || product.image.startsWith('blob:') 
                    ? product.image 
                    : publicAssetUrl(product.image);
                  
                  const isLowStock = product.stock < 10 && product.stock > 0;
                  const isOutOfStock = product.stock === 0;

                  const isSelected = selectedIds.has(product.id);
                  
                  return (
                    <tr 
                  key={product.id} 
                  className={`${!product.isVisible ? 'opacity-60 hover-bg' : 'hover-bg'} ${isSelected ? 'row-selected' : ''}`}
                  onClick={(e) => {
                    // Only toggle if clicking on the row itself (not buttons/links)
                    const target = e.target as HTMLElement;
                    if (target.closest('button') || target.closest('a') || target.closest('input[type="checkbox"]')) return;
                    toggleSelect(product.id, e);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleSelect(product.id)}
                        />
                      </td>
                      <td>
                        <div className="admin-product-cell">
                          <img src={imageSrc} alt={product.name} className="admin-product-thumb" />
                          <div className="admin-product-info">
                            <span className="admin-product-name">{product.name}</span>
                            <span className="admin-product-brand">{product.brand}</span>
                            {product.koreanBeautyStep && (
                              <span className="admin-badge badge-neutral" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginTop: '0.25rem' }}>
                                KB Étape {product.koreanBeautyStep}
                              </span>
                            )}
                            {(() => {
                              const badge = getPromoBadge(product.price, product.oldPrice);
                              return badge ? (
                                <span className="admin-badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginTop: '0.25rem', background: '#dcfce7', color: '#166534', border: '1px solid #22c55e' }}>
                                  {badge}
                                </span>
                              ) : null;
                            })()}
                            {product.isEssential && (
                              <span className="admin-badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginTop: '0.25rem', background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b' }}>
                                ★ Essentiel
                              </span>
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
                          ? product.categories.map((c: any) => typeof c === 'string' ? c : c.name).join(', ')
                          : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        {product.collections && product.collections.length > 0
                          ? product.collections.map((c: any) => typeof c === 'string' ? c : c.name).join(', ')
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
                            title={product.isEssential ? "Retirer des Essentiels" : "Ajouter aux Essentiels"}
                            onClick={() => {
                              api.fetchWithAuth(`/products/${product.id}/essential`, { method: 'PATCH', body: JSON.stringify({ isEssential: !product.isEssential }) })
                                .then(() => {
                                  setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isEssential: !p.isEssential } : p));
                                  setToast({ message: product.isEssential ? 'Retiré des Essentiels' : 'Ajouté aux Essentiels', type: 'success' });
                                })
                                .catch(() => setToast({ message: 'Erreur', type: 'error' }));
                            }}
                            style={{ color: product.isEssential ? '#f59e0b' : '#9ca3af' }}
                          >
                            <Star size={18} fill={product.isEssential ? '#f59e0b' : 'none'} />
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
          
          <div className="admin-table-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span className="text-sm text-muted">
              Affichage de {visibleProducts.length} sur {filteredProducts.length} produit(s)
            </span>
            {hasMore && (
              <button 
                className="admin-btn-primary text-sm"
                onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
              >
                Charger plus ({Math.min(PAGE_SIZE, filteredProducts.length - visibleCount)})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
