import React, { useState, useEffect } from 'react';
import { Save, Store, Truck, Share2, Users, Plus } from 'lucide-react';
import { api } from './mockData';
import { Toast, ToastType } from './shared';

interface SiteConfig {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  instagram: string;
  facebook: string;
}

export function SettingsTab() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Settings State
  const [settings, setSettings] = useState<SiteConfig>({
    storeName: 'Fassia Secret',
    storeEmail: 'contact@fassiasecret.com',
    storePhone: '+212 6 00 00 00 00',
    deliveryFee: 35,
    freeDeliveryThreshold: 800,
    instagram: 'https://instagram.com/fassiasecret',
    facebook: 'https://facebook.com/fassiasecret',
  });

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const res = await api.fetchWithAuth('/site-config');
        if (res.config) {
          setSettings({
            storeName: res.config.storeName,
            storeEmail: res.config.storeEmail,
            storePhone: res.config.storePhone,
            deliveryFee: res.config.deliveryFee,
            freeDeliveryThreshold: res.config.freeDeliveryThreshold,
            instagram: res.config.instagram,
            facebook: res.config.facebook,
          });
        }
      } catch {
        // fallback defaults
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      await api.fetchWithAuth('/site-config', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      setToast({ message: `Paramètres "${section}" sauvegardés avec succès`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur lors de la sauvegarde', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-settings-tab" style={{ paddingBottom: '2rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="admin-dashboard-header">
        <h2>Paramètres</h2>
        <p className="admin-subtitle">Configuration générale de la boutique</p>
      </div>

      <div style={{ display: 'grid', gap: '2rem', maxWidth: '800px' }}>
        {/* Informations Boutique */}
        <div className="admin-card">
          <div className="admin-card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Store size={20} className="text-primary" /> Informations générales
            </h3>
          </div>
          
          <div className="form-col" style={{ gap: '1.5rem' }}>
            <div className="form-group">
              <label>Nom de la boutique</label>
              <input type="text" className="admin-input" name="storeName" value={settings.storeName} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Email de contact</label>
                <input type="email" className="admin-input" name="storeEmail" value={settings.storeEmail} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Téléphone</label>
                <input type="text" className="admin-input" name="storePhone" value={settings.storePhone} onChange={handleChange} />
              </div>
            </div>
            <div>
              <button 
                className="admin-btn-primary" 
                onClick={() => handleSave('Informations')}
                disabled={saving}
              >
                <Save size={16} /> Sauvegarder
              </button>
            </div>
          </div>
        </div>

        {/* Livraison */}
        <div className="admin-card">
          <div className="admin-card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} className="text-primary" /> Options de livraison
            </h3>
          </div>
          
          <div className="form-col" style={{ gap: '1.5rem' }}>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Frais de livraison standard (MAD)</label>
                <input type="number" className="admin-input" name="deliveryFee" value={settings.deliveryFee} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Livraison gratuite à partir de (MAD)</label>
                <input type="number" className="admin-input" name="freeDeliveryThreshold" value={settings.freeDeliveryThreshold} onChange={handleChange} />
              </div>
            </div>
            <div>
              <button 
                className="admin-btn-primary" 
                onClick={() => handleSave('Livraison')}
                disabled={saving}
              >
                <Save size={16} /> Sauvegarder
              </button>
            </div>
          </div>
        </div>

        {/* Réseaux Sociaux */}
        <div className="admin-card">
          <div className="admin-card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Share2 size={20} className="text-primary" /> Réseaux sociaux
            </h3>
          </div>
          
          <div className="form-col" style={{ gap: '1.5rem' }}>
            <div className="form-group">
              <label>Lien Instagram</label>
              <input type="url" className="admin-input" name="instagram" value={settings.instagram} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Lien Facebook</label>
              <input type="url" className="admin-input" name="facebook" value={settings.facebook} onChange={handleChange} />
            </div>
            <div>
              <button 
                className="admin-btn-primary" 
                onClick={() => handleSave('Réseaux sociaux')}
                disabled={saving}
              >
                <Save size={16} /> Sauvegarder
              </button>
            </div>
          </div>
        </div>

        {/* Gestion des Administrateurs */}
        <div className="admin-card">
          <div className="admin-card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} className="text-primary" /> Gestion des Administrateurs
            </h3>
          </div>
          
          <div className="form-col" style={{ gap: '1.5rem' }}>
            <p className="text-muted text-sm">Ajouter un nouveau compte administrateur pour gérer la boutique.</p>
            <div className="form-group">
              <label>Email de l'administrateur</label>
              <input type="email" className="admin-input" id="newAdminEmail" placeholder="admin@fassiasecret.com" />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" className="admin-input" id="newAdminPassword" placeholder="••••••••" minLength={6} />
            </div>
            <div>
              <button 
                className="admin-btn-primary" 
                onClick={async () => {
                  const emailInput = document.getElementById('newAdminEmail') as HTMLInputElement;
                  const passwordInput = document.getElementById('newAdminPassword') as HTMLInputElement;
                  if (!emailInput.value || !passwordInput.value) {
                    setToast({ message: "Veuillez remplir tous les champs", type: 'error' });
                    return;
                  }
                  
                  setLoading(true);
                  try {
                    const { api } = await import('./mockData');
                    await api.fetchWithAuth('/auth/register', {
                      method: 'POST',
                      body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
                    });
                    setToast({ message: "Nouvel administrateur créé avec succès !", type: 'success' });
                    emailInput.value = '';
                    passwordInput.value = '';
                  } catch (error: any) {
                    setToast({ message: error.message || "Erreur lors de la création de l'admin", type: 'error' });
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={saving}
              >
                <Plus size={16} /> Ajouter l'administrateur
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
