import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Languages, Search, ChevronDown, Check, Crop } from 'lucide-react';
import { AdminProduct, Category, api } from './mockData';
import { publicAssetUrl } from '../../lib/publicUrl';
import { ProductCard } from '../ProductCard';
import { ImageCropperModal } from './ImageCropperModal';
import { HierarchicalCategoryPicker, CategorySelection } from './HierarchicalCategoryPicker';
import { CATEGORY_COLLECTIONS_DATA } from './categoryCollectionsData';

/* ── Reusable Multi-Select Chip Picker ── */
interface ChipPickerProps {
  label: string;
  required?: boolean;
  options: { id: string; name: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

function ChipPicker({ label, required, options, selected, onChange, placeholder }: ChipPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));
  const toggle = (name: string) => {
    onChange(selected.includes(name) ? selected.filter(n => n !== name) : [...selected, name]);
  };
  const remove = (name: string) => onChange(selected.filter(n => n !== name));

  return (
    <div className="form-group chip-picker-group" ref={wrapperRef}>
      <label>{label} {required && '*'}</label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="chip-picker-chips">
          {selected.map(name => (
            <span key={name} className="chip-picker-chip">
              {name}
              <button type="button" onClick={() => remove(name)} aria-label={`Retirer ${name}`}><X size={12} /></button>
            </span>
          ))}
        </div>
      )}

      {/* Trigger / search */}
      <div className={`chip-picker-trigger ${open ? 'is-open' : ''}`} onClick={() => setOpen(true)}>
        <Search size={14} className="chip-picker-search-icon" />
        <input
          type="text"
          className="chip-picker-input"
          placeholder={placeholder || 'Rechercher...'}
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        <ChevronDown size={16} className={`chip-picker-chevron ${open ? 'rotated' : ''}`} />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="chip-picker-dropdown">
          {filtered.length === 0 && (
            <div className="chip-picker-empty">Aucun résultat</div>
          )}
          {filtered.map(o => {
            const isActive = selected.includes(o.name);
            return (
              <button
                key={o.id}
                type="button"
                className={`chip-picker-option ${isActive ? 'is-selected' : ''}`}
                onClick={() => toggle(o.name)}
              >
                <span className="chip-picker-check">{isActive && <Check size={14} />}</span>
                {o.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Convert flat categories/collections arrays to hierarchical selection format
function toHierarchicalSelection(
  categories: string[],
  collections: string[]
): CategorySelection[] {
  const result: CategorySelection[] = [];
  
  // Map category names to their data
  for (const catName of categories) {
    const catData = CATEGORY_COLLECTIONS_DATA.find(
      c => c.category === catName || c.slug === catName.toLowerCase().replace(/\s+/g, '-')
    );
    
    if (catData) {
      // Find collections that belong to this category AND are in the selected collections
      const catCollections = collections.filter(coll => 
        catData.collections.includes(coll)
      );
      
      result.push({
        categorySlug: catData.slug,
        categoryName: catData.category,
        collections: catCollections
      });
    }
  }
  
  return result;
}

// Convert hierarchical selection back to flat arrays
function fromHierarchicalSelection(
  selection: CategorySelection[]
): { categories: string[]; collections: string[] } {
  const categories: string[] = [];
  const collections: string[] = [];
  
  for (const sel of selection) {
    categories.push(sel.categoryName);
    collections.push(...sel.collections);
  }
  
  // Also add any collections from selected categories that might not be explicitly selected
  // but are needed for proper categorization
  return { categories, collections };
}

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
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);

  const loadCategories = async () => {
    const cats = await api.getCategories();
    setCategories(cats);
    const cols = await api.getCollections();
    setCollections(cols);
  };

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          ...product,
          categories: (product.categories || []).map((c: any) => typeof c === 'string' ? c : c.name),
          collections: (product.collections || []).map((c: any) => typeof c === 'string' ? c : c.name),
        });
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
          supplementFocus: null,
          makeupStep: null,
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

  const getDisplayImageSrc = (src: string | undefined) => {
    if (!src) return '';
    return src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http') ? src : publicAssetUrl(src);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperSrc(reader.result as string); // Open cropper instead of setting directly
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Obligatory fields based on user feedback
    if (!formData.name || formData.price === undefined || !formData.categories || formData.categories.length === 0) {
      alert("Veuillez remplir les champs obligatoires (Nom FR, Prix, Catégories)");
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
    <>
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
                  <label style={{ textAlign: 'right', display: 'block' }}>(AR) اسم المنتج</label>
                  <input type="text" name="nameAr" className="admin-input" value={formData.nameAr || ''} onChange={handleChange} dir="rtl" />
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
                  <label style={{ textAlign: 'right', display: 'block' }}>الوصف (AR)</label>
                  <textarea name="descriptionAr" className="admin-input" rows={4} value={formData.descriptionAr || ''} onChange={handleChange} dir="rtl" />
                </div>
              </div>

              <div className="form-section-title">Médias</div>
              <div className="form-group">
                <label>Image du produit</label>
                <div className="image-upload-area">
                  {formData.image ? (
                    <div className="image-preview">
                      <img src={getDisplayImageSrc(formData.image)} alt="Preview" />
                      <div className="image-actions" style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                        <button type="button" className="admin-btn-secondary" style={{ padding: 6 }} onClick={() => setCropperSrc(getDisplayImageSrc(formData.image))} title="Recadrer">
                          <Crop size={16} />
                        </button>
                        <button type="button" className="remove-image-btn" style={{ position: 'static' }} onClick={() => setFormData(prev => ({ ...prev, image: '' }))} title="Supprimer">
                          <X size={16} />
                        </button>
                      </div>
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
                  <label>Prix client (MAD) *</label>
                  <input type="number" name="price" className="admin-input" min="0" step="0.01" value={formData.price || ''} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Ancien prix barré (MAD)</label>
                  <input type="number" name="oldPrice" className="admin-input" min="0" step="0.01" value={formData.oldPrice || ''} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Stock *</label>
                  <input type="number" name="stock" className="admin-input" min="0" value={formData.stock || 0} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Prix promo (avec code) (MAD)</label>
                  <input type="number" name="promoPrice" className="admin-input" min="0" step="0.01" value={formData.promoPrice || ''} onChange={handleChange} />
                  <p className="text-muted text-sm" style={{ margin: '0.25rem 0 0 0' }}>Prix affiché lorsqu'un code promo valide est appliqué</p>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Prix grossiste &lt; 10 produits (MAD)</label>
                  <input type="number" name="wholesalePrice" className="admin-input" min="0" step="0.01" value={formData.wholesalePrice || ''} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Prix grossiste ≥ 10 produits (MAD)</label>
                  <input type="number" name="bulkWholesalePrice" className="admin-input" min="0" step="0.01" value={formData.bulkWholesalePrice || ''} onChange={handleChange} />
                </div>
              </div>

              <div className="form-section-title">Organisation</div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Catégories et Collections *</label>
                <p className="text-muted text-sm" style={{ margin: '0.25rem 0 0.5rem 0' }}>
                  Sélectionnez une ou plusieurs catégories, puis les collections associées pour chaque catégorie
                </p>
                <HierarchicalCategoryPicker
                  selected={toHierarchicalSelection(formData.categories || [], formData.collections || [])}
                  onChange={(selection) => {
                    const { categories, collections } = fromHierarchicalSelection(selection);
                    setFormData(prev => ({ ...prev, categories, collections }));
                  }}
                  placeholder="Rechercher catégories et collections..."
                />
              </div>

              {/* Étape Korean Beauty */}
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Étape Korean Beauty (1-10)</label>
                <select
                  name="koreanBeautyStep"
                  className="admin-input"
                  value={formData.koreanBeautyStep || ''}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                >
                  <option value="">-- Non applicable --</option>
                  <option value="1">01. Huile Démaquillante</option>
                  <option value="2">02. Nettoyant Moussant</option>
                  <option value="3">03. Exfoliant</option>
                  <option value="4">04. Lotion Tonique</option>
                  <option value="5">05. Essence</option>
                  <option value="6">06. Sérum & Ampoule</option>
                  <option value="7">07. Masque Tissu</option>
                  <option value="8">08. Contour des Yeux</option>
                  <option value="9">09. Crème Hydratante</option>
                  <option value="10">10. Crème Solaire</option>
                </select>
                <p className="text-muted text-sm" style={{ margin: '0.25rem 0 0 0' }}>
                  Si le produit appartient à Korean Beauty, choisissez son étape
                </p>
              </div>

              {/* Focus Compléments Alimentaires */}
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Focus Compléments Alimentaires</label>
                <select
                  name="supplementFocus"
                  className="admin-input"
                  value={formData.supplementFocus || ''}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                >
                  <option value="">-- Non applicable --</option>
                  <option value="sleep">😴 Sommeil & Relaxation</option>
                  <option value="stress">🧘 Stress & Humeur</option>
                  <option value="digest">🥗 Digestion & Probiotiques</option>
                  <option value="metabolic">⚖️ Poids & Métabolisme</option>
                  <option value="immunity">🛡️ Immunité & Ruche</option>
                  <option value="beauty">✨ Beauté In & Out</option>
                </select>
                <p className="text-muted text-sm" style={{ margin: '0.25rem 0 0 0' }}>
                  Si le produit est un complément alimentaire, choisissez son focus
                </p>
              </div>

              {/* Étape Maquillage */}
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Étape Maquillage (1-11)</label>
                <select
                  name="makeupStep"
                  className="admin-input"
                  value={formData.makeupStep || ''}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                >
                  <option value="">-- Non applicable --</option>
                  <option value="1">01. Base & Primer</option>
                  <option value="2">02. Fond de Teint</option>
                  <option value="3">03. Correcteur</option>
                  <option value="4">04. Poudre</option>
                  <option value="5">05. Blush & Bronzer</option>
                  <option value="6">06. Sourcils</option>
                  <option value="7">07. Fard à Paupières</option>
                  <option value="8">08. Eyeliner</option>
                  <option value="9">09. Mascara</option>
                  <option value="10">10. Rouge à Lèvres</option>
                  <option value="11">11. Fixateur & Spray</option>
                </select>
                <p className="text-muted text-sm" style={{ margin: '0.25rem 0 0 0' }}>
                  Si le produit est un maquillage, choisissez son étape
                </p>
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

              <div className="form-group toggle-group" style={{ marginTop: '0.5rem' }}>
                <label className="toggle-label">
                  <div>
                    <span style={{ fontWeight: 500 }}>Meilleure vente</span>
                    <p className="text-muted text-sm" style={{ margin: 0 }}>Afficher dans la section Meilleures ventes</p>
                  </div>
                  <div className="switch-wrapper">
                    <input type="checkbox" name="isEssential" checked={formData.isEssential === true} onChange={handleChange} />
                    <span className="slider round"></span>
                  </div>
                </label>
              </div>

              <div className="form-group toggle-group" style={{ marginTop: '0.5rem' }}>
                <label className="toggle-label">
                  <div>
                    <span style={{ fontWeight: 500 }}>En promotion</span>
                    <p className="text-muted text-sm" style={{ margin: 0 }}>Afficher dans la section Promotions</p>
                  </div>
                  <div className="switch-wrapper">
                    <input type="checkbox" name="isPromo" checked={formData.isPromo === true} onChange={handleChange} />
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
                      badge: formData.oldPrice && formData.price && formData.oldPrice > formData.price
                        ? `-${Math.round(((formData.oldPrice - formData.price) / formData.oldPrice) * 100)}%`
                        : undefined
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

      {/* Image Cropper Modal */}
      {cropperSrc && (
        <ImageCropperModal
          imageSrc={cropperSrc}
          aspectRatio={4 / 5}
          aspectLabel="Produit (4:5)"
          onConfirm={(croppedBase64) => {
            setFormData(prev => ({ ...prev, image: croppedBase64 }));
            setCropperSrc(null);
          }}
          onCancel={() => setCropperSrc(null)}
        />
      )}
    </>
  );
}
