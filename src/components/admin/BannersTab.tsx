import React, { useState, useEffect } from 'react';
import { Toast, ToastType } from './shared';

interface Section {
  key: string;
  name: string;
  defaultImage?: string;
}

interface SectionGroup {
  title: string;
  sections: Section[];
}

const SECTION_GROUPS: SectionGroup[] = [
  {
    title: 'Page d\'Accueil',
    sections: [
      { key: 'korean-beauty', name: 'Korean Beauty Banner', defaultImage: '/logo.png' },
      { key: 'makeup-parfums', name: 'Maquillage & Parfums Banner', defaultImage: '/logo.png' },
      { key: 'essentials', name: 'Nos Essentiels', defaultImage: 'ca  quon va utiiser.png' },
      { key: 'best_sellers', name: 'Produits Populaires', defaultImage: '19bd7403-d2ac-49a4-a584-be5895add421.png' },
    ]
  },
  {
    title: 'Korean Beauty (10 Étapes)',
    sections: [
      { key: 'kb-oil-cleanser', name: '01. Oil Cleanser', defaultImage: '/logo.png' },
      { key: 'kb-foam-cleanser', name: '02. Foam Cleanser', defaultImage: '/logo.png' },
      { key: 'kb-exfoliator', name: '03. Exfoliator', defaultImage: '/logo.png' },
      { key: 'kb-toner', name: '04. Toner', defaultImage: '/logo.png' },
      { key: 'kb-essence', name: '05. Essence', defaultImage: '/logo.png' },
      { key: 'kb-serum', name: '06. Serum & Ampoule', defaultImage: '/logo.png' },
      { key: 'kb-sheet-mask', name: '07. Sheet Mask', defaultImage: '/logo.png' },
      { key: 'kb-eye-cream', name: '08. Eye Cream', defaultImage: '/logo.png' },
      { key: 'kb-moisturizer', name: '09. Moisturizer', defaultImage: '/logo.png' },
      { key: 'kb-sunscreen', name: '10. Sunscreen', defaultImage: '/logo.png' },
    ]
  },
  {
    title: 'Maquillage & Parfums',
    sections: [
      { key: 'mp-teint', name: 'Teint', defaultImage: '/logo.png' },
      { key: 'mp-yeux', name: 'Yeux', defaultImage: '/logo.png' },
      { key: 'mp-levres', name: 'Lèvres', defaultImage: '/logo.png' },
      { key: 'mp-demaquillage', name: 'Démaquillage', defaultImage: '/logo.png' },
      { key: 'mp-parfums-femme', name: 'Parfums Femme', defaultImage: '/logo.png' },
      { key: 'mp-parfums-homme', name: 'Parfums Homme', defaultImage: '/logo.png' },
    ]
  },
  {
    title: 'Compléments Alimentaires',
    sections: [
      { key: 'complements-hero', name: 'Hero Banner Compléments', defaultImage: '/logo.png' },
    ]
  }
];

export function BannersTab() {
  const [banners, setBanners] = useState<Record<string, { imageUrl: string; linkUrl: string; title: string }>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [activeGroup, setActiveGroup] = useState<number>(0);

  useEffect(() => {
    import('./mockData').then(({ api }) => {
      api.fetchWithAuth('/banners')
        .then(data => {
          if (Array.isArray(data)) {
            const map = data.reduce((acc: any, item: any) => ({
              ...acc,
              [item.section]: { imageUrl: item.imageUrl, linkUrl: item.linkUrl || '', title: item.title || '' }
            }), {});
            setBanners(map);
          }
        })
        .catch(() => setToast({ message: 'Erreur lors du chargement des bannières', type: 'error' }));
    });
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

      await api.fetchWithAuth('/banners', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      setToast({ message: 'Bannière mise à jour', type: 'success' });
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
        setToast({ message: 'Image chargée localement (N\'oubliez pas de sauvegarder)', type: 'info' });
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
          return (
            <div key={section.key} className="admin-card" style={{ padding: '20px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>{section.name}</h3>
              
              {currentData.imageUrl ? (
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden' }}>
                  <img 
                    src={currentData.imageUrl} 
                    alt={section.name} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              ) : section.defaultImage ? (
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden' }}>
                  <img 
                    src={section.defaultImage.startsWith('/') ? section.defaultImage : `/uploads/${section.defaultImage}`} 
                    alt={section.name} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} 
                  />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)' }}>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.8)', padding: '4px 8px', borderRadius: '4px', color: '#374151', fontSize: '0.8rem', fontWeight: 500 }}>Image par défaut</span>
                  </div>
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
