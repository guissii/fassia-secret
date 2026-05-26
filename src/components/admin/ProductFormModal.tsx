import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Languages } from 'lucide-react';
import { AdminProduct, Category, api } from './mockData';
import { publicAssetUrl } from '../../lib/publicUrl';
import { ProductCard } from '../ProductCard';

interface ProductFormModalProps {
  product: AdminProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: AdminProduct) => void;
}

export function ProductFormModal({ product, isOpen, onClose, onSave }: ProductFormModalProps) {
  const [formData, setFormData] = useState<Partial<AdminProduct & { nameAr?: string, descriptionAr?: string }>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [concernInput, setConcernInput] = useState('');
  const [previewLang, setPreviewLang] = useState<'fr' | 'ar'>('fr');

  const loadCategories = async () => {
    const cats = await api.getCategories();
    setCategories(cats);
    const cols = await api.getCollections();
    setCollections(cols);
  };

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({ ...product });
      } else {
        setFormData({
          name: '',
          nameAr: '',
          brand: '',
          description: '',
          descriptionAr: '',
          price: 0,
          stock: 0,
          categories: [],
          collections: [],
          concerns: [],
          isVisible: true,
          isArchived: false,
          salesCount: 0,
          tags: [],
          image: '',
        });
      }
      loadCategories();
    }
  }, [isOpen, product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags?.filter(t => t !== tagToRemove) 
    }));
  };

  const handleAddConcern = () => {
    if (concernInput.trim() && !formData.concerns?.includes(concernInput.trim())) {
      setFormData(prev => ({ ...prev, concerns: [...(prev.concerns || []), concernInput.trim()] }));
      setConcernInput('');
    }
  };

  const handleRemoveConcern = (concernToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      concerns: prev.concerns?.filter(c => c !== concernToRemove) 
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Obligatory fields based on user feedback
    if (!formData.name || !formData.nameAr || formData.price === undefined || !formData.categories || formData.categories.length === 0) {
      alert("Veuillez remplir les champs obligatoires (Nom FR/AR, Prix, Catégories)");
      setLoading(false);
      return;
    }
    
    try {
      // Map category names to IDs
      const categoryIds = formData.categories
        .map(name => categories.find(c => c.name === name)?.id)
        .filter(Boolean);

      // Map collection names to IDs
      const collectionIds = (formData.collections || [])
        .map(name => collections.find(c => c.name === name)?.id)
        .filter(Boolean);

      const payload = {
        ...formData,
        categoryIds,
        collectionIds
      };

      let response;
      if (isEditing && product?.id) {
        response = await api.fetchWithAuth(`/products/${product.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        response = await api.fetchWithAuth('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      // Convert backend product format to frontend AdminProduct format
      const backendProduct = response.product;
      const formattedProduct = {
        ...backendProduct,
        categories: backendProduct.categories?.map((c: any) => c.name) || [],
        collections: backendProduct.collections?.map((c: any) => c.name) || [],
      };

      onSave(formattedProduct as AdminProduct);
      onClose();
    } catch (error: any) {
      alert("Erreur lors de l'enregistrement : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEditing = !!product;

  const previewName = previewLang === 'fr' ? (formData.name || 'Nom du produit') : (formData.nameAr || formData.name || 'اسم المنتج');
  const previewDesc = previewLang === 'fr' ? (formData.description || 'Description du produit') : (formData.descriptionAr || formData.description || 'وصف المنتج');

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-content product-form-modal large-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Éditer le produit' : 'Nouveau produit'}</h3>
          <button className="admin-mobile-close" onClick={onClose} style={{ display: 'block' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form-container">
          <div className="product-split-layout">
            
            {/* Left Column: Form */}
            <div className="product-form-side">
              
              <div className="form-section-title">Informations de base</div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Nom du produit (FR) *</label>
                  <input type="text" name="name" className="admin-input" value={formData.name || ''} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }} dir="rtl">
                  <label style={{ textAlign: 'right', display: 'block' }}>* (AR) اسم المنتج</label>
                  <input type="text" name="nameAr" className="admin-input" value={formData.nameAr || ''} onChange={handleChange} required dir="rtl" />
                </div>
              </div>

              <div className="form-group">
                <label>Marque</label>
                <input type="text" name="brand" className="admin-input" value={formData.brand || ''} onChange={handleChange} />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Description (FR)</label>
                  <textarea name="description" className="admin-input" rows={4} value={formData.description || ''} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ flex: 1 }} dir="rtl">
                  <label style={{ textAlign: 'right', display: 'block' }}>* الوصف (AR)</label>
                  <textarea name="descriptionAr" className="admin-input" rows={4} value={formData.descriptionAr || ''} onChange={handleChange} dir="rtl" required />
                </div>
              </div>

              <div className="form-section-title">Médias</div>
              <div className="form-group">
                <label>Image du produit</label>
                <div className="image-upload-area">
                  {formData.image ? (
                    <div className="image-preview">
                      <img src={formData.image.startsWith('data:') || formData.image.startsWith('blob:') || formData.image.startsWith('http') ? formData.image : publicAssetUrl(formData.image)} alt="Preview" />
                      <button type="button" className="remove-image-btn" onClick={() => setFormData(prev => ({ ...prev, image: '' }))}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-placeholder">
                      <Upload size={24} />
                      <span>Cliquez ou glissez une image</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>

              <div className="form-section-title">Tarification & Inventaire</div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Prix actuel (MAD) *</label>
                  <input type="number" name="price" className="admin-input" min="0" step="0.01" value={formData.price || ''} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Prix barré (MAD)</label>
                  <input type="number" name="oldPrice" className="admin-input" min="0" step="0.01" value={formData.oldPrice || ''} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Stock *</label>
                  <input type="number" name="stock" className="admin-input" min="0" value={formData.stock || 0} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-section-title">Organisation</div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Catégories *</label>
                  <div className="checkbox-list">
                    {categories.map(c => (
                      <label key={c.id}>
                        <input type="checkbox" checked={formData.categories?.includes(c.name) || false} onChange={(e) => {
                          if (e.target.checked) setFormData(prev => ({ ...prev, categories: [...(prev.categories || []), c.name] }));
                          else setFormData(prev => ({ ...prev, categories: prev.categories?.filter(n => n !== c.name) }));
                        }} />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Collections / Sections</label>
                  <div className="checkbox-list">
                    {collections.map(c => (
                      <label key={c.id}>
                        <input type="checkbox" checked={formData.collections?.includes(c.name) || false} onChange={(e) => {
                          if (e.target.checked) setFormData(prev => ({ ...prev, collections: [...(prev.collections || []), c.name] }));
                          else setFormData(prev => ({ ...prev, collections: prev.collections?.filter(n => n !== c.name) }));
                        }} />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Tags & Badges (ex: Nouveau, -20%)</label>
                <div className="tags-input-container">
                  <div className="tags-list">
                    {formData.tags?.map(tag => (
                      <span key={tag} className="tag-chip">{tag}<button type="button" onClick={() => handleRemoveTag(tag)}><X size={12} /></button></span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input type="text" className="admin-input" placeholder="Ajouter un tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} />
                    <button type="button" className="admin-btn-outline" onClick={handleAddTag}><Plus size={16} /></button>
                  </div>
                </div>
              </div>

              <div className="form-group toggle-group" style={{ marginTop: '1rem' }}>
                <label className="toggle-label">
                  <div>
                    <span style={{ fontWeight: 500 }}>Visibilité</span>
                    <p className="text-muted text-sm" style={{ margin: 0 }}>Afficher le produit sur la boutique</p>
                  </div>
                  <div className="switch-wrapper">
                    <input type="checkbox" name="isVisible" checked={formData.isVisible !== false} onChange={handleChange} />
                    <span className="slider round"></span>
                  </div>
                </label>
              </div>

            </div>
            
            {/* Right Column: Live Preview */}
            <div className="product-preview-side">
              <div className="preview-header">
                <h4><Languages size={18} /> Simulation en direct</h4>
                <div className="lang-toggle">
                  <button type="button" className={previewLang === 'fr' ? 'active' : ''} onClick={() => setPreviewLang('fr')}>FR</button>
                  <button type="button" className={previewLang === 'ar' ? 'active' : ''} onClick={() => setPreviewLang('ar')}>AR</button>
                </div>
              </div>
              <div className="preview-canvas-wrapper">
                <div className="preview-canvas" dir={previewLang === 'ar' ? 'rtl' : 'ltr'}>
                  <ProductCard 
                    product={{
                      id: 999,
                      name: previewName,
                      image: formData.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop',
                      price: formData.price || 0,
                      oldPrice: formData.oldPrice,
                      description: previewDesc,
                      badge: formData.tags && formData.tags.length > 0 ? formData.tags[0] : undefined
                    }}
                    label={formData.categories && formData.categories.length > 0 ? formData.categories[0] : 'CATÉGORIE'}
                  />
                </div>
              </div>
              <div className="preview-info">
                <p>Cet aperçu montre exactement comment la carte produit sera affichée dans la boutique. Changez de langue pour vérifier les deux affichages.</p>
              </div>
            </div>
          </div>

          <div className="admin-modal-actions" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--admin-border)' }}>
            <button type="button" className="admin-btn-outline" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="admin-btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Créer le produit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
