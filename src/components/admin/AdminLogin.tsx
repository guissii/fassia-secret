import React, { useState } from 'react';
import './AdminLogin.css';
import { publicAssetUrl } from '../../lib/publicUrl';
import { API_URL } from '../../lib/api';

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        sessionStorage.setItem('adminToken', data.token);
        onLogin();
      } else {
        setError(data.message || 'Identifiants incorrects');
        setTimeout(() => setError(''), 2000);
      }
    } catch {
      setError('Erreur de connexion au serveur');
      setTimeout(() => setError(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className={`admin-login-card ${error ? 'shake' : ''}`}>
        <div className="admin-login-header">
          <img src={publicAssetUrl('logo.png')} alt="Fassia Secret Logo" className="admin-login-logo" />
          <h2>Administration</h2>
          <p>Connectez-vous pour gérer votre boutique</p>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fassia-secret.com"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="admin-login-error">{error}</p>}
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Connexion...' : 'Accéder'}
          </button>
        </form>
      </div>
    </div>
  );
}
