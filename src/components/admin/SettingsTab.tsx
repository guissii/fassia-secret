import React, { useState, useEffect } from 'react';
import { Save, Truck, Users, Plus, Eye, EyeOff } from 'lucide-react';
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

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  const handleAddAdmin = async () => {
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setToast({ message: "Veuillez remplir tous les champs", type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await api.fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: adminEmail.trim(), password: adminPassword.trim() })
      });
      setToast({ message: "Nouvel administrateur créé avec succès !", type: 'success' });
      setAdminEmail('');
      setAdminPassword('');
    } catch (error: any) {
      setToast({ message: error.message || "Erreur lors de la création de l'admin", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
              <input type="email" className="admin-input" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="admin@fassiasecret.com" />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="admin-input"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--admin-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <button
                className="admin-btn-primary"
                onClick={handleAddAdmin}
                disabled={saving || loading}
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
