import React, { useState, useEffect, useRef } from 'react';
import { Toast, ToastType } from './shared';

interface Section {
  key: string;
  name: string;
}

const SECTIONS: Section[] = [
  { key: 'korean-beauty', name: 'Korean Beauty Banner' },
  { key: 'makeup-parfums', name: 'Maquillage & Parfums Banner' },
  { key: 'essentials', name: 'Nos Essentiels' },
  { key: 'best_sellers', name: 'Produits Populaires' },
];

export function BannersTab() {
  const [banners, setBanners] = useState<Record<string, { imageUrl: string; linkUrl: string; title: string }>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    fetch('/api/admin/banners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const map = data.reduce((acc: any, item: any) => ({
            ...acc,
            [item.section]: { imageUrl: item.imageUrl, linkUrl: item.linkUrl || '', title: item.title || '' }
          }), {});
          setBanners(map);
        }
      });
  }, []);

  const handleUpdate = async (key: string, data: { imageUrl: string; linkUrl: string; title: string }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: key, imageUrl: data.imageUrl, linkUrl: data.linkUrl, title: data.title }),
      });
      if (res.ok) {
        setToast({ message: 'Bannière mise à jour', type: 'success' });
      } else {
        throw new Error('Failed');
      }
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
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const { url } = await res.json();
        setBanners(prev => ({
          ...prev,
          [key]: { ...(prev[key] || { linkUrl: '', title: '' }), imageUrl: url }
        }));
        setToast({ message: 'Image téléchargée avec succès', type: 'success' });
      } else {
        throw new Error('Upload failed');
      }
    } catch {
      setToast({ message: "Erreur lors du téléchargement de l'image", type: 'error' });
    } finally {
      setLoading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="admin-tab">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h2>Gestion des Bannières (Page d'Accueil)</h2>
      <div className="admin-grid" style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
        {SECTIONS.map(section => {
          const currentData = banners[section.key] || { imageUrl: '', linkUrl: '', title: '' };
          return (
            <div key={section.key} className="admin-card" style={{ padding: '20px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3>{section.name}</h3>
              
              {currentData.imageUrl && (
                <img 
                  src={currentData.imageUrl} 
                  alt={section.name} 
                  style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', border: '1px dashed #ccc', borderRadius: '8px' }} 
                />
              )}

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Uploader une Image :</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, section.key)} 
                  disabled={loading}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Lien de redirection :</label>
                <input
                  type="text"
                  placeholder="/korean-beauty ou /produit/..."
                  value={currentData.linkUrl}
                  onChange={(e) => setBanners(prev => ({ ...prev, [section.key]: { ...currentData, linkUrl: e.target.value } }))}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Titre (Optionnel) :</label>
                <input
                  type="text"
                  placeholder="Ex: Nouveautés"
                  value={currentData.title}
                  onChange={(e) => setBanners(prev => ({ ...prev, [section.key]: { ...currentData, title: e.target.value } }))}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <button 
                className="admin-btn-primary" 
                onClick={() => handleUpdate(section.key, currentData)}
                disabled={loading || !currentData.imageUrl}
                style={{ marginTop: '10px' }}
              >
                Sauvegarder la Bannière
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
