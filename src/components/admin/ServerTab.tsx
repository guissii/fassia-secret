import React, { useEffect, useState } from 'react';
import { HardDrive, Cpu, Activity, Clock } from 'lucide-react';

export function ServerTab() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/server', { 
      headers: { 'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}` }
    })
      .then(r => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) return <p>Chargement de l'état du serveur...</p>;

  const memUsage = Math.round(((stats.totalMem - stats.freeMem) / stats.totalMem) * 100);

  return (
    <div className="admin-tab-content">
      <div className="admin-header-flex">
        <h2>État du Serveur (VPS Contabo)</h2>
      </div>

      <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="admin-stat-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6b7280', marginBottom: '10px' }}>
            <Cpu size={20} /> <span>CPU Cores</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.cpus} vCores</div>
        </div>
        
        <div className="admin-stat-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6b7280', marginBottom: '10px' }}>
            <HardDrive size={20} /> <span>RAM (Utilisée)</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{memUsage}%</div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px' }}>
            {((stats.totalMem - stats.freeMem)/1024/1024/1024).toFixed(1)} GB / {(stats.totalMem/1024/1024/1024).toFixed(1)} GB
          </div>
        </div>

        <div className="admin-stat-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6b7280', marginBottom: '10px' }}>
            <Activity size={20} /> <span>Charge CPU (1m, 5m, 15m)</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {stats.loadAvg[0].toFixed(2)}, {stats.loadAvg[1].toFixed(2)}, {stats.loadAvg[2].toFixed(2)}
          </div>
        </div>

        <div className="admin-stat-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6b7280', marginBottom: '10px' }}>
            <Clock size={20} /> <span>Uptime du Serveur</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {Math.floor(stats.uptime / 3600)} Heures
          </div>
        </div>
      </div>
    </div>
  );
}
