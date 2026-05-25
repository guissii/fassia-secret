import React, { useEffect, useState, useCallback } from 'react';
import { HardDrive, Cpu, Activity, Clock, RefreshCw, Server, Wifi, WifiOff, Gauge, MemoryStick, Zap } from 'lucide-react';
import './ServerTab.css';

interface ServerStats {
  cpus: number;
  totalMem: number;
  freeMem: number;
  uptime: number;
  loadAvg: number[];
  hostname?: string;
  platform?: string;
}

export function ServerTab() {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/server', {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      setStats(data);
      setError(false);
      setLastUpdate(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(), 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="server-tab">
        <div className="server-loading">
          <div className="server-loading-spinner" />
          <p>Connexion au serveur...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="server-tab">
        <div className="server-error">
          <WifiOff size={48} />
          <h3>Serveur injoignable</h3>
          <p>Impossible de récupérer les données du serveur.</p>
          <button className="server-retry-btn" onClick={() => { setLoading(true); fetchStats(); }}>
            <RefreshCw size={16} /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  const memUsed = stats.totalMem - stats.freeMem;
  const memPercent = Math.round((memUsed / stats.totalMem) * 100);
  const memUsedGB = (memUsed / 1024 / 1024 / 1024).toFixed(1);
  const memTotalGB = (stats.totalMem / 1024 / 1024 / 1024).toFixed(1);

  const uptimeHours = Math.floor(stats.uptime / 3600);
  const uptimeDays = Math.floor(uptimeHours / 24);
  const uptimeRemainingHours = uptimeHours % 24;
  const uptimeMinutes = Math.floor((stats.uptime % 3600) / 60);

  const uptimeDisplay = uptimeDays > 0
    ? `${uptimeDays}j ${uptimeRemainingHours}h`
    : uptimeHours > 0
      ? `${uptimeHours}h ${uptimeMinutes}m`
      : `${uptimeMinutes}m`;

  const cpuLoad1m = stats.loadAvg[0];
  const cpuLoadPercent = Math.min(Math.round((cpuLoad1m / stats.cpus) * 100), 100);

  const getMemColor = (percent: number) => {
    if (percent < 50) return '#10b981';
    if (percent < 75) return '#f59e0b';
    return '#ef4444';
  };

  const getCpuColor = (percent: number) => {
    if (percent < 40) return '#10b981';
    if (percent < 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="server-tab">
      {/* Header */}
      <div className="server-header">
        <div className="server-header-left">
          <div className="server-title-row">
            <div className="server-status-dot" />
            <h2>Monitoring Serveur</h2>
          </div>
          <p className="server-subtitle">
            VPS Contabo • {stats.hostname || 'vmi3323498'} • {stats.platform || 'linux'}
          </p>
        </div>
        <div className="server-header-right">
          {lastUpdate && (
            <span className="server-last-update">
              Mis à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
            </span>
          )}
          <button
            className={`server-refresh-btn ${refreshing ? 'spinning' : ''}`}
            onClick={() => fetchStats(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="server-grid">
        {/* CPU Card */}
        <div className="server-card server-card-cpu">
          <div className="server-card-header">
            <div className="server-card-icon cpu-icon">
              <Cpu size={20} />
            </div>
            <span className="server-card-label">Processeur</span>
          </div>
          <div className="server-card-body">
            <div className="server-gauge-container">
              <svg viewBox="0 0 120 120" className="server-gauge">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke={getCpuColor(cpuLoadPercent)}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(cpuLoadPercent / 100) * 326.7} 326.7`}
                  transform="rotate(-90 60 60)"
                  className="server-gauge-fill"
                />
              </svg>
              <div className="server-gauge-text">
                <span className="server-gauge-value">{cpuLoadPercent}%</span>
                <span className="server-gauge-sublabel">charge</span>
              </div>
            </div>
            <div className="server-card-details">
              <div className="server-detail-row">
                <span>Cœurs</span>
                <span className="server-detail-value">{stats.cpus} vCPU</span>
              </div>
              <div className="server-detail-row">
                <span>Charge 1m</span>
                <span className="server-detail-value">{stats.loadAvg[0].toFixed(2)}</span>
              </div>
              <div className="server-detail-row">
                <span>Charge 5m</span>
                <span className="server-detail-value">{stats.loadAvg[1].toFixed(2)}</span>
              </div>
              <div className="server-detail-row">
                <span>Charge 15m</span>
                <span className="server-detail-value">{stats.loadAvg[2].toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Memory Card */}
        <div className="server-card server-card-mem">
          <div className="server-card-header">
            <div className="server-card-icon mem-icon">
              <MemoryStick size={20} />
            </div>
            <span className="server-card-label">Mémoire RAM</span>
          </div>
          <div className="server-card-body">
            <div className="server-gauge-container">
              <svg viewBox="0 0 120 120" className="server-gauge">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke={getMemColor(memPercent)}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(memPercent / 100) * 326.7} 326.7`}
                  transform="rotate(-90 60 60)"
                  className="server-gauge-fill"
                />
              </svg>
              <div className="server-gauge-text">
                <span className="server-gauge-value">{memPercent}%</span>
                <span className="server-gauge-sublabel">utilisée</span>
              </div>
            </div>
            <div className="server-card-details">
              <div className="server-detail-row">
                <span>Utilisée</span>
                <span className="server-detail-value">{memUsedGB} GB</span>
              </div>
              <div className="server-detail-row">
                <span>Total</span>
                <span className="server-detail-value">{memTotalGB} GB</span>
              </div>
              <div className="server-detail-row">
                <span>Libre</span>
                <span className="server-detail-value">{(stats.freeMem / 1024 / 1024 / 1024).toFixed(1)} GB</span>
              </div>
            </div>
          </div>
          {/* Memory Bar */}
          <div className="server-mem-bar-container">
            <div className="server-mem-bar">
              <div
                className="server-mem-bar-fill"
                style={{ width: `${memPercent}%`, background: getMemColor(memPercent) }}
              />
            </div>
            <div className="server-mem-bar-labels">
              <span>{memUsedGB} GB utilisée</span>
              <span>{memTotalGB} GB total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info Cards */}
      <div className="server-info-grid">
        {/* Uptime */}
        <div className="server-info-card">
          <div className="server-info-icon uptime-icon">
            <Clock size={22} />
          </div>
          <div className="server-info-content">
            <span className="server-info-label">Uptime</span>
            <span className="server-info-value">{uptimeDisplay}</span>
            <span className="server-info-sub">
              {uptimeDays > 0 ? `${uptimeDays} jours, ${uptimeRemainingHours} heures` : `${uptimeHours} heures, ${uptimeMinutes} minutes`}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="server-info-card">
          <div className="server-info-icon status-icon">
            <Wifi size={22} />
          </div>
          <div className="server-info-content">
            <span className="server-info-label">Statut</span>
            <span className="server-info-value server-online">● En ligne</span>
            <span className="server-info-sub">Tous les services actifs</span>
          </div>
        </div>

        {/* Performance */}
        <div className="server-info-card">
          <div className="server-info-icon perf-icon">
            <Zap size={22} />
          </div>
          <div className="server-info-content">
            <span className="server-info-label">Performance</span>
            <span className="server-info-value">
              {cpuLoadPercent < 40 ? '🟢 Excellente' : cpuLoadPercent < 70 ? '🟡 Normale' : '🔴 Élevée'}
            </span>
            <span className="server-info-sub">
              {cpuLoadPercent < 40 ? 'Le serveur est au repos' : cpuLoadPercent < 70 ? 'Charge modérée' : 'Charge élevée, surveillez'}
            </span>
          </div>
        </div>

        {/* Server Info */}
        <div className="server-info-card">
          <div className="server-info-icon server-icon">
            <Server size={22} />
          </div>
          <div className="server-info-content">
            <span className="server-info-label">Infrastructure</span>
            <span className="server-info-value">{stats.cpus} vCPU / {memTotalGB} GB</span>
            <span className="server-info-sub">Contabo VPS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
