import React, { useState, useEffect } from 'react';
import { Toast, ToastType } from './shared';

interface Section {
  key: string;
  name: string;
}

interface SectionGroup {
  title: string;
  sections: Section[];
}

const SECTION_GROUPS: SectionGroup[] = [
  {
    title: 'Page d\'Accueil',
    sections: [
      { key: 'korean-beauty', name: 'Korean Beauty Banner' },
      { key: 'makeup-parfums', name: 'Maquillage & Parfums Banner' },
      { key: 'essentials', name: 'Nos Essentiels' },
      { key: 'best_sellers', name: 'Produits Populaires' },
    ]
  },
  {
    title: 'Korean Beauty (10 Étapes)',
    sections: [
      { key: 'kb-oil-cleanser', name: '01. Oil Cleanser' },
      { key: 'kb-foam-cleanser', name: '02. Foam Cleanser' },
      { key: 'kb-exfoliator', name: '03. Exfoliator' },
      { key: 'kb-toner', name: '04. Toner' },
      { key: 'kb-essence', name: '05. Essence' },
      { key: 'kb-serum', name: '06. Serum & Ampoule' },
      { key: 'kb-sheet-mask', name: '07. Sheet Mask' },
      { key: 'kb-eye-cream', name: '08. Eye Cream' },
      { key: 'kb-moisturizer', name: '09. Moisturizer' },
      { key: 'kb-sunscreen', name: '10. Sunscreen' },
    ]
  },
  {
    title: 'Maquillage & Parfums',
    sections: [
      { key: 'mp-teint', name: 'Teint' },
      { key: 'mp-yeux', name: 'Yeux' },
      { key: 'mp-levres', name: 'Lèvres' },
      { key: 'mp-demaquillage', name: 'Démaquillage' },
      { key: 'mp-parfums-femme', name: 'Parfums Femme' },
      { key: 'mp-parfums-homme', name: 'Parfums Homme' },
    ]
  },
  {
    title: 'Compléments Alimentaires',
    sections: [
      { key: 'complements-hero', name: 'Hero Banner Compléments' },
    ]
  }
];

export function BannersTab() {
  const [banners, setBanners] = useState<Record<string, { imageUrl: string; linkUrl: string; title: string }>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [activeGroup, setActiveGroup] = useState<number>(0);

  const loadBanners = async () => {
    try {
      const { api } = await import('./mockData');
      const data = await api.fetchWithAuth('/banners');
      if (Array.isArray(data)) {
        const map = data.reduce((acc: any, item: any) => ({
          ...acc,
          [item.section]: { imageUrl: item.imageUrl, linkUrl: item.linkUrl || '', title: item.title || '' }
        }), {});
        setBanners(map);
      }
    } catch {
      setToast({ message: 'Erreur lors du chargement des bannières', type: 'error' });
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleUpdate = async (key: string, data: { imageUrl: string; linkUrl: string; title: string }) => {
    setLoading(true);
    try {
      const { api } = await import('./mockData');
      
      // If imageUrl is base64, send it as imageData
      const payload: any = { section: key, linkUrl: data.linkUrl, title: data.title };
      if (data.imageUrl.startsWith('data:image')) {
        payload.imageData = data.imageUrl;
      } else {
        payload.imageUrl = data.imageUrl;
      }

      const savedBanner = await api.fetchWithAuth('/banners', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      // Update local state with the saved banner data from the server
      setBanners(prev => ({
        ...prev,
        [key]: { 
          imageUrl: savedBanner.imageUrl, 
          linkUrl: savedBanner.linkUrl || '', 
          title: savedBanner.title || '' 
        }
      }));
      
      setToast({ message: 'Bannière mise à jour avec succès ✓', type: 'success' });
    } catch {
      setToast({ message: 'Erreur lors de la mise à jour', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setLoading(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setBanners(prev => ({
          ...prev,
          [key]: { ...(prev[key] || { linkUrl: '', title: '' }), imageUrl: base64data }
        }));
        setToast({ message: 'Image chargée — cliquez "Sauvegarder" pour confirmer', type: 'info' });
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setToast({ message: "Erreur lors du traitement de l'image", type: 'error' });
      setLoading(false);
    } finally {
      e.target.value = '';
    }
  };

  // Helper to get display-ready image src
  const getImageSrc = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('http') || url.startsWith('blob:')) return url;
    return `/${url}`;
  };

  return (
    <div className="admin-tab">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="admin-header-flex">
        <h2>Gestion des Bannières & Images</h2>
      </div>
      <p className="admin-subtitle" style={{ marginBottom: '20px' }}>
        Gérez les images hero et bannières de toutes les pages.
      </p>

      {/* Group Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
        {SECTION_GROUPS.map((group, idx) => (
          <button
            key={idx}
            onClick={() => setActiveGroup(idx)}
            className={activeGroup === idx ? 'admin-btn-primary' : 'admin-btn-outline'}
            style={{ whiteSpace: 'nowrap' }}
          >
            {group.title}
          </button>
        ))}
      </div>

      <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {SECTION_GROUPS[activeGroup].sections.map(section => {
          const currentData = banners[section.key] || { imageUrl: '', linkUrl: '', title: '' };
          const displaySrc = getImageSrc(currentData.imageUrl);
          
          return (
            <div key={section.key} className="admin-card" style={{ padding: '20px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>{section.name}</h3>
              
              {displaySrc ? (
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden' }}>
                  <img 
                    src={displaySrc} 
                    alt={section.name} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              ) : (
                <div style={{ width: '100%', paddingTop: '56.25%', background: '#f3f4f6', borderRadius: '8px', border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#9ca3af', fontSize: '0.9rem' }}>Aucune image</span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '6px', fontWeight: 500 }}>Uploader une Image :</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, section.key)} 
                  disabled={loading}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '6px', fontWeight: 500 }}>Lien de redirection :</label>
                <input
                  type="text"
                  placeholder="/korean-beauty ou /produit/..."
                  value={currentData.linkUrl}
                  onChange={(e) => setBanners(prev => ({ ...prev, [section.key]: { ...currentData, linkUrl: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '6px', fontWeight: 500 }}>Titre (Optionnel) :</label>
                <input
                  type="text"
                  placeholder="Ex: Nouveautés"
                  value={currentData.title}
                  onChange={(e) => setBanners(prev => ({ ...prev, [section.key]: { ...currentData, title: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
                />
              </div>

              <button 
                className="admin-btn-primary" 
                onClick={() => handleUpdate(section.key, currentData)}
                disabled={loading || !currentData.imageUrl}
                style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}
              >
                Sauvegarder
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
