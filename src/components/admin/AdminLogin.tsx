import React, { useState } from 'react';
import './AdminLogin.css';
import { publicAssetUrl } from '../../lib/publicUrl';

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'fassia2024') {
      setError(false);
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 500); // Remove shake animation class
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
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
            />
          </div>
          {error && <p className="admin-login-error">Mot de passe incorrect</p>}
          <button type="submit" className="admin-login-btn">Accéder</button>
        </form>
      </div>
    </div>
  );
}
