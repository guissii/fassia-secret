import React, { useState, useEffect } from 'react';
import { Toast, ToastType } from './shared';

interface Section {
  key: string;
  name: string;
}

const SECTIONS: Section[] = [
  { key: 'essentials', name: 'Essentiels' },
  { key: 'best_sellers', name: 'Meilleures Ventes' },
  { key: 'korean-beauty', name: 'Korean Beauty' },
  { key: 'makeup-parfums', name: 'Maquillage & Parfums' },
];

export function BannersTab() {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    fetch('/api/admin/sections')
      .then(res => res.json())
      .then(data => {
        const map = data.reduce((acc: any, item: any) => ({ ...acc, [item.sectionKey]: item.bannerImage }), {});
        setConfigs(map);
      });
  }, []);

  const handleUpdate = async (key: string, image: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionKey: key, bannerImage: image }),
      });
      if (res.ok) {
        setConfigs(prev => ({ ...prev, [key]: image }));
        setToast({ message: 'Bannière mise à jour', type: 'success' });
      }
    } catch {
      setToast({ message: 'Erreur lors de la mise à jour', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-tab">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h2>Gestion des Bannières</h2>
      <div className="admin-grid" style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
        {SECTIONS.map(section => (
          <div key={section.key} className="admin-card" style={{ padding: '20px', border: '1px solid #eee' }}>
            <h3>{section.name}</h3>
            <input
              type="text"
              placeholder="Nom du fichier image (ex: banner.png)"
              value={configs[section.key] || ''}
              onChange={(e) => setConfigs(prev => ({ ...prev, [section.key]: e.target.value }))}
              style={{ width: '100%', padding: '8px', margin: '10px 0' }}
            />
            <button 
              className="admin-btn-primary" 
              onClick={() => handleUpdate(section.key, configs[section.key])}
              disabled={loading}
            >
              Enregistrer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
