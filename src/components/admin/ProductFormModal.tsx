import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Languages, Search, ChevronDown, Check, Crop } from 'lucide-react';
import { AdminProduct, Category, api } from './mockData';
import { publicAssetUrl } from '../../lib/publicUrl';
import { ProductCard } from '../ProductCard';
import { ImageCropperModal } from './ImageCropperModal';

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
          step: '',
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

              {/* Step selector based on category */}
              {(() => {
                const cats = (formData.categories || []).map((c: any) => typeof c === 'string' ? c : c.name);
                const kBeauty = cats.includes('K-Beauty');
                const maquillage = cats.includes('Maquillage');
                const parfums = cats.includes('Parfums');
                const complements = cats.includes('Compléments');

                const steps: { label: string; options: string[] } | null =
                  kBeauty ? {
                    label: 'Étape K-Beauty',
                    options: ['1 - Huile Démaquillante', '2 - Nettoyant Moussant', '3 - Exfoliant', '4 - Lotion Tonique', '5 - Essence', '6 - Sérum & Ampoule', '7 - Masque Tissu', '8 - Contour des Yeux', '9 - Crème Hydratante', '10 - Crème Solaire']
                  } :
                  maquillage ? {
                    label: 'Section Maquillage',
                    options: ['Teint', 'Yeux', 'Lèvres', 'Démaquillage']
                  } :
                  parfums ? {
                    label: 'Type Parfum',
                    options: ['Parfums Femme', 'Parfums Homme']
                  } :
                  complements ? {
                    label: 'Objectif Complément',
                    options: ['Sommeil', 'Stress', 'Digestion', 'Poids & Métabolisme', 'Immunité', 'Beauté']
                  } : null;

                if (!steps) return null;

                return (
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>{steps.label}</label>
                      <select
                        name="step"
                        className="admin-input"
                        value={formData.step || ''}
                        onChange={handleChange}
                      >
                        <option value="">— Sélectionner —</option>
                        {steps.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })()}

              <div className="form-section-title">Organisation</div>
              <div className="form-row">
                <ChipPicker
                  label="Catégories"
                  required
                  options={categories}
                  selected={formData.categories || []}
                  onChange={cats => setFormData(prev => ({ ...prev, categories: cats }))}
                  placeholder="Rechercher une catégorie..."
                />
                <ChipPicker
                  label="Collections / Sections"
                  options={collections}
                  selected={formData.collections || []}
                  onChange={cols => setFormData(prev => ({ ...prev, collections: cols }))}
                  placeholder="Rechercher une collection..."
                />
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
