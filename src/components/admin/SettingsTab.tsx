import React, { useState } from 'react';
import { Save, Store, Truck, Bell, Share2 } from 'lucide-react';
import { delay } from './mockData';
import { Toast, ToastType } from './shared';

export function SettingsTab() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Settings State
  const [settings, setSettings] = useState({
    storeName: 'Fassia Secret',
    storeEmail: 'contact@fassiasecret.com',
    storePhone: '+212 6 00 00 00 00',
    deliveryFee: 35,
    freeDeliveryThreshold: 500,
    notifyEmail: true,
    notifyWhatsapp: true,
    whatsappNumber: '+212 6 00 00 00 00',
    instagram: 'https://instagram.com/fassiasecret',
    facebook: 'https://facebook.com/fassiasecret',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSave = async (section: string) => {
    setLoading(true);
    await delay(600); // Simulate API call
    setToast({ message: `Paramètres "${section}" sauvegardés avec succès`, type: 'success' });
    setLoading(false);
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
                disabled={loading}
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
                disabled={loading}
              >
                <Save size={16} /> Sauvegarder
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="admin-card">
          <div className="admin-card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={20} className="text-primary" /> Notifications
            </h3>
          </div>
          
          <div className="form-col" style={{ gap: '1.5rem' }}>
            <div className="form-group toggle-group">
              <label className="toggle-label">
                <div>
                  <span style={{ fontWeight: 500 }}>Notifications Email</span>
                  <p className="text-muted text-sm" style={{ margin: 0 }}>Recevoir un email pour chaque nouvelle commande</p>
                </div>
                <div className="switch-wrapper">
                  <input type="checkbox" name="notifyEmail" checked={settings.notifyEmail} onChange={handleChange} />
                  <span className="slider round"></span>
                </div>
              </label>
            </div>
            
            <div className="form-group toggle-group">
              <label className="toggle-label">
                <div>
                  <span style={{ fontWeight: 500 }}>Notifications WhatsApp</span>
                  <p className="text-muted text-sm" style={{ margin: 0 }}>Recevoir un message pour chaque nouvelle commande</p>
                </div>
                <div className="switch-wrapper">
                  <input type="checkbox" name="notifyWhatsapp" checked={settings.notifyWhatsapp} onChange={handleChange} />
                  <span className="slider round"></span>
                </div>
              </label>
            </div>

            {settings.notifyWhatsapp && (
              <div className="form-group" style={{ paddingLeft: '1rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                <label>Numéro WhatsApp de réception</label>
                <input type="text" className="admin-input" name="whatsappNumber" value={settings.whatsappNumber} onChange={handleChange} />
              </div>
            )}
            
            <div>
              <button 
                className="admin-btn-primary" 
                onClick={() => handleSave('Notifications')}
                disabled={loading}
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
                disabled={loading}
              >
                <Save size={16} /> Sauvegarder
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
